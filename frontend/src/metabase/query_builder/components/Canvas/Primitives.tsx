import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useComposerStore,
  useMessageStore,
  useThreadRuntime,
} from "@assistant-ui/react";
import { useState, type FC } from "react";

import {
  ArrowDownIcon,
  SendHorizontalIcon,
  SquarePen,
  NotebookPen,
} from "lucide-react";
import { Thread as ThreadType } from "@langchain/langgraph-sdk";
import { useLangSmithLinkToolUI } from "./LangSmithLinkToolUI";
import { ThreadHistory } from "./ThreadHistory";
import { ProgrammingLanguagesDropdown } from "./ProgrammingLangDropdown";
import { TooltipIconButton } from "./ui/assistant-ui/tooltip-icon-button";
// import { Button } from "@mantine/core";
import { Button } from "./ui/button";
import { AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
// import { useToast } from "./hooks/use-toast";
import { ProgrammingLanguageOptions, Reflections } from "./types";
import { MarkdownText } from "./ui/assistant-ui/markdown-text";
import { Avatar } from "./ui/avatar";
import { ContentContainer } from "metabase/public/containers/PublicAction/PublicAction.styled";
import { ChatGreeting } from "metabase/browse/components/ChatItems/Welcome";
import { Icon } from "metabase/ui";


interface AssistantMessageProps {
  sqlQuery?: string;
  toggleSqlModal: () => void;
}

export interface ThreadProps {
  createThread: () => Promise<ThreadType | undefined>;
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
  sqlQuery: any;
}

interface QuickStartButtonsProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  composer: React.ReactNode;
}

const QuickStartPrompts = () => {
  const threadRuntime = useThreadRuntime();

  const handleClick = (text: string) => {
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text }],
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px', color: '#4B5563' }}>
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <Button
          onClick={(e) =>
            handleClick((e.target as HTMLButtonElement).textContent || "")
          }
          variant="outline"
          className="flex-1"
          style={{ flex: 1, height: "2.25rem", padding: "0 1rem", border: "1px solid #e5e7eb", cursor: "pointer", borderRadius: "0.375rem" }}
        >
          Write me a TODO app in React
        </Button>
        <Button
          onClick={(e) =>
            handleClick((e.target as HTMLButtonElement).textContent || "")
          }
          variant="outline"
          className="flex-1"
          style={{ flex: 1, height: "2.25rem", padding: "0 1rem", border: "1px solid #e5e7eb", cursor: "pointer", borderRadius: "0.375rem" }}
        >
          Explain why the sky is blue in a short essay
        </Button>
      </div>
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <Button
          onClick={(e) =>
            handleClick((e.target as HTMLButtonElement).textContent || "")
          }
          variant="outline"
          className="flex-1"
          style={{ flex: 1, height: "2.25rem", padding: "0 1rem", border: "1px solid #e5e7eb", cursor: "pointer", borderRadius: "0.375rem" }}
        >
          Help me draft an email to my professor Craig
        </Button>
        <Button
          onClick={(e) =>
            handleClick((e.target as HTMLButtonElement).textContent || "")
          }
          variant="outline"
          className="flex-1"
          style={{ flex: 1, height: "2.25rem", padding: "0 1rem", border: "1px solid #e5e7eb", cursor: "pointer", borderRadius: "0.375rem" }}
        >
          Write a web scraping program in Python
        </Button>
      </div>
    </div>
  );
};

const QuickStartButtons = (props: QuickStartButtonsProps) => {
  const handleLanguageSubmit = (language: ProgrammingLanguageOptions) => {
    props.handleQuickStart("code", language);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '8px', width: '100%' }}>
        {props.composer}
      </div>
    </div>
  );
};

