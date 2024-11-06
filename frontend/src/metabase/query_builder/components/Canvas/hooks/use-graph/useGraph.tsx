import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
// import { useToast } from "../use-toast";
import { createClient } from "../utils";
import { v4 as uuidv4 } from "uuid";
import {
  ArtifactLengthOptions,
  ArtifactType,
  ArtifactV3,
  LanguageOptions,
  ProgrammingLanguageOptions,
  ReadingLevelOptions,
  ArtifactToolResponse,
  RewriteArtifactMetaToolResponse,
  TextHighlight,
  CodeHighlight,
} from "../../types"
import { ChatCardApi } from "metabase/services";
import { getDBInputValue, getInsightDBInputValue } from "metabase/redux/initialDb";
import { parsePartialJson } from "@langchain/core/output_parsers";
import { useRuns } from "../useRuns";
import { reverseCleanContent } from "../../lib/normalize_string";
import { Thread } from "@langchain/langgraph-sdk";
import { setCookie } from "../../lib/cookies";
import { DEFAULT_INPUTS, THREAD_ID_COOKIE_NAME } from "../../constants";
import {
  convertToArtifactV3,
  createNewGeneratedArtifactFromTool,
  replaceOrInsertMessageChunk,
  updateHighlightedCode,
  updateHighlightedMarkdown,
  updateRewrittenArtifact,
} from "./utils";
import {
  isArtifactCodeContent,
  isArtifactMarkdownContent,
  isDeprecatedArtifactType,
} from "../../lib/artifact_content_types"
import { debounce } from "lodash";
import toast from "react-hot-toast";
import Question from "metabase-lib/v1/Question";
import { CardApi } from "metabase/services";
import { question } from "metabase/lib/urls";
import { useSelector } from "metabase/lib/redux";
import { getInitialSchema } from "metabase/redux/initialSchema";
// import { DEFAULT_ARTIFACTS, DEFAULT_MESSAGES } from "@/lib/dummy";
import { useSetting } from "metabase/common/hooks";

export interface GraphInput {
  messages?: Record<string, any>[];

  highlightedCode?: CodeHighlight;
  highlightedText?: TextHighlight;

  artifact?: ArtifactV3;

  language?: LanguageOptions;
  artifactLength?: ArtifactLengthOptions;
  regenerateWithEmojis?: boolean;
  readingLevel?: ReadingLevelOptions;

  addComments?: boolean;
  addLogs?: boolean;
  portLanguage?: ProgrammingLanguageOptions;
  fixBugs?: boolean;
  customQuickActionId?: string;
}

function removeCodeBlockFormatting(text: string): string {
  if (!text) return text;
  // Regular expression to match code blocks
  const codeBlockRegex = /^```[\w-]*\n([\s\S]*?)\n```$/;

  // Check if the text matches the code block pattern
  const match = text.match(codeBlockRegex);

  if (match) {
    // If it matches, return the content inside the code block
    return match[1].trim();
  } else {
    // If it doesn't match, return the original text
    return text;
  }
}

export interface UseGraphInput {
  userId: string;
  threadId: string | undefined;
  assistantId: string | undefined;
  setCard: Dispatch<SetStateAction<any>>;
  setCardHash: Dispatch<SetStateAction<any>>;
  setDefaultQuestion: Dispatch<SetStateAction<any>>;
  setResult: Dispatch<SetStateAction<any>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setInsightsImg: Dispatch<SetStateAction<any>>;
  setInsightsText: Dispatch<SetStateAction<any>>;
  setInsightsCode: Dispatch<SetStateAction<any>>;
  setInsightsResult: Dispatch<SetStateAction<any>>;
  setWholeInsights: Dispatch<SetStateAction<any>>;
  setSqlQuery: Dispatch<SetStateAction<any[]>>;
}

