import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import { TooltipIconButton } from "./ui/assistant-ui/tooltip-icon-button";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { Thread } from "@langchain/langgraph-sdk";
import { PiChatsCircleLight } from "react-icons/pi";
import { motion } from 'framer-motion';

interface ThreadHistoryProps {
  isUserThreadsLoading: boolean;
  userThreads: Thread[];
  switchSelectedThread: (thread: Thread) => void;
  deleteThread: (id: string) => Promise<void>;
}

interface ThreadProps {
  id: string;
  onClick: () => void;
  onDelete: () => void;
  label: string;
  createdAt: Date;
}

const ThreadItem = (props: ThreadProps) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', gap: '0px', alignItems: 'center', justifyContent: 'start', width: '100%' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Button
        style={{
          paddingLeft: '1.5rem',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexGrow: 1,
          minWidth: '191px',
          paddingRight: '1rem',
          cursor: 'pointer', 
        }}
        className="px-2 justify-start items-center flex-grow min-w-[191px] pr-0"
        size="sm"
        variant="ghost"
        onClick={props.onClick}
      >
        <p style={{ width: '100%', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {props.label}
        </p>
      </Button>
      {isHovering && (
          <Trash2
          onClick={props.onDelete}
           style={{
            width: '3rem',
            height: '2rem', 
            color: '#575757', 
            transition: 'color 0.2s ease-in',
            cursor: "pointer",
            paddingRight: '1.5rem',
          }} />
      )}
    </div>
  );
};

const LoadingThread = () => <Skeleton className="w-full h-8" />;

const convertThreadActualToThreadProps = (
  thread: Thread,
  switchSelectedThread: (thread: Thread) => void,
  deleteThread: (id: string) => void
): ThreadProps => ({
  id: thread.thread_id,
  label:
    (thread.values as Record<string, any>)?.messages?.[0]?.content ||
    "Untitled",
  createdAt: new Date(thread.created_at),
  onClick: () => {
    return switchSelectedThread(thread);
  },
  onDelete: () => {
    return deleteThread(thread.thread_id);
  },
});

const groupThreads = (
  threads: Thread[],
  switchSelectedThread: (thread: Thread) => void,
  deleteThread: (id: string) => void
) => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const sevenDaysAgo = subDays(today, 7);

  return {
    today: threads
      .filter((thread) => isToday(new Date(thread.created_at)))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(t, switchSelectedThread, deleteThread)
      ),
    yesterday: threads
      .filter((thread) => isYesterday(new Date(thread.created_at)))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(t, switchSelectedThread, deleteThread)
      ),
    lastSevenDays: threads
      .filter((thread) =>
        isWithinInterval(new Date(thread.created_at), {
          start: sevenDaysAgo,
          end: yesterday,
        })
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(t, switchSelectedThread, deleteThread)
      ),
    older: threads
      .filter((thread) => new Date(thread.created_at) < sevenDaysAgo)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(t, switchSelectedThread, deleteThread)
      ),
  };
};

const prettifyDateLabel = (group: string): string => {
  switch (group) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "lastSevenDays":
      return "Last 7 days";
    case "older":
      return "Older";
    default:
      return group;
  }
};

interface ThreadsListProps {
  groupedThreads: {
    today: ThreadProps[];
    yesterday: ThreadProps[];
    lastSevenDays: ThreadProps[];
    older: ThreadProps[];
  };
}

function ThreadsList(props: ThreadsListProps) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', paddingTop: '6px', gap: '8px'}} className="flex flex-col pt-3 gap-4">
      {Object.entries(props.groupedThreads).map(([group, threads]) =>
        threads.length > 0 ? (
          <div key={group}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem', paddingLeft: '1.2rem' }}>
              {prettifyDateLabel(group)}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {threads.map((thread) => (
                <ThreadItem key={thread.id} {...thread} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

export function ThreadHistory(props: ThreadHistoryProps) {
  const [open, setOpen] = useState(false);
  const groupedThreads = groupThreads(
    props.userThreads,
    (thread) => {
      props.switchSelectedThread(thread);
      setOpen(false);
    },
    props.deleteThread
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
          <PiChatsCircleLight
            style={{ width: "24px", height: "24px", cursor: "pointer", marginRight: "12px" }}
            className="w-6 h-6 text-gray-600"
            strokeWidth={8}
          />
      </SheetTrigger>
      <SheetContent
      //   style={{ 
      //   zIndex:100, 
      //   position: 'absolute',
      //   top: 0,
      //   bottom: 0,
      //   right: 0,
      //   height: "100%",
      //   // width: "25%",
      //   border: "none", 
      //   overflowY: "auto", 
      //   scrollbarWidth: "thin", 
      //   scrollbarColor: "#e5e7eb #ffffff", 
      //   backgroundColor: "white",
      //   boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      //   transition: "all 0.7s",
      // }}
        className="border-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <p style={{ paddingLeft: '1.2rem', paddingRight: '0.5rem', fontSize: '1.125rem', color: '#4B5563' }}>Chat History</p>
        {props.isUserThreadsLoading && !props.userThreads.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', padding: '0.5rem' }}>
            {Array.from({ length: 25 }).map((_, i) => (
              <LoadingThread key={`loading-thread-${i}`} />
            ))}
          </div>
        ) : !props.userThreads.length ? (
          <p className="px-3 text-gray-500">No items found in history.</p>
        ) : (
          <ThreadsList groupedThreads={groupedThreads} />
        )}
      </SheetContent>
    </Sheet>
  );
}
