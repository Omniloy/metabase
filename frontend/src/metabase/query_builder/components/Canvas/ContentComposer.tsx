import React, { useState, Dispatch, SetStateAction, useEffect } from "react";
import {
  AppendMessage,
  AssistantRuntimeProvider,
  ThreadAssistantContentPart,
  ToolCallContentPart,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { v4 as uuidv4 } from "uuid";
import { Thread } from "./Primitives";
import { useExternalMessageConverter } from "@assistant-ui/react";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  convertLangchainMessages,
  convertToOpenAIFormat,
} from "./lib/convert_messages"
import { GraphInput } from "./hooks/use-graph/useGraph";
import { Toaster } from "./ui/toaster";
import { ArtifactV3, ProgrammingLanguageOptions, Reflections } from "./types"
import { Thread as ThreadType } from "@langchain/langgraph-sdk";
import { CardApi, ChatCardApi } from "metabase/services";
import Question from "metabase-lib/v1/Question";

export interface ContentComposerChatInterfaceProps {
  messages: BaseMessage[];
  streamMessage: (input: GraphInput) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<BaseMessage[]>>;
  createThread: () => Promise<ThreadType | undefined>;
  setChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  showNewThreadButton: boolean;
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  isLoadingReflections: boolean;
  reflections: (Reflections & { updatedAt: Date }) | undefined;
  handleDeleteReflections: () => Promise<boolean>;
  handleGetReflections: () => Promise<void>;
  isUserThreadsLoading: boolean;
  userThreads: ThreadType[];
  switchSelectedThread: (thread: ThreadType) => void;
  deleteThread: (id: string) => Promise<void>;
  getUserThreads: (id: string) => Promise<void>;
  userId: string;
  setArtifact: Dispatch<SetStateAction<ArtifactV3 | undefined>>;
  setCard: Dispatch<SetStateAction<any>>;
  setCardHash: Dispatch<SetStateAction<any>>;
  setDefaultQuestion: Dispatch<SetStateAction<any>>;
  setResult: Dispatch<SetStateAction<any>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  sqlQuery?: any;
  errorMessage?: string;
}

