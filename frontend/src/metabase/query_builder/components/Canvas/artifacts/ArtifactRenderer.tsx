// import { useToast } from "../hooks/use-toast";
import { GraphInput } from "../hooks/use-graph/useGraph";
import { convertToOpenAIFormat } from "../lib/convert_messages"
import { cn } from "../lib/utils";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import MuiButton from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  ArtifactCodeV3,
  ArtifactMarkdownV3,
  ArtifactV3,
  ProgrammingLanguageOptions,
  Reflections,
  TextHighlight,
} from "../types"
import { EditorView } from "@codemirror/view";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  CircleArrowUp,
  Forward,
  Copy,
  LoaderCircle,
  CircleCheck,
} from "lucide-react";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CSSProperties } from 'react';
import { useDispatch } from "metabase/lib/redux";
import { push } from "react-router-redux";
import { v4 as uuidv4 } from "uuid";
// import { ReflectionsDialog } from "../reflections-dialog/ReflectionsDialog";
import { TooltipIconButton } from "../ui/assistant-ui/tooltip-icon-button";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ActionsToolbar, CodeToolBar } from "./actions_toolbar";
import { CodeRenderer } from "./CodeRenderer";
import { TextRenderer } from "./TextRenderer";
import { CustomQuickActions } from "./actions_toolbar/custom";
import { getArtifactContent } from "../hooks/use-graph/utils";
import { isArtifactCodeContent } from "../lib/artifact_content_types"
import VisualizationResult from "metabase/query_builder/components/VisualizationResult";
import { Icon } from "metabase/ui";
import ReactMarkdown from "react-markdown";
import { highlightCode } from "metabase/components/Insight/utils";

export interface ArtifactRendererProps {
  userId: string;
  assistantId: string | undefined;
  artifact: ArtifactV3 | undefined;
  setArtifact: Dispatch<SetStateAction<ArtifactV3 | undefined>>;
  setArtifactContent: (index: number, content: string) => void;
  streamMessage: (input: GraphInput) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<BaseMessage[]>>;
  setSelectedArtifact: (index: number) => void;
  messages: BaseMessage[];
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingReflections: boolean;
  reflections: (Reflections & { updatedAt: Date }) | undefined;
  handleDeleteReflections: () => Promise<boolean>;
  handleGetReflections: () => Promise<void>;
  selectedBlocks: TextHighlight | undefined;
  setSelectedBlocks: Dispatch<SetStateAction<TextHighlight | undefined>>;
  isStreaming: boolean;
  updateRenderedArtifactRequired: boolean;
  setUpdateRenderedArtifactRequired: Dispatch<SetStateAction<boolean>>;
  isArtifactSaved: boolean;
  firstTokenReceived: boolean;
  card: any;
  result: any
  defaultQuestion: any;
  insightsImg: any;
  insightsText: any;
  insightsCode: any;
  insightsResult: any;
  wholeInsights: any;
  sqlQuery?: any
}

interface SelectionBox {
  top: number;
  left: number;
  text: string;
}

interface Insight {
  type: string;
  value: string;
}

interface ShowCodeStates {
  [key: number]: boolean;
}


const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  stepContainer: {
    padding: '20px',
    border: '1px solid #444',
    marginBottom: '20px',
    borderRadius: '8px',
    backgroundColor: '#2e2e2e',
    color: '#dcdcdc',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    width: '100%',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#8A64DF',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  codeBlock: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    overflowWrap: 'break-word',
    fontSize: '16px',
  },
  comment: {
    color: '#6a8759',
    fontStyle: 'italic',
  }
};

