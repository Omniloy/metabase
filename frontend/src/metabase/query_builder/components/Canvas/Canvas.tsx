import { ArtifactRenderer } from "./artifacts/ArtifactRenderer";
import { ContentComposerChatInterface } from "./ContentComposer";
// import { useToast } from "./hooks/use-toast";
import { useGraph } from "./hooks/use-graph/useGraph";
import { useStore } from "./hooks/useStore";
import { useThread } from "./hooks/useThread";
import { getLanguageTemplate } from "./lib/get_language_template";
import { cn } from "./lib/utils";
import {
  ArtifactCodeV3,
  ArtifactMarkdownV3,
  ArtifactV3,
  ProgrammingLanguageOptions
} from "./types";
import { useEffect, useState } from "react";

export interface User {
  id: string
}

interface CanvasProps {
  user: User;
}

export function Canvas(props: CanvasProps) {
  // const { toast } = useToast();
  const {
    threadId,
    assistantId,
    createThread,
    searchOrCreateThread,
    deleteThread,
    userThreads,
    isUserThreadsLoading,
    getUserThreads,
    setThreadId,
    getOrCreateAssistant,
    clearThreadsWithNoValues,
  } = useThread(props.user.id);
  const [chatStarted, setChatStarted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uniqueMessages, setUniqueMessages] = useState([]);
  const [card, setCard] = useState<any>([]);
  const [cardHash, setCardHash] = useState<any>([]);
  const [result, setResult] = useState<any>([]);
  const [defaultQuestion, setDefaultQuestion] = useState<any>([]);
  const [insightsImg, setInsightsImg] = useState([]);
  const [insightsText, setInsightsText] = useState([]);
  const [insightsCode, setInsightsCode] = useState([]);
  const [insightsResult, setInsightsResult] = useState([]);
  const [wholeInsights, setWholeInsights] = useState([]);
  const [sqlQuery, setSqlQuery] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    streamMessage,
    setMessages,
    setArtifact,
    messages,
    setSelectedArtifact,
    setArtifactContent,
    clearState,
    switchSelectedThread,
    artifact,
    setSelectedBlocks,
    isStreaming,
    updateRenderedArtifactRequired,
    setUpdateRenderedArtifactRequired,
    isArtifactSaved,
    firstTokenReceived,
    selectedBlocks,
    streamError
  } = useGraph({
    userId: props.user.id,
    threadId,
    assistantId,
    setCard,
    setCardHash,
    setDefaultQuestion,
    setResult, 
    setLoading,
    setInsightsImg,
    setInsightsText,
    setInsightsCode,
    setInsightsResult,
    setWholeInsights,
    setSqlQuery
  });
  const [streamErrorCanvas, setStreamErrorCanvas] = useState<any>(streamError);
  const {
    reflections,
    deleteReflections,
    getReflections,
    isLoadingReflections,
  } = useStore({
    assistantId,
    userId: props.user.id,
  });
  useEffect(() => {
    setStreamErrorCanvas(streamError)
  }, [streamError])
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!threadId) {
      searchOrCreateThread(props.user.id);
    }

    if (!assistantId) {
      getOrCreateAssistant();
    }
  }, [threadId, assistantId, searchOrCreateThread, getOrCreateAssistant, props.user.id]);

  useEffect(() => {
    if (!threadId) return;
    // Clear threads with no values
    clearThreadsWithNoValues(props.user.id);
  }, [threadId]);

  useEffect(() => {
    if (typeof window == "undefined" || !props.user.id || userThreads.length)
      return;
    getUserThreads(props.user.id);
  }, [props.user.id]);



  // Remove duplicates in messages based on kwargs.content
  useEffect(() => {
    const filteredMessages = messages.reduce((acc: any, msg:any) => {
      const isDuplicate = acc.some((m: any) => m.content === msg.content);
      return isDuplicate ? acc : [...acc, msg];
    }, []);
    setUniqueMessages(filteredMessages);
  }, [messages]);

  useEffect(() => {
    if (!assistantId || typeof window === "undefined") return;
    // Don't re-fetch reflections if they already exist & are for the same assistant
    if (
      (reflections?.content || reflections?.styleRules) &&
      reflections.assistantId === assistantId
    )
      return;

    getReflections();
  }, [assistantId]);

  const createThreadWithChatStarted = async () => {
    setChatStarted(false);
    clearState();
    return createThread(props.user.id);
  };

  const handleQuickStart = (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => {
    if (type === "code" && !language) {
      // toast({
      //   title: "Language not selected",
      //   description: "Please select a language to continue",
      //   duration: 5000,
      // });
      return;
    }
    setChatStarted(true);

    let artifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
    if (type === "code" && language) {
      artifactContent = {
        index: 1,
        type: "code",
        title: `Quick start ${type}`,
        code: getLanguageTemplate(language),
        language,
      };
    } else {
      artifactContent = {
        index: 1,
        type: "text",
        title: `Quick start ${type}`,
        fullMarkdown: "",
      };
    }

    const newArtifact: ArtifactV3 = {
      currentIndex: 1,
      contents: [artifactContent],
    };
    // Do not worry about existing items in state. This should
    // never occur since this action can only be invoked if
    // there are no messages/artifacts in the thread.
    setArtifact(newArtifact);
    setIsEditing(true);
  };

  return (
    <main style={{
      display: 'flex', 
      flexDirection: 'row',
      justifyItems: 'center',
      height: '100%'
    }}>
      {chatStarted && (
        <div
          style={{
            width: "100%",
            marginRight: "auto",
            height: "100%"
          }}
        >
          <ArtifactRenderer
            userId={props.user.id}
            firstTokenReceived={firstTokenReceived}
            isArtifactSaved={isArtifactSaved}
            artifact={artifact}
            setArtifact={setArtifact}
            setSelectedBlocks={setSelectedBlocks}
            selectedBlocks={selectedBlocks}
            assistantId={assistantId}
            handleGetReflections={getReflections}
            handleDeleteReflections={deleteReflections}
            reflections={reflections}
            isLoadingReflections={isLoadingReflections}
            setIsEditing={setIsEditing}
            isEditing={isEditing}
            setArtifactContent={setArtifactContent}
            setSelectedArtifact={setSelectedArtifact}
            messages={uniqueMessages}
            setMessages={setMessages}
            streamMessage={streamMessage}
            isStreaming={isStreaming}
            updateRenderedArtifactRequired={updateRenderedArtifactRequired}
            setUpdateRenderedArtifactRequired={
              setUpdateRenderedArtifactRequired
            }
            card={card}
            result={result}
            defaultQuestion={defaultQuestion}
            insightsImg={insightsImg}
            insightsText={insightsText}
            insightsCode={insightsCode}
            insightsResult={insightsResult}
            wholeInsights={wholeInsights}
            sqlQuery={sqlQuery}
            streamError={streamErrorCanvas.isError}
          />
        </div>
      )}
      <div
        style={{
          transition: "all 0.7s",
          width: chatStarted ? "35%" : "100%",
          height: "100%",
          marginLeft: "auto",
          backgroundColor: "rgba(250, 250, 250, 0.7)",
          boxShadow: "inset -2px 0px 4px rgba(0, 0, 0, 0.1)"
        }}
      >
        <ContentComposerChatInterface
          errorMessage={streamErrorCanvas.message}
          userId={props.user.id}
          getUserThreads={getUserThreads}
          isUserThreadsLoading={isUserThreadsLoading}
          userThreads={userThreads}
          switchSelectedThread={(thread) => {
            switchSelectedThread(thread, setThreadId);
            if ((thread.values as Record<string, any>)?.messages?.length) {
              setChatStarted(true);
            } else {
              setChatStarted(false);
            }
          }}
          deleteThread={(id) => deleteThread(id, () => setMessages([]))}
          handleGetReflections={getReflections}
          handleDeleteReflections={deleteReflections}
          reflections={reflections}
          isLoadingReflections={isLoadingReflections}
          streamMessage={streamMessage}
          messages={uniqueMessages}
          setMessages={setMessages}
          createThread={createThreadWithChatStarted}
          setChatStarted={setChatStarted}
          showNewThreadButton={chatStarted}
          handleQuickStart={handleQuickStart}
          setArtifact={setArtifact}
          setCard={setCard}
          setCardHash={setCardHash}
          setDefaultQuestion={setDefaultQuestion}
          setResult={setResult}
          setLoading={setLoading}
        />
      </div>
    </main>
  );
}