export const Thread: FC<ThreadProps> = (props: ThreadProps) => {
  // const { toast } = useToast();
  const { sqlQuery } = props;
  useLangSmithLinkToolUI();

  const handleCreateThread = async () => {
    const thread = await props.createThread();
    if (!thread) {
      // toast({
      //   title: "Failed to create a new thread",
      //   duration: 5000,
      //   variant: "destructive",
      // });
    }
  };

  return (
    <ThreadPrimitive.Root style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
     <div style={{ paddingTop: '12px', paddingLeft: '12px', paddingBottom: '8px', display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
      {props.showNewThreadButton ? (
        <Button
          variant="outline"
          style={{
            transition: 'background-color 0.2s ease',
            color: '#4B5563',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: "pointer",
          }}
          onClick={handleCreateThread}
        >
          <SquarePen />
        </Button>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', marginRight: '4px', justifyContent: 'flex-end', gap: '8px', color: '#4B5563', flex: 1 }}>
        <ThreadHistory
          isUserThreadsLoading={props.isUserThreadsLoading}
          userThreads={props.userThreads}
          switchSelectedThread={props.switchSelectedThread}
          deleteThread={props.deleteThread}
        />
      </div>
    </div>
      <ThreadPrimitive.Viewport style={{ flex: '1', overflowY: 'auto', scrollBehavior: 'smooth', backgroundColor: 'inherit', paddingLeft: '16px'}}>
        {!props.showNewThreadButton && (
          <ThreadWelcome
            handleQuickStart={props.handleQuickStart}
            composer={<Composer />}
          />
        )}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: () => (
              <AssistantMessage sqlQuery={sqlQuery} toggleSqlModal={()=> console.log('SQL QUERY CARD: ', sqlQuery)} />
            ),
          }}
        />
      </ThreadPrimitive.Viewport>
      <div style={{ marginTop: '16px', display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', backgroundColor: 'inherit', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
        <ThreadScrollToBottom />
        <div style={{ width: '100%', maxWidth: '640px' }}>
          {props.showNewThreadButton && <Composer />}
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      {/* <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton> */}
    </ThreadPrimitive.ScrollToBottom>
  );
};

interface ThreadWelcomeProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  composer: React.ReactNode;
}

const ThreadWelcome: FC<ThreadWelcomeProps> = (props: ThreadWelcomeProps) => {
  const [selectedChatType, setSelectedChatType] = useState("default");
  return (
    <ThreadPrimitive.Empty>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
        <div style={{ textAlign: 'center', maxWidth: '768px', width: '100%', display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
          <ContentContainer>
                        <ChatGreeting chatType={selectedChatType} />
                      </ContentContainer>
          <div style={{ marginTop: '32px', width: '100%' }}>
            <QuickStartButtons
              composer={props.composer}
              handleQuickStart={props.handleQuickStart}
            />
          </div>
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root 
      style={{ 
        border: '1px solid rgba(99, 102, 241, 0.2)', 
        display: 'flex', 
        width: '100%', 
        minHeight: '64px', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        borderRadius: '0.5rem', 
        padding: '10px', 
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', 
        transition: 'background-color 0.2s ease-in',
        backgroundColor: 'white'
      }}
    >
      <ComposerPrimitive.Input
        autoFocus
        placeholder="Write a message..."
        rows={1}
        style={{ 
          flexGrow: 1,
          resize: 'none',
          border: 'none',
          backgroundColor: 'transparent',
          padding: '1rem 0.5rem', 
          fontSize: '0.875rem', 
          outline: 'none',
          cursor: 'text',
          height: '49px'
        }}
        // className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          {/* <TooltipIconButton
            tooltip="Send"
            variant="default"
            style={{
        margin: '0.625rem 0',
        padding: '0.5rem',
        transition: 'opacity 0.2s ease-in',
        fontSize: '1rem', 
      }}
          > */}
            <SendHorizontalIcon />
          {/* </TooltipIconButton> */}
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Cancel"
            variant="default"
            style={{
        margin: '0.625rem 0',
        padding: '0.5rem', 
        transition: 'opacity 0.2s ease-in',
        fontSize: '1rem', 
      }}
            // className="my-2.5 size-8 p-2 transition-opacity ease-in"
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root style={{ display: 'grid', width: '100%', maxWidth: '640px', gridAutoRows: 'auto', gridTemplateColumns: 'minmax(72px, 1fr) auto', gap: '8px', padding: '16px' }}>
      <div style={{ backgroundColor: '#f5f5f5', color: '#111827', gridColumnStart: 2, gridRowStart: 1, maxWidth: '400px', wordBreak: 'break-word', borderRadius: '24px', padding: '10px 20px' }}>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const ComposerSend = () => {
  const messageStore = useMessageStore();
  const composerStore = useComposerStore();
  const threadRuntime = useThreadRuntime();

  const handleSend = () => {
    const composerState = composerStore.getState();
    const { parentId, message } = messageStore.getState();

    threadRuntime.append({
      parentId,
      role: message.role,
      content: [{ type: "text", text: composerState.text }],
    });
    composerState.cancel();
  };

  return <Button onClick={handleSend}>Save</Button>;
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root style={{ backgroundColor: '#f5f5f5', margin: '16px 0', display: 'flex', width: '100%', maxWidth: '640px', flexDirection: 'column', gap: '8px', borderRadius: '12px' }}>
      <ComposerPrimitive.Input
        style={{ color: '#111827', display: 'flex', height: '32px', width: '100%', resize: 'none', border: 'none', backgroundColor: 'transparent', padding: '16px 0 0', outline: 'none' }}
        // Don't submit on `Enter`, instead add a newline.
        submitOnEnter={false}
      />

      <div style={{ margin: '0 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-end' }}>
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost" style={{ background: 'transparent', color: '#4B5563' }}>Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerSend />
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC<AssistantMessageProps> = ({ sqlQuery, toggleSqlModal }) => {
  return (
    <MessagePrimitive.Root style={{ position: 'relative', display: 'grid', width: '100%', maxWidth: '640px', gridTemplateColumns: 'auto auto 1fr', gridTemplateRows: 'auto 1fr', padding: '16px' }}>
      <Avatar style={{ gridColumnStart: 1, gridRow: 'span 2', gridRowStart: 1, marginRight: '16px' }}>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>

      <div style={{ color: '#111827', gridColumn: 'span 2', gridColumnStart: 2, gridRowStart: 1, margin: '6px 0', maxWidth: '400px', wordBreak: 'break-word', lineHeight: '1.75' }}>
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
        {/* {sqlQuery && sqlQuery.length > 0 && (
          <Icon size={18} name="commandLine" onClick={toggleSqlModal}/>
        )} */}
      </div>
    </MessagePrimitive.Root>
  );
};
const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};
