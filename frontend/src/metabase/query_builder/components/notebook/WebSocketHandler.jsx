
import { useState } from "react";
import { useSelector, useDispatch } from "metabase/lib/redux";
import { Box, Button, Icon } from "metabase/ui";
import Input from "metabase/core/components/Input";
import { t } from "ttag";
import useWebSocket from "./useWebSocket";
import {
  getIsDirty,
  getIsRunnable,
  getIsResultDirty,
  getQuestion,
  getVisualizationSettings,
  getRawSeries,
  getUiControls,
  getQueryResults
} from "metabase/query_builder/selectors";
import ChatMessageList from "../ChatComponents/ChatMessageList";
import { CardApi } from "metabase/services";
import Question from "metabase-lib/v1/Question";
import VisualizationResult from "../VisualizationResult";
import QueryVisualization from "../QueryVisualization";
import { cardApi } from "metabase/api";
import { loadMetadataForCard } from "metabase/questions/actions";
import { push } from "react-router-redux";

const WebSocketHandler = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [card, setCard] = useState(null);
  const [result, setResult] = useState(null);
  const [defaultQuestion, setDefaultQuestion] = useState(null);
  const queryResults = useSelector(getQueryResults);
  const isDirty = useSelector(getIsDirty);
  const rawSeries = useSelector(getRawSeries);
  const dispatch = useDispatch();

  // WebSocket connection setup
  const { ws, isConnected } = useWebSocket(
    "ws://localhost:8090",
    async e => {
      if (e.data) {
        const data = JSON.parse(e.data);
        console.log("🚀 ~ WebSocketHandler ~ data:", data)
        switch (data.type) {
          case "tool":
            await handleFunctionalityMessages(data.functions);
            break;
          case "result":
            await handleDefaultMessage(data.functions);
            break;
          default:
            handleDefaultMessage(data);
            break;
        }
      }
    },
    () => console.error("WebSocket error"),
    () => console.log("WebSocket closed"),
    () => console.log("WebSocket opened"),
  );

  const redirect = () => {
    dispatch(push("/question/89"));
  }

  const handleFunctionalityMessages = async functions => {
    functions.forEach(async func => {
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

  const handleGetDatasetQuery = async func => {
    try {
      const fetchedCard = await CardApi.get({ cardId: func.arguments.cardId });
      const pivotCard = await CardApi.query_pivot({ cardId: func.arguments.cardId });
      const queryCard = await CardApi.query({ cardId: func.arguments.cardId });
      console.log("🚀 ~ handleGetDatasetQuery ~ queryCard:", queryCard)
      const cardMetadata = await dispatch(loadMetadataForCard(fetchedCard));
      console.log("🚀 ~ handleGetDatasetQuery ~ cardMetadata:", cardMetadata)
      setResult(queryCard);
      const getDatasetQuery = fetchedCard?.dataset_query;
      const defaultQuestionTest = Question.create({
        databaseId: 1,
        name: fetchedCard.name,
        type: "query",
        display: fetchedCard.display,
        visualization_settings: {},
        dataset_query: getDatasetQuery,
        metadata: cardMetadata.payload.entities
      });
      const newQuestion = defaultQuestionTest.setCard(fetchedCard);
      setDefaultQuestion(newQuestion);
      setCard(fetchedCard);
    } catch (error) {
      console.error("Error fetching card content:", error);
    }
  };

  const handleDefaultMessage = data => {
    addServerMessage(
      data.message || "Received a message from the server.",
      "text",
    );
  };

  const addServerMessage = (message, type) => {
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: Date.now(),
        text: message,
        sender: "server",
        type: type,
      },
    ]);
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

    setMessages(prevMessages => [...prevMessages, userMessage]);

    const response = {
      type: "query",
      task: inputValue,
      thread_id: 1,
    };
    if (isConnected) {
      ws && ws.send(JSON.stringify(response));
      setInputValue("");
    }
  };
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "80vh",  // Full height of the viewport
        width: "100%",
      }}
    >
      <div
        style={{
          flex: card ? "0 1 auto" : "1 1 auto", // If there is a card, allow space for the visualization, otherwise let chat occupy more space
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <ChatMessageList messages={messages} />
      </div>

      {card && (
        <div
          style={{
            flex: "1 0 50%",  // Allow visualization to take up half of the remaining space
            padding: "16px",
            overflow: "hidden",
            minHeight: "400px", // Minimum height for the visualization
          }}
        >
          <VisualizationResult
            question={defaultQuestion}
            isDirty={false}
            queryBuilderMode={"view"}
            result={result}
            className={"chat__visualization___3Z6Z-"}
            rawSeries={[{ card, data: result && result.data }]}
            isRunning={false} // Adjust according to your logic
            navigateToNewCardInsideQB={null} // Placeholder or actual function
            onNavigateBack={() => console.log('back')} // Placeholder or actual function
            timelineEvents={[]}
            selectedTimelineEventIds={[]}
          />
        </div>
      )}

      <div
        style={{
          flexShrink: 0,
          padding: "16px",
          backgroundColor: "#FFF",
          borderTop: "1px solid #E0E0E0",
          display: "flex",
          alignItems: "center",
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
          onClick={sendMessage}
          style={{ borderRadius: "12px", padding: "8px" }}
        >
          <Icon size={28} style={{ marginTop: "4px", marginBottom: "auto", padding: "0px", paddingLeft: "4px", paddingRight: "4px" }} name="sendChat" />
        </Button>
      </div>
    </Box>
  );
};

export default WebSocketHandler;
