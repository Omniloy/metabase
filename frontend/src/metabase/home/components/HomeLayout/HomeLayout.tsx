import { useEffect, useState } from "react";
import { LayoutRoot, ContentContainer, ChatSection } from "./HomeLayout.styled";
import { ChatGreeting } from "metabase/browse/components/ChatItems/Welcome";
import { HomeInitialOptions } from "metabase/browse/components/ChatItems/InitialOptions";
import ChatPrompt from "metabase/browse/components/ChatItems/Prompt";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { push } from "react-router-redux"; // Import the push method for navigation
import {
  getInitialMessage,
  setInitialMessage,
} from "metabase/redux/initialMessage";
import { setDBInputValue, setCompanyName } from "metabase/redux/initialDb";
import ChatAssistant from "metabase/query_builder/components/ChatAssistant";
import {
  BrowseContainer,
  BrowseMain,
} from "metabase/browse/components/BrowseContainer.styled";
import { Flex, Stack } from "metabase/ui";
import ChatHistory from "metabase/browse/components/ChatItems/ChatHistory";
import { useListDatabasesQuery } from "metabase/api";

export const HomeLayout = () => {
  const initialMessage = useSelector(getInitialMessage);
  const [inputValue, setInputValue] = useState("");
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [selectedChatHistory, setSelectedChatHistory] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedChatType, setSelectedChatType] = useState("default");
  const [selectedChatHistoryType, setSelectedChatHistoryType] =
    useState("dataAgent");
  const [oldCardId, setOldCardId] = useState(null);
  const [insights, setInsights] = useState([]);
  const dispatch = useDispatch();
  const {
    data,
    isLoading: dbLoading,
    error: dbError,
  } = useListDatabasesQuery();
  const databases = data?.data;
  useEffect(() => {
    if (databases) {
      const cubeDatabase = databases.find(
        database => database.is_cube === true,
      );
      if (cubeDatabase) {
        dispatch(setDBInputValue(cubeDatabase.id as number));
        dispatch(setCompanyName(cubeDatabase.company_name as string));
      }
    }
  }, [databases]);

  useEffect(() => {
    setInputValue("");
    dispatch(setInitialMessage(""));
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/") {
      setSelectedChatType("default");
      setSelectedChatHistoryType("dataAgent");
      setInsights([]);
    } else if (window.location.pathname === "/browse/insights") {
      setSelectedChatType("insights");
      setSelectedChatHistoryType("getInsights");
      setInsights(insights);
    } else if (window.location.pathname === "/browse/chat") {
      setSelectedChatType("default");
      setSelectedChatHistoryType("dataAgent");
      setInsights([]);
    }
  }, [window.location.pathname]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    dispatch(setInitialMessage(inputValue)); // Set the initial message in Redux

    if (window.location.pathname === "/") {
      dispatch(push("/browse/chat")); // Navigate to /browse/chat
    } else if (window.location.pathname === "/browse/insights") {
      setShowChatAssistant(true); // Show the ChatAssistant component
    }

    setInputValue(""); // Clear the input value
  };

  return (
    <>
      {!showChatAssistant ? (
        <LayoutRoot data-testid="home-page">
          <ContentContainer>
            <ChatGreeting chatType={selectedChatType} />
            {/* <HomeInitialOptions /> REMOVED UNTIL FUNCTIONALITY IS COMPLETED*/}
          </ContentContainer>
          <ChatSection>
            <ChatPrompt
              chatType={selectedChatType}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={handleSendMessage}
            />
          </ChatSection>
        </LayoutRoot>
      ) : (
        <BrowseContainer>
          <BrowseMain>
            <Flex style={{ height: "100%", width: "100%" }}>
              <Stack
                mb="lg"
                spacing="xs"
                style={{
                  flexGrow: 1,
                  marginTop: "1rem",
                  borderRight: "1px solid #e3e3e3",
                }}
              >
                <ChatAssistant
                  selectedMessages={selectedChatHistory}
                  selectedThreadId={selectedThreadId}
                  chatType={selectedChatType}
                  oldCardId={oldCardId}
                  insights={insights}
                  setSelectedThreadId={setSelectedThreadId}
                  initial_message={initialMessage}
                />
              </Stack>
              <Stack
                mb="lg"
                spacing="xs"
                style={{ minWidth: "300px", width: "300px", marginTop: "1rem" }}
              >
                <ChatHistory
                  setSelectedChatHistory={setSelectedChatHistory}
                  setThreadId={setSelectedThreadId}
                  type={selectedChatHistoryType}
                  setOldCardId={setOldCardId}
                  setInsights={setInsights}
                />
              </Stack>
            </Flex>
          </BrowseMain>
        </BrowseContainer>
      )}
    </>
  );
};