export function ArtifactRenderer(props: ArtifactRendererProps) {
  // const { toast } = useToast();
  const [showSqlQuery, setShowSqlQuery] = useState(false);
  const dispatch = useDispatch();
  const editorRef = useRef<EditorView | null>(null);
  const markdownRef = useRef<HTMLDivElement>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>();
  const [selectionIndexes, setSelectionIndexes] = useState<{
    start: number;
    end: number;
  }>();
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showCodeStates, setShowCodeStates] = useState<ShowCodeStates>({});
  // const [combinedInsightsResult, setCombinedInsightsResult] = useState<Insight[]>([]);
  console.log("ARTIFACT PROPS", props);
  let imageIndex = 0;

      // useEffect(() => {
      //   // Combine results when props change
      //   if (props.insightsResult && props.insightsResult.length > 0 && props.insightsImg && props.insightsImg.length > 0) {
      //     const combined = props.insightsResult.map((item: any) => {
      //       if (item.type === "image" && imageIndex < props.insightsImg.length) {
      //         const updatedItem = { ...item, value: props.insightsImg[imageIndex] };
      //         imageIndex += 1;
      //         return updatedItem;
      //       }
      //       return item; // Leave text entries and extra image entries unchanged
      //     });
      //     setCombinedInsightsResult(combined);
      //     console.log("combinedInsightsResult", combinedInsightsResult);
      //   }
      // }, [props.insightsResult, props.insightsImg]);
    const handleShowCode = (index:number) => {
      setShowCodeStates(prevStates => ({
        ...prevStates,
        [index]: !prevStates[index]
      }));
    };
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();

      if (selectedText) {
        const rects = range.getClientRects();
        const firstRect = rects[0];
        const lastRect = rects[rects.length - 1];
        const contentRect = contentRef.current.getBoundingClientRect();

        const boxWidth = 400; // Approximate width of the selection box
        let left = lastRect.right - contentRect.left - boxWidth;

        // Ensure the box doesn't go beyond the left edge
        if (left < 0) {
          left = Math.min(0, firstRect.left - contentRect.left);
        }

        setSelectionBox({
          top: lastRect.bottom - contentRect.top,
          left: left,
          text: selectedText,
        });
        setIsInputVisible(false);
        setIsSelectionActive(true);
      }
    }
  }, []);

  const handleDocumentMouseDown = useCallback(
    (event: MouseEvent) => {
      if (
        isSelectionActive &&
        selectionBoxRef.current &&
        !selectionBoxRef.current.contains(event.target as Node)
      ) {
        setIsSelectionActive(false);
        setSelectionBox(undefined);
        setIsInputVisible(false);
        setInputValue("");
        setSelectionIndexes(undefined);
      }
    },
    [isSelectionActive]
  );

  const handleSelectionBoxMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const handleSubmit = async (
    e:
      | FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const artifactContent = props.artifact
      ? getArtifactContent(props.artifact)
      : undefined;
    if (
      !selectionIndexes &&
      artifactContent &&
      isArtifactCodeContent(artifactContent)
    ) {
      // toast({
      //   title: "Selection error",
      //   description:
      //     "Failed to get start/end indexes of the selected text. Please try again.",
      //   duration: 5000,
      // });
      return;
    }

    if (selectionBox && props.artifact) {
      const humanMessage = new HumanMessage({
        content: inputValue,
        id: uuidv4(),
      });

      props.setMessages((prevMessages) => [...prevMessages, humanMessage]);

      setIsInputVisible(false);
      setInputValue("");
      setSelectionBox(undefined);
      setSelectionIndexes(undefined);
      setIsSelectionActive(false);

      await props.streamMessage({
        messages: [convertToOpenAIFormat(humanMessage)],
        ...(selectionIndexes && {
          highlightedCode: {
            startCharIndex: selectionIndexes.start,
            endCharIndex: selectionIndexes.end,
          },
        }),
      });
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [handleMouseUp, handleDocumentMouseDown]);

  useEffect(() => {
    try {
      if (markdownRef.current && highlightLayerRef.current) {
        const content = markdownRef.current;
        const highlightLayer = highlightLayerRef.current;

        // Clear existing highlights
        highlightLayer.innerHTML = "";

        if (isSelectionActive && selectionBox) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            if (content.contains(range.commonAncestorContainer)) {
              const rects = range.getClientRects();
              const layerRect = highlightLayer.getBoundingClientRect();

              // Calculate start and end indexes
              let startIndex = 0;
              let endIndex = 0;
              let currentArtifactContent:
                | ArtifactCodeV3
                | ArtifactMarkdownV3
                | undefined = undefined;
              try {
                currentArtifactContent = props.artifact
                  ? getArtifactContent(props.artifact)
                  : undefined;
              } catch (_) {
                console.error(
                  "[ArtifactRenderer.tsx L229]\n\nERROR NO ARTIFACT CONTENT FOUND\n\n",
                  props.artifact
                );
                // no-op
              }

              if (currentArtifactContent?.type === "code") {
                if (editorRef.current) {
                  const from = editorRef.current.posAtDOM(
                    range.startContainer,
                    range.startOffset
                  );
                  const to = editorRef.current.posAtDOM(
                    range.endContainer,
                    range.endOffset
                  );
                  startIndex = from;
                  endIndex = to;
                }
                setSelectionIndexes({ start: startIndex, end: endIndex });
              }

              for (let i = 0; i < rects.length; i++) {
                const rect = rects[i];
                const highlightEl = document.createElement("div");
                highlightEl.className =
                  "absolute bg-[#3597934d] pointer-events-none";

                // Adjust the positioning and size
                const verticalPadding = 3;
                highlightEl.style.left = `${rect.left - layerRect.left}px`;
                highlightEl.style.top = `${rect.top - layerRect.top - verticalPadding}px`;
                highlightEl.style.width = `${rect.width}px`;
                highlightEl.style.height = `${rect.height + verticalPadding * 2}px`;

                highlightLayer.appendChild(highlightEl);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to get artifact selection", e);
    }
  }, [isSelectionActive, selectionBox]);

  useEffect(() => {
    if (!!props.selectedBlocks && !isSelectionActive) {
      // Selection is not active but selected blocks are present. Clear them.
      props.setSelectedBlocks(undefined);
    }
  }, [props.selectedBlocks, isSelectionActive]);
  console.log("PROPS.ARTIFACT", props.artifact)
  const currentArtifactContent = props.artifact
    ? getArtifactContent(props.artifact)
    : undefined;
  if (!props.artifact || !currentArtifactContent) {
    return <div style={{ width: "100%", height: "100%" }}></div>;
  }
  const isBackwardsDisabled =
    props.artifact.contents.length === 1 ||
    currentArtifactContent.index === 1 ||
    props.isStreaming;
  const isForwardDisabled =
    props.artifact.contents.length === 1 ||
    currentArtifactContent.index === props.artifact.contents.length ||
    props.isStreaming;

  const currentArtifactIndex = props.artifact
    ? getArtifactContent(props.artifact).index - 1
    : 0;
  const cardId = props.card?.[currentArtifactIndex]?.id;

  const sqlQuery = props.sqlQuery?.[currentArtifactIndex];
  const toggleSqlQueryVisibility = () => setShowSqlQuery(!showSqlQuery);

  const handleVerify = () => {
    if (cardId) {
      console.log("Card ID:", cardId);
      dispatch(push(`/question/${cardId}`));
    } else {
      console.log("No card ID available for this index.");
    }
  };

  const highlightCode = (code: any) => {
    return code.split('\n').map((line: any, i: any) => {
      if (line.trim().startsWith('#')) {
        return <div key={i} style={styles.comment}>{line}</div>;
      }
      return <div key={i}>{line}</div>;
    });
  };


  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div
          style={{ paddingLeft: "6px", paddingTop: "12px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", marginLeft: "6px", gap: "4px" }}>
          <h1
            style={{ fontSize: "1.25rem", fontWeight: "500", color: "#4B5563" }}>
            {currentArtifactContent.title}
          </h1>
          <span style={{ marginTop: "auto" }}>
            {props.isArtifactSaved ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "4px", color: "#9CA3AF" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: "400" }}>Saved</p>
                <CircleCheck style={{ width: "10px", height: "10px" }} />
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "4px", color: "#9CA3AF" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: "400" }}>Saving</p>
                <LoaderCircle style={{ width: "10px", height: "10px", animation: "spin 1s linear infinite" }} />
              </span>
            )}
          </span>
        </div>
        <div style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          color: "#4B5563"
        }}>
          <TooltipIconButton
            tooltip="Previous"
            side="left"
            variant="ghost"
            style={{ width: "fit-content", height: "fit-content", padding: "8px", transition: "colors 0.2s ease-in" }}
            delayDuration={400}
            onClick={() => {
              if (!isBackwardsDisabled) {
                props.setSelectedArtifact(currentArtifactContent.index - 1);
              }
            }}
            disabled={isBackwardsDisabled}
          >
            <Forward
              aria-disabled={isBackwardsDisabled}
              style={{ width: "16px", height: "16px", color: "#4B5563", transform: "scaleX(-1)" }}
            />
          </TooltipIconButton>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <p style={{ fontSize: "0.75rem", paddingTop: "4px" }}>
              {currentArtifactContent.index} / {props.artifact.contents.length}
            </p>
          </div>
          <TooltipIconButton
            tooltip="Next"
            variant="ghost"
            side="right"
            style={{ width: "fit-content", height: "fit-content", padding: "8px", transition: "colors 0.2s ease-in" }}
            delayDuration={400}
            onClick={() => {
              if (!isForwardDisabled) {
                props.setSelectedArtifact(currentArtifactContent.index + 1);
              }
            }}
            disabled={isForwardDisabled}
          >
            <Forward
              aria-disabled={isForwardDisabled}
              style={{ width: "16px", height: "16px", color: "#4B5563" }}
            />
          </TooltipIconButton>
        </div>
        {/* <div className="ml-auto mt-[10px] mr-[6px]">
          <ReflectionsDialog
            handleGetReflections={props.handleGetReflections}
            isLoadingReflections={props.isLoadingReflections}
            reflections={props.reflections}
            handleDeleteReflections={props.handleDeleteReflections}
          />
        </div> */}
        {/* <div style={{ paddingRight: "8px", paddingTop: "8px" }}>
          <TooltipIconButton
            tooltip="Copy"
            variant="ghost"
            style={{ width: "fit-content", height: "fit-content", padding: "8px", transition: "colors 0.2s ease-in" }}
            delayDuration={400}
            onClick={() => {
              try {
                const text = isArtifactCodeContent(currentArtifactContent)
                  ? currentArtifactContent.code
                  : currentArtifactContent.fullMarkdown;
                navigator.clipboard.writeText(text).then(() => {
                  // toast({
                  //   title: "Copied to clipboard",
                  //   description: "The canvas content has been copied.",
                  //   duration: 5000,
                  // });
                });
              } catch (_) {
                // toast({
                //   title: "Copy error",
                //   description:
                //     "Failed to copy the canvas content. Please try again.",
                //   duration: 5000,
                // });
              }
            }}
          >
            <Copy style={{ width: "16px", height: "16px", color: "#4B5563" }} />
          </TooltipIconButton>
        </div> */}
      </div>
      <div
        ref={contentRef}
        style={{
          display: "flex",
          justifyContent: "center",
          height: "auto",
          width: "100%",
          paddingTop: currentArtifactContent.type === "code" ? "10px" : undefined,
        }}
      >

        <div
          style={{
            position: "relative",
            minHeight: "100%",
            minWidth: "100%",
          }}
        >
          <div style={{ height: "100%" }} ref={markdownRef}>
          {props.insightsResult.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
            }}>
              {props.insightsResult.map((insight:any, index:number) => (
                <div key={index} style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  width: '80%',
                }}>
                  {insight.type === 'image' ? (
                    <img 
                      src={insight.value} 
                      alt="Insight Visualization" 
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: '10px 0',
                      fontSize: '14px',
                      color: '#333',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {insight.value}
                    </p>
                  )}
                  <div style={{
          textAlign: 'right',
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          padding: '10px',
          marginTop: '10px',
        }}>
           <button style={{
            padding: '5px 10px',
            fontSize: '14px',
            backgroundColor: 'white',
            color: '#587330',
            borderRadius: '5px',
            cursor: 'pointer'
          }} onClick={() => handleShowCode(index)}>
          {showCodeStates[index] ? 'Show Text' : 'Show Code'} &nbsp;&nbsp;<Icon name="chevronright" size={14} />
        </button>
          {!showCodeStates[index] ? (
            <div style={{
              textAlign: 'left',
              marginTop: '10px',
              padding: '5px',
              border: '1px solid #eee',
              borderRadius: '5px',
              backgroundColor: '#f9f9f9'
            }}>
              <ReactMarkdown>{props.insightsText[index] || ''}</ReactMarkdown>
            </div>
          ) : (
            <div style={{
              textAlign: 'left',
              marginTop: '10px',
              padding: '5px',
              border: '1px solid #eee',
              borderRadius: '5px',
              backgroundColor: '#f0f0f0'
            }}>
              <pre style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap'
              }}>
                {highlightCode(props.insightsCode[index] || '')}
              </pre>
            </div>
          )}
          </div>
                  <hr />
                </div>
              ))}
            </div>
            ) : props.card?.length > 0 && props.result?.length > 0 && props.defaultQuestion?.length > 0 ? (

              <div
                style={{
                  flex: "1 0 50%",
                  padding: "16px",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "auto",
                }}
              >
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "auto",
                    padding: "1rem",
                    borderRadius: "16px",
                    boxShadow: 3,
                    overflow: "visible", // Allow the card to grow as content is added
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "600px",
                        minHeight: "600px",
                      }}
                    >
                      <VisualizationResult
                        question={props.defaultQuestion[currentArtifactContent.index - 1]}
                        isDirty={false}
                        queryBuilderMode="view"
                        result={props.result[currentArtifactContent.index - 1]}
                        rawSeries={[
                          {
                            card: props.card[currentArtifactContent.index - 1],
                            data: props.result[currentArtifactContent.index - 1]?.data,
                          },
                        ]}
                        isRunning={false}
                      />
                    </div>

                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {currentArtifactContent.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between", width: "100%" }}>
                    <MuiButton size="small" variant="outlined" onClick={handleVerify}>
                      Verify
                    </MuiButton>
                    {sqlQuery && (
                      <Icon
                        size={20}
                        name="commandLine"
                        onClick={toggleSqlQueryVisibility}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </CardActions>
                  {showSqlQuery && sqlQuery && (
                    <CardContent
                      sx={{
                        maxWidth: "100%",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        backgroundColor: "#f9f9f9",
                        borderTop: "1px solid #e0e0e0",
                      }}
                    >
                      <div style={styles.container}>
                        <div style={styles.stepContainer}>
                          <pre style={styles.codeBlock}>
                            {highlightCode(sqlQuery)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>


            ) : (
              <div style={{ padding: "16px", color: "#FF0000" }}>Loading Visualization...</div>
            )}

            {currentArtifactContent.type === "text" ? (
              <TextRenderer
                firstTokenReceived={props.firstTokenReceived}
                isInputVisible={isInputVisible}
                isStreaming={props.isStreaming}
                artifact={props.artifact}
                setArtifact={props.setArtifact}
                setSelectedBlocks={props.setSelectedBlocks}
                isEditing={props.isEditing}
                updateRenderedArtifactRequired={
                  props.updateRenderedArtifactRequired
                }
                setUpdateRenderedArtifactRequired={
                  props.setUpdateRenderedArtifactRequired
                }
              />
            ) : null}
            {currentArtifactContent.type === "code" ? (
              <CodeRenderer
                isStreaming={props.isStreaming}
                firstTokenReceived={props.firstTokenReceived}
                setArtifactContent={props.setArtifactContent}
                editorRef={editorRef}
                artifactContent={currentArtifactContent}
                updateRenderedArtifactRequired={
                  props.updateRenderedArtifactRequired
                }
                setUpdateRenderedArtifactRequired={
                  props.setUpdateRenderedArtifactRequired
                }
              />
            ) : null}
          </div>
          <div
            ref={highlightLayerRef}
            style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", pointerEvents: "none" }}
          // className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>
        {selectionBox && isSelectionActive && (
          <div
            ref={selectionBoxRef}
            className={cn(
              "absolute bg-white border border-gray-200 shadow-md p-2 flex gap-2",
              isInputVisible ? "rounded-3xl" : "rounded-md"
            )}
            style={{
              top: `${selectionBox.top + 60}px`,
              left: `${selectionBox.left}px`,
              width: isInputVisible ? "400px" : "250px",
              marginLeft: isInputVisible ? "0" : "150px",
            }}
            onMouseDown={handleSelectionBoxMouseDown}
          >
            {isInputVisible ? (
              <form
                onSubmit={handleSubmit}
                style={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <Input
                  style={{
                    width: "100%",
                    transition: "all 300ms ease-in-out",
                    padding: "0.25rem",
                    outline: "none",
                    border: "0",
                    boxShadow: "none",
                  }}
                  placeholder="Ask Open Canvas..."
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button
                  onClick={(e) => handleSubmit(e)}
                  type="submit"
                  variant="ghost"
                  size="icon"
                >
                  <CircleArrowUp
                    // className="cursor-pointer"
                    style={{ cursor: "pointer" }}
                    fill="black"
                    stroke="white"
                    size={30}
                  />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setIsInputVisible(true)}
                style={{
                  transition: "all 300ms ease-in-out",
                  width: "100%",
                }}
              >
                Ask Open Canvas
              </Button>
            )}
          </div>
        )}
      </div>
      {/* <CustomQuickActions
        isTextSelected={isSelectionActive || props.selectedBlocks !== undefined}
        userId={props.userId}
        assistantId={props.assistantId}
        streamMessage={props.streamMessage}
        cardId={cardId}
      /> */}
      {currentArtifactContent.type === "text" ? (
        <ActionsToolbar
          isTextSelected={
            isSelectionActive || props.selectedBlocks !== undefined
          }
          streamMessage={props.streamMessage}
        />
      ) : null}
      {currentArtifactContent.type === "code" ? (
        <CodeToolBar
          isTextSelected={
            isSelectionActive || props.selectedBlocks !== undefined
          }
          language={
            currentArtifactContent.language as ProgrammingLanguageOptions
          }
          streamMessage={props.streamMessage}
        />
      ) : null}
    </div>
  );
}