export function useGraph(useGraphInput: UseGraphInput) {
  // const { toast } = useToast();
  const siteName = useSetting("site-name");
  const initialSchema = useSelector(getInitialSchema);
  // const [card, setCard] = useState<any>([]);
  // const [cardHash, setCardHash] = useState<any>([]);
  // const [result, setResult] = useState<any>([]);
  // const [defaultQuestion, setDefaultQuestion] = useState<any>([]);
  const formattedSiteName = siteName
    ? siteName.replace(/\s+/g, "_").toLowerCase()
    : "";
  const initialDbName = useSelector(getDBInputValue);
  const initialCompanyName = formattedSiteName;
  const { shareRun } = useRuns();
  const [modelSchema, setModelSchema] = useState([])
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [artifact, setArtifact] = useState<ArtifactV3>();
  const [selectedBlocks, setSelectedBlocks] = useState<TextHighlight>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [updateRenderedArtifactRequired, setUpdateRenderedArtifactRequired] =
    useState(false);
  const lastSavedArtifact = useRef<ArtifactV3 | undefined>(undefined);
  const debouncedAPIUpdate = useRef(
    debounce(
      (artifact: ArtifactV3, threadId: string) =>
        updateArtifact(artifact, threadId),
      5000
    )
  ).current;
  const [sqlQuery, setSqlQuery] = useState([])
  const [isArtifactSaved, setIsArtifactSaved] = useState(true);
  const [threadSwitched, setThreadSwitched] = useState(false);
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const [loading, setLoading] = useState(true);
  // Very hacky way of ensuring updateState is not called when a thread is switched
  useEffect(() => {
    if (threadSwitched) {
      const timer = setTimeout(() => {
        setThreadSwitched(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [threadSwitched]);

  useEffect(() => {
    return () => {
      debouncedAPIUpdate.cancel();
    };
  }, [debouncedAPIUpdate]);

  useEffect(() => {
    if (!messages.length || !artifact || !useGraphInput.threadId) return;
    if (updateRenderedArtifactRequired || threadSwitched || isStreaming) return;
    const currentIndex = artifact.currentIndex;
    const currentContent = artifact.contents.find(
      (c) => c.index === currentIndex
    );
    if (!currentContent) return;
    if (
      (artifact.contents.length === 1 &&
        artifact.contents[0].type === "text" &&
        !artifact.contents[0].fullMarkdown) ||
      (artifact.contents[0].type === "code" && !artifact.contents[0].code)
    ) {
      // If the artifact has only one content and it's empty, we shouldn't update the state
      return;
    }

    if (
      !lastSavedArtifact.current ||
      lastSavedArtifact.current.contents !== artifact.contents
    ) {
      setIsArtifactSaved(false);
      // This means the artifact in state does not match the last saved artifact
      // We need to update
      debouncedAPIUpdate(artifact, useGraphInput.threadId);
    }
  }, [artifact]);

  function adhocQuestionHash(question: any): string {
    if (question.display) {
      // without "locking" the display, the QB will run its picking logic and override the setting
      question = Object.assign({}, question, { displayIsLocked: true });
    }
    return btoa(decodeURIComponent(encodeURIComponent(JSON.stringify(question))));
  }

  useEffect(() => {
    const getCards = async () => {
      try {
        const cardsList = await CardApi.list();
        const modelCards = cardsList
          .filter((card: any) => card.type === "model")
          .map((card: any) => ({
            id: `card__${card.id}`,
            model_schema: (card.result_metadata || []).map((metadata: any) => {
              const { field_ref, ...rest } = metadata;
              return rest;
            }),
            name: card.name,
            description: card.description
          }));

        setModelSchema(modelCards);
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };

    getCards();
  }, []);



  const updateArtifact = async (
    artifactToUpdate: ArtifactV3,
    threadId: string
  ) => {
    if (isStreaming) return;
    try {
      const client = createClient();
      await client.threads.updateState(threadId, {
        values: {
          artifact: artifactToUpdate,
        },
      });
      setIsArtifactSaved(true);
      lastSavedArtifact.current = artifactToUpdate;
    } catch (e) {
      console.error("Failed to update artifact", e);
      console.error("Artifact:", artifactToUpdate);
    }
  };

  const clearState = () => {
    setMessages([]);
    setArtifact(undefined);
    setFirstTokenReceived(true);
  };

  const streamMessageV2 = async (params: GraphInput) => {
    setFirstTokenReceived(false);

    if (!useGraphInput.threadId || !useGraphInput.assistantId) {
      toast.error("Thread ID or Assistant ID not found");
      return;
    }

    const client = createClient();

    const input = {
      ...DEFAULT_INPUTS,
      artifact,
      ...params,
      ...(selectedBlocks && { highlightedText: selectedBlocks }),
    };

    const inputMessageContent = input.messages?.[0]?.content || "";

    const fieldsToCheck = [
      input.highlightedCode,
      input.highlightedText,
      input.language,
      input.artifactLength,
      input.regenerateWithEmojis,
      input.readingLevel,
      input.addComments,
      input.addLogs,
      input.fixBugs,
      input.portLanguage,
      input.customQuickActionId,
    ];

    if (fieldsToCheck.filter((field) => field !== undefined).length >= 2) {
      toast.error("Only one field (highlight, language, etc.) allowed");
      return;
    }

    setIsStreaming(true);
    let runId = "";
    let followupMessageId = "";
    let aiMessageContent = "";
    const processedMessageIds = new Set<string>(); // Track unique message IDs to prevent duplicates
    const addedCardIds = new Set<string>(); // Track unique cardIds to prevent duplicates in artifacts
    const addedCodes = new Set<string>();
    const addedExplanation = new Set<string>();
    const addedImages = new Set<string>();
    const addedInsightImages = new Set<string>();
    const addedInsightText = new Set<string>();
    const addedInsightError = new Set<string>();
    const textSet: any = []
    try {
      const stream = client.runs.stream(useGraphInput.threadId, useGraphInput.assistantId, {
        input: { ...input, company_name: initialCompanyName, database_id: initialDbName, schema: modelSchema },
        streamMode: "events",
      });

      for await (const chunk of stream) {
        const eventData = chunk?.data;

        if (!runId && eventData?.metadata?.run_id) {
          runId = eventData.metadata.run_id;
        }

        if (eventData?.event === "on_chat_model_stream") {
          if (eventData.metadata.langgraph_node === "generateArtifact") {
            const messageChunk = eventData.data.chunk?.[1]?.content || "";

            if (!messageChunk.includes(inputMessageContent)) {
              aiMessageContent += messageChunk;
            }
          }
        }

        if (eventData?.event === "on_chain_end") {
          console.log("CHUNK", chunk)
          const outputMessages = eventData?.data?.output?.messages;
          const images: string[] = eventData?.data?.output?.image_outputs;
          const textResult: string[] = eventData?.data?.output?.text_outputs;
          console.log("TEXT RESULTsssssssssssssssssssssssssss", textResult)
          if (outputMessages) {
            outputMessages.forEach(async (msg: any) => {
              const messageContent = Array.isArray(msg.content)
                ? msg.content.map((item: any) => item.text).join('')
                : msg.content || '';

              if (messageContent.includes(inputMessageContent)) return;

              if (msg.type === "tool" && msg.name === "create_card_tool") {
                try {
                  const cardData = JSON.parse(msg.content);
                  const cardId = cardData?.card_id;

                  if (cardId && !addedCardIds.has(cardId)) {  // Add only if cardId is unique
                    addedCardIds.add(cardId);
                    const cardData = await handleGetDatasetQuery(cardId);
                    setArtifact((prevArtifact) => {
                      if (prevArtifact?.contents.some((content: any) => content.cardId === cardId)) {
                        return prevArtifact;  // Skip if cardId already exists
                      }

                      return {
                        ...prevArtifact,
                        currentIndex: (prevArtifact?.contents.length || 0) + 1,
                        contents: [
                          ...(prevArtifact?.contents || []),
                          {
                            index: (prevArtifact?.contents.length || 0) + 1,
                            type: "card",
                            title: cardData.name || `Card ID: ${cardId}`,
                            description: cardData.description,
                            cardId: cardId,
                          } as any,
                        ],
                      };
                    });
                  }
                } catch (e) {
                  console.error("Failed to parse card data:", e);
                }
              }
              else if (msg.type === "tool" && msg.name === "create_and_run_jupy_cell_code") {
                try {
                  const codeData = JSON.parse(msg.content);
                  const newInsights: any = [];
                  const explanation = codeData?.explanation
                  const pythonCode = codeData?.python_code
                  const result = codeData?.result
                  if (useGraphInput.threadId && runId) {
                    const streamStatus = await client.runs.get(useGraphInput.threadId, runId);
                    // console.log("STREAM STATUS", streamStatus)
                    // if(streamStatus && streamStatus.status === 'success') {
                    //   console.log("RESULT AFTER STREAM FINISHED",result)
                    //   if (result && result.outputs && result.outputs.length > 0) {
                    //     result.outputs.forEach((output:any, index:number) => {
                    //       if (output.data) {
                    //         if (output.data['text/plain']) {
                    //           const plainText = output.data['text/plain'];
                    //           if (!plainText.includes('<Figure size') && !plainText.includes('Axes>')) {
                    //               useGraphInput.setInsightsResult((prevInsightResult:any) => [
                    //                   ...prevInsightResult,
                    //                   { type: 'text', value: plainText }
                    //               ]);
                    //           }
                    //       }
                    //             if (output.data['image/png']) {
                    //                   const generatedImages = output.data['image/png'];
                    //                   if (typeof generatedImages) {
                    //                           useGraphInput.setInsightsResult((prevInsightResult:any) => [
                    //                               ...prevInsightResult,
                    //                               { type: 'image', value: generatedImages }
                    //                           ]);
                    //                   }
                    //               }
                    //           if (output.evalue) {
                    //             const evalue = output.evalue;
                    //             if(evalue) {
                    //                 useGraphInput.setInsightsResult((prevInsightResult:any) => [
                    //                     ...prevInsightResult,
                    //                     { type: 'error', error: evalue }
                    //                 ]);
                    //             }
                    //         }
                    //         if (output.text) {
                    //             const text = output.text;
                    //             if(text) {
                    //                 newInsights.push({ type: 'error', error: text });
                    //                 useGraphInput.setInsightsResult((prevInsightResult:any) => [
                    //                     ...prevInsightResult,
                    //                     { type: 'error', error: text }
                    //                 ]);
                    //             }
                    //         } 
                    //       }
                    //     })
                    //   }
                    // }
                  }
                  if (result) {
                    textSet.push(result);
                  }

                  if (pythonCode && explanation && !(addedCodes.has(pythonCode)) && !(addedExplanation.has(explanation))) {
                    addedCodes.add(pythonCode)
                    addedExplanation.add(explanation)
                    newInsights.push(
                      { type: 'explanation', value: explanation },
                      { type: 'code', value: pythonCode }
                    );
                    useGraphInput.setInsightsText((prevText: any) => [...prevText, explanation]);
                    useGraphInput.setInsightsCode((prevCode: any) => [...prevCode, pythonCode]);
                    setArtifact((prevArtifact) => {
                      // const isCodeExists = prevArtifact?.contents.some((content: any) => content.code === pythonCode);
                      // const isExplanationExists = prevArtifact?.contents.some((content: any) => content.explanation === explanation);

                      // if (isCodeExists || isExplanationExists) {
                      //   return prevArtifact; // Skip if either exists
                      // }
                      if (prevArtifact?.contents.some((content: any) => content.type === "insight")) {
                        return prevArtifact;  // Skip if image type already exists
                      }

                      return {
                        ...prevArtifact,
                        currentIndex: (prevArtifact?.contents.length || 0) + 1,
                        contents: [
                          ...(prevArtifact?.contents || []),
                          {
                            index: (prevArtifact?.contents.length || 0) + 1,
                            type: "insight",
                            title: `Result:`,
                            insight: pythonCode,
                          } as any,
                        ],
                      };
                    });
                  }
                } catch (e) {
                  console.error("Failed to parse card data:", e);
                }
              }
              else if (messageContent && !processedMessageIds.has(msg.id)) {
                const aiMessage = new AIMessage({
                  content: messageContent,
                  id: msg.id,
                });
                setMessages((prevMessages) => [...prevMessages, aiMessage]);
                processedMessageIds.add(msg.id);
              }
            });
          }
          if (images && images.length > 0) {
            images.forEach((image) => {
              if (!addedImages.has(image)) {
                // Add the image to the addedImages set to prevent duplicates
                addedImages.add(image);
                const base64Image = `data:image/png;base64,${image}`;
                useGraphInput.setInsightsImg((prevImages: any) => [...prevImages, base64Image]);
                useGraphInput.setInsightsResult((prevInsightResult: any) => [
                  ...prevInsightResult,
                  { type: 'image', value: base64Image }
                ]);
              }
            });
          }
          if (textResult && textResult.length > 0) {
            textResult.forEach((text) => {
              if (!addedInsightText.has(text) && !text.includes('<Figure size') && !text.includes('Axes>')) {
                addedInsightText.add(text);
                useGraphInput.setInsightsResult((prevInsightResult: any) => [
                  ...prevInsightResult,
                  { type: 'text', value: text }
                ]);
              }
            });
          }
        }
      }

      if (aiMessageContent && !aiMessageContent.includes(inputMessageContent)) {
        const finalAiMessage: any = new AIMessage({
          content: aiMessageContent,
          id: uuidv4(),
        });
        if (!processedMessageIds.has(finalAiMessage.id)) {
          setMessages((prevMessages) => [...prevMessages, finalAiMessage]);
        }
      }
    } catch (error) {
      console.error("Error streaming message:", error);
    } finally {
      setIsStreaming(false);
      console.log("TEXT SET", textSet)
      setSelectedBlocks(undefined);
    }

    // if (runId) {
    //   shareRun(runId).then(async (sharedRunURL) => {
    //     if (!sharedRunURL) {
    //       console.warn("Shared run URL is undefined.");
    //       return;
    //     }

    //     setMessages((prevMessages) =>
    //       prevMessages.map((msg) => {
    //         if (
    //           msg.id === followupMessageId &&
    //           msg instanceof AIMessage &&
    //           !msg.additional_kwargs?.tool_calls?.find((tc: any) => tc.id === sharedRunURL)
    //         ) {
    //           const toolCall: any = {
    //             id: sharedRunURL.split("https://smith.langchain.com/public/")[1]?.split("/")[0] || "",
    //             function: {
    //               name: "langsmith_tool_ui",
    //               arguments: JSON.stringify({ sharedRunURL }),
    //             },
    //             type: "function",
    //           };

    //           return new AIMessage({
    //             ...msg,
    //             content: msg.content,
    //             id: msg.id,
    //             additional_kwargs: {
    //               ...msg.additional_kwargs,
    //               tool_calls: msg.additional_kwargs?.tool_calls ? [...msg.additional_kwargs.tool_calls, toolCall] : [toolCall],
    //             },
    //           });
    //         }
    //         return msg;
    //       })
    //     );
    //   }).catch((e) => console.error("Error sharing run:", e));
    // }
  };

  const handleGetDatasetQuery = async (cardId: number) => {

    try {
      // Fetch the card details using the provided cardId
      // Fetch the card details using the provided cardId
      const fetchedCard = await ChatCardApi.get({ cardId });
      const queryCard = await ChatCardApi.query({ cardId });
      const getDatasetQuery = fetchedCard?.dataset_query;

      if (!getDatasetQuery) {
        throw new Error("No dataset query found for this card.");
      }

      // Create a new question object based on the fetched card's dataset query
      const newQuestion = Question.create({
        databaseId: getDatasetQuery.database,
        name: fetchedCard.name,
        type: fetchedCard.query_type,
        display: fetchedCard.display,
        visualization_settings: {},
        dataset_query: getDatasetQuery,
        isExample: false
      });

      // Generate a unique hash for this question
      let itemToHash;
      if (fetchedCard.query_type === "query") {
        itemToHash = {
          dataset_query: {
            database: getDatasetQuery.database,
            type: getDatasetQuery.type,
            query: getDatasetQuery.query
          },

          display: fetchedCard.display,
          visualization_settings: {},
          type: "question",
        };
      } else {
        itemToHash = {
          dataset_query: {
            database: getDatasetQuery.database,
            type: getDatasetQuery.type,
            native: getDatasetQuery.native
          },

          display: fetchedCard.display,
          visualization_settings: {},
          type: "question",
        };
      }
      const hash = adhocQuestionHash(itemToHash);
      // Append new values safely by ensuring prevCard is always an array
      useGraphInput.setCard((prevCard: any) => Array.isArray(prevCard) ? [...prevCard, { ...fetchedCard, hash, typeQuery: getDatasetQuery.type }] : [{ ...fetchedCard, hash, typeQuery: getDatasetQuery.type }]);
      useGraphInput.setDefaultQuestion((prevDefaultQuestion: any) => Array.isArray(prevDefaultQuestion) ? [...prevDefaultQuestion, newQuestion] : [newQuestion]);
      useGraphInput.setResult((prevResult: any) => Array.isArray(prevResult) ? [...prevResult, queryCard] : [queryCard]);
      useGraphInput.setCardHash((prevCardHash: any) => Array.isArray(prevCardHash) ? [...prevCardHash, hash] : [hash]);

      return fetchedCard;
    } catch (error) {
      console.error("Error fetching card content:", error);
    } finally {
      setLoading(false);
    }
    return undefined;
  };

  const setSelectedArtifact = (index: number) => {
    setUpdateRenderedArtifactRequired(true);
    setThreadSwitched(true);

    setArtifact((prev) => {
      if (!prev) {
        // toast({
        //   title: "Error",
        //   description: "No artifactV2 found",
        //   variant: "destructive",
        //   duration: 5000,
        // });
        return prev;
      }
      const newArtifact = {
        ...prev,
        currentIndex: index,
      };
      lastSavedArtifact.current = newArtifact;
      return newArtifact;
    });
  };

  const setArtifactContent = (index: number, content: string) => {
    setArtifact((prev) => {
      if (!prev) {
        // toast({
        //   title: "Error",
        //   description: "No artifact found",
        //   variant: "destructive",
        //   duration: 5000,
        // });
        return prev;
      }
      const newArtifact = {
        ...prev,
        currentIndex: index,
        contents: prev.contents.map((a) => {
          if (a.index === index && a.type === "code") {
            return {
              ...a,
              code: reverseCleanContent(content),
            };
          }
          return a;
        }),
      };
      return newArtifact;
    });
  };

  const switchSelectedThread = (
    thread: Thread,
    setThreadId: (id: string) => void
  ) => {
    setUpdateRenderedArtifactRequired(true);
    setThreadSwitched(true);
    setThreadId(thread.thread_id);
    setCookie(THREAD_ID_COOKIE_NAME, thread.thread_id);

    const castValues: {
      artifact: ArtifactV3 | undefined;
      messages: Record<string, any>[] | undefined;
    } = {
      artifact: undefined,
      messages: (thread.values as Record<string, any>)?.messages || undefined,
    };
    const castThreadValues = thread.values as Record<string, any>;
    if (castThreadValues?.artifact) {
      if (isDeprecatedArtifactType(castThreadValues.artifact)) {
        castValues.artifact = convertToArtifactV3(castThreadValues.artifact);
      } else {
        castValues.artifact = castThreadValues.artifact;
      }
    } else {
      castValues.artifact = undefined;
    }
    lastSavedArtifact.current = castValues?.artifact;

    if (!castValues?.messages?.length) {
      setMessages([]);
      setArtifact(castValues?.artifact);
      return;
    }
    setArtifact(castValues?.artifact);
    setMessages(
      castValues.messages.map((msg: Record<string, any>) => {
        if (msg.response_metadata?.langSmithRunURL) {
          msg.tool_calls = msg.tool_calls ?? [];
          msg.tool_calls.push({
            name: "langsmith_tool_ui",
            args: { sharedRunURL: msg.response_metadata.langSmithRunURL },
            id: msg.response_metadata.langSmithRunURL
              ?.split("https://smith.langchain.com/public/")[1]
              .split("/")[0],
          });
        }
        return msg as BaseMessage;
      })
    );
  };

  return {
    isStreaming,
    selectedBlocks,
    messages,
    artifact,
    setArtifact,
    setSelectedBlocks,
    setSelectedArtifact,
    setMessages,
    streamMessage: streamMessageV2,
    setArtifactContent,
    clearState,
    switchSelectedThread,
    updateRenderedArtifactRequired,
    setUpdateRenderedArtifactRequired,
    isArtifactSaved,
    firstTokenReceived,
    sqlQuery
    // card, 
    // result,
    // defaultQuestion
  };
}
