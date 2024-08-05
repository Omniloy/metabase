import { useState } from "react";
import { useDispatch } from "metabase/lib/redux";
import { setUIControls } from "metabase/query_builder/actions";
import { Box, Button } from "metabase/ui";
import Input from "metabase/core/components/Input";
import { t } from "ttag";
import useWebSocket from "./useWebSocket"; // Import the WebSocket hook
import * as Lib from "metabase-lib";
import { CardApi } from "metabase/services";
import type Question from "metabase-lib/v1/Question";
import type {
  StructuredDatasetQuery,
  Aggregation,
  ConcreteFieldReference,
  Card,
} from "metabase-types/api";
import ChatMessageList from "../ChatComponents/ChatMessageList";

export type WebSocketHandlerProps = {
  question: Question;
  isDirty: boolean;
  isRunnable: boolean;
  isResultDirty: boolean;
  updateQuestion: (question: Question) => Promise<void>;
  runQuestionQuery: () => void;
  setQueryBuilderMode: (mode: string) => void;
};

const WebSocketHandler = ({
  question,
  updateQuestion,
}: WebSocketHandlerProps) => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState(""); // State to store input value
  const [messages, setMessages] = useState<any>([]);
  const [card, setCard] = useState<Card | null>(null); // State to store card content

  const { ws, isConnected } = useWebSocket(
    "ws://localhost:8090",
    async (e: any) => {
      console.log("🚀 ~ e:", e);
      if (e.data) {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case "tool":
            await handleFunctionalityMessages(data.functions);
            break;
          default:
            handleDefaultMessage(data);
            break;
        }
      }

      //   handleServerMessage(message);
    },
    () => console.error("WebSocket error"),
    () => console.log("WebSocket closed"),
    () => console.log("WebSocket opened"),
  );

  const handleFunctionalityMessages = async (functions: any) => {
    functions.forEach(async (func: any) => {
      switch (func.function_name) {
        case "getDatasetQuery":
          await handleGetDatasetQuery(func);
          break;
        default:
          console.log(func);
          break;
      }
    });
  };

  const handleGetDatasetQuery = async (func: any) => {
    console.log("🚀 ~ handleGetDatasetQuery ~ func:", func.arguments.cardId);
    try {
      const [fetchedCard] = await Promise.all([
        CardApi.get({ cardId: func.arguments.cardId }),
      ]);
      console.log("🚀 ~ getCardContent ~ card:", fetchedCard);
      setCard(fetchedCard);

      const getDatasetQuery = fetchedCard?.dataset_query;
      if (fetchedCard) {
        const updatedQuestion = question
          .setDatasetQuery(getDatasetQuery)
          .setDisplay("table")
          .setSettings({});
        console.log("Updated Question with new dataset_query content");
        console.log({ updatedQuestion });
        await updateQuestion(updatedQuestion);
      }
    } catch (error) {
      console.error("Error fetching card content:", error);
    }
  };

  const addServerMessage = (message: any, type: any) => {
    setMessages((prevMessages: any) => [
      ...prevMessages,
      {
        id: Date.now(),
        text: message,
        sender: "server",
        type: type,
      },
    ]);
  };

  const handleDefaultMessage = (data: any) => {
    addServerMessage(
      data.message || "Received a message from the server.",
      "text",
    );
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    if (isConnected) {
      ws.send(
        JSON.stringify({
          type: "configure",
          configData: [1],
        }),
      );
    }

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      type: "text",
      thread_id: 1,
    };

    setMessages((prevMessages: any) => [...prevMessages, userMessage]);

    const response = {
      type: "query",
      task: inputValue,
      thread_id: 1,
    };
    if (isConnected) {
      ws && ws.send(JSON.stringify(response));
      console.log("Message sent:", response);
      setInputValue(""); // Clear input after sending
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        marginTop: "1rem",
      }}
    >
      <ChatMessageList messages={messages} />

      <div
        style={{
          padding: "16px",
          backgroundColor: "#FFF",
          borderTop: "1px solid #E0E0E0",
          display: "flex",
        }}
      >
        <Input
          id="1"
          type="text"
          fullWidth
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <Button
          variant="filled"
          disabled={!isConnected}
          style={{ minWidth: 100 }}
          onClick={sendMessage}
        >
          {t`Send`}
        </Button>
      </div>
    </Box>
  );
};

export default WebSocketHandler;