export function ContentComposerChatInterface(
  props: ContentComposerChatInterfaceProps
): React.ReactElement {
  // const { toast } = useToast();
  const { messages, setMessages, streamMessage } = props;
  const [isRunning, setIsRunning] = useState(false);

  // Inside your ContentComposerChatInterface component
  async function onNew(message: AppendMessage): Promise<void> {
    if (message.content?.[0]?.type !== "text") {
      // toast({
      //   title: "Only text messages are supported",
      //   variant: "destructive",
      // });
      return;
    }
    props.setChatStarted(true);
    setIsRunning(true);

    try {
      const humanMessage = new HumanMessage({
        content: message.content[0].text,
        id: uuidv4(),
      });

      setMessages((prevMessages) => [...prevMessages, humanMessage]);

      await streamMessage({
        messages: [convertToOpenAIFormat(humanMessage)],
      });
    } finally {
      setIsRunning(false);
      // Re-fetch threads so that the current thread's title is updated.
      await props.getUserThreads(props.userId);
    }
  }

  function isMessageContentWithArgs(item: ThreadAssistantContentPart): item is ToolCallContentPart {
    return item.type === 'tool-call' && 'args' in item;
  }

  const threadMessages = useExternalMessageConverter<BaseMessage>({
    callback: convertLangchainMessages,
    messages: messages,
    isRunning,
  });

  useEffect(() => {
    const fetchHistoricalMessages = async () => {
      props.setCard([])
      props.setResult([])
      props.setDefaultQuestion([])
      const addedCardIds = new Set<string>(); // Track unique cardIds to prevent duplicates in artifacts
      const addedCodes = new Set<string>();
      const addedExplanation = new Set<string>();

      for (const message of threadMessages) {
        if (message.role === "assistant") {
          for (const contentItem of message.content) {
            if (isMessageContentWithArgs(contentItem)) {
              try {
                const cardData = JSON.parse(contentItem.result as string);
                const cardId = cardData?.card_id;

                const explanation = cardData?.explanation;
                const pythonCode = cardData?.python_code;

                if (cardId && !addedCardIds.has(cardId)) {
                  addedCardIds.add(cardId);
                  const cardData = await handleGetDatasetQuery(cardId);
                  props.setArtifact((prevArtifact: any) => {
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
                } else if (pythonCode && explanation && !(addedCodes.has(pythonCode)) && !(addedExplanation.has(explanation))) {
                  addedCodes.add(pythonCode);
                  addedExplanation.add(explanation);
                  props.setArtifact((prevArtifact) => {
                    const isCodeExists = prevArtifact?.contents.some((content: any) => content.code === pythonCode);
                    const isExplanationExists = prevArtifact?.contents.some((content: any) => content.explanation === explanation);

                    if (isCodeExists || isExplanationExists) {
                      return prevArtifact; // Skip if either exists
                    }

                    return {
                      ...prevArtifact,
                      currentIndex: (prevArtifact?.contents.length || 0) + 1,
                      contents: [
                        ...(prevArtifact?.contents || []),
                        {
                          index: (prevArtifact?.contents.length || 0) + 1,
                          type: "code",
                          title: `Exp: ${explanation}`,
                          code: pythonCode,
                          language: "python",
                        } as any,
                      ],
                    };
                  });
                }
              } catch (e) {
                console.error("Failed to parse card data:", e);
              }
            }
          }
        }
      }
    };

    // Run the function when the component mounts or when threadMessages change
    if (threadMessages.length > 0) {
      fetchHistoricalMessages();
    }
  }, [threadMessages]);

  function adhocQuestionHash(question: any): string {
    if (question.display) {
      // without "locking" the display, the QB will run its picking logic and override the setting
      question = Object.assign({}, question, { displayIsLocked: true });
    }
    return btoa(decodeURIComponent(encodeURIComponent(JSON.stringify(question))));
  }

  const handleGetDatasetQuery = async (cardId: number) => {

    try {
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
      props.setCard((prevCard: any) => Array.isArray(prevCard) ? [...prevCard, { ...fetchedCard, hash, typeQuery: getDatasetQuery.type }] : [{ ...fetchedCard, hash, typeQuery: getDatasetQuery.type }]);
      props.setDefaultQuestion((prevDefaultQuestion: any) => Array.isArray(prevDefaultQuestion) ? [...prevDefaultQuestion, newQuestion] : [newQuestion]);
      props.setResult((prevResult: any) => Array.isArray(prevResult) ? [...prevResult, queryCard] : [queryCard]);
      props.setCardHash((prevCardHash: any) => Array.isArray(prevCardHash) ? [...prevCardHash, hash] : [hash]);

      return fetchedCard;
    } catch (error) {
      console.error("Error fetching card content:", error);
    } finally {
      props.setLoading(false);
    }
  };

  const runtime = useExternalStoreRuntime({
    messages: threadMessages,
    isRunning,
    onNew,
  });

  return (
    <div style={{ height: "100%" }}>
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread
          handleGetReflections={props.handleGetReflections}
          handleDeleteReflections={props.handleDeleteReflections}
          reflections={props.reflections}
          isLoadingReflections={props.isLoadingReflections}
          handleQuickStart={props.handleQuickStart}
          showNewThreadButton={props.showNewThreadButton}
          createThread={props.createThread}
          isUserThreadsLoading={props.isUserThreadsLoading}
          userThreads={props.userThreads}
          switchSelectedThread={props.switchSelectedThread}
          deleteThread={props.deleteThread}
          sqlQuery={props.sqlQuery}
          errorMessage={props.errorMessage}
        />
      </AssistantRuntimeProvider>
      <Toaster />
    </div>
  );
}
