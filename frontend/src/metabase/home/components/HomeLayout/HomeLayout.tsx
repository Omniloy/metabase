import { useEffect, useMemo, useState } from "react";
import { LayoutRoot, ContentContainer, ChatSection } from "./HomeLayout.styled";
import { ChatGreeting } from "metabase/browse/components/ChatItems/Welcome";
import ChatPrompt from "metabase/browse/components/ChatItems/Prompt";
import { useDispatch, useSelector } from "metabase/lib/redux";
import {
  getInitialMessage,
  setInitialMessage
} from "metabase/redux/initialMessage";
import { setDBInputValue, setCompanyName, setInsightDBInputValue, getDBInputValue } from "metabase/redux/initialDb";
import { setInitialSchema, setInitialInsightSchema } from "metabase/redux/initialSchema";
import ChatAssistant from "metabase/query_builder/components/ChatAssistant";
import {
  BrowseContainer,
  BrowseMain,
} from "metabase/browse/components/BrowseContainer.styled";
import Modal from "metabase/components/Modal";
import Input from "metabase/core/components/Input";
import { Flex, Stack, Icon, Button } from "metabase/ui";
import ChatHistory from "metabase/browse/components/ChatItems/ChatHistory";
import { useListDatabasesQuery, useGetDatabaseMetadataWithoutParamsQuery, skipToken } from "metabase/api";
import LoadingSpinner from "metabase/components/LoadingSpinner";
import { generateRandomId } from "metabase/lib/utils";
import { getSuggestions } from "metabase/redux/suggestionsSlice";
import { NoDatabaseError, SemanticError } from "metabase/components/ErrorPages";
import { Client } from "@langchain/langgraph-sdk";
import { Client as ClientSmith } from "langsmith/client";
import { useSetting } from "metabase/common/hooks";
import { t } from "ttag";
import { CardApi } from "metabase/services";

export const HomeLayout = () => {
  const [isDBModalOpen, setIsDBModalOpen] = useState(false);
  const initialMessage = useSelector(getInitialMessage);
  const suggestions = useSelector(getSuggestions);
  const metabase_id_back = localStorage.getItem("metabase_id_back")
  const [inputValue, setInputValue] = useState("");
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [selectedChatHistory, setSelectedChatHistory] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedChatType, setSelectedChatType] = useState("default");
  const [selectedChatHistoryType, setSelectedChatHistoryType] =
    useState("dataAgent");
  const [oldCardId, setOldCardId] = useState(null);
  const [insights, setInsights] = useState([]);
  const [hasDatabases, setHasDatabases] = useState<boolean>(false)
  const [dbId, setDbId] = useState<number | null>(null)
  const [schema, setSchema] = useState<any[]>([]);
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null)
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [insightDB, setInsightDB] = useState<number | null>(null);
  const [insightSchema, setInsightSchema] = useState<any[]>([]);
  const langchain_url =
    "https://assistants-prod-9c6885f051b75a548b0496804051487b.default.us.langgraph.app";
  const langchain_key = "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";
  const [client, setClient] = useState<any>(null);
  const [clientSmith, setSmithClient] = useState<any>(null);
  const [modelSchema, setModelSchema] = useState([])
  const [shouldRefetchHistory, setShouldRefetchHistory] = useState(false); // State to trigger chat history refresh
  const siteName = useSetting("site-name");
  const formattedSiteName = siteName
    ? siteName.replace(/\s+/g, "_").toLowerCase()
    : "";

  const [dbInputValueModal, setDBInputValueModal] = useState("");

  useEffect(() => {
    const initializeClient = async () => {
      const clientInstance = new Client({ apiUrl: langchain_url, apiKey: langchain_key });
      const clientSmithInstance = new ClientSmith({ apiKey: langchain_key })
      setSmithClient(clientSmithInstance)
      setClient(clientInstance);
    };
    if (langchain_url !== null && langchain_key !== null) {
      initializeClient();
    }

  }, [langchain_url, langchain_key]);


  useEffect(() => {
    const getCards = async () => {
      try {
        const cardsList = await CardApi.list();
        const modelCards = cardsList
          .filter((card: any) => card.type === "model")
          .map((card: any) => ({
            id: `card__${card.id}`,
            model_schema: (card.result_metadata || []).map((metadata: any) => {
              const { field_ref, visibility_type, coercion_strategy, settings, ...rest } = metadata;
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



  const dispatch = useDispatch();
  const {
    data,
    isLoading: dbLoading,
    error: dbError,
  } = useListDatabasesQuery();
  const databases = data?.data;
  useMemo(() => {
    if (databases) {
      setHasDatabases(databases.length > 0)
      if (databases.length > 0) {
        setInsightDB(databases[0].id as number)
        dispatch(setInsightDBInputValue(databases[0].id as number));

        setShowButton(true);
        dispatch(setDBInputValue(databases[0].id as number));
        dispatch(setCompanyName(formattedSiteName as string));
        setDbId(databases[0].id as number)
      }

    }
  }, [databases]);

  const {
    data: databaseMetadata,
    isLoading: databaseMetadataIsLoading,
    error: databaseMetadataIsError
  } = useGetDatabaseMetadataWithoutParamsQuery(
    dbId !== null
      ? { id: dbId }
      : skipToken
  );
  const databaseMetadataData = databaseMetadata;
  useEffect(() => {
    if (databaseMetadataData && Array.isArray(databaseMetadataData.tables)) {
      const schema = databaseMetadata.tables?.map((table: any) => ({
        display_name: table.display_name,
        id: table.id,
        fields: table.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          fieldName: field.display_name,
          description: field.description,
          details: field.fingerprint ? JSON.stringify(field.fingerprint) : null
        }))
      }));
      dispatch(setInitialSchema(schema as any))
      setSchema(schema as any)
    }
  }, [databaseMetadataData]);

  const {
    data: rawDatabaseMetadata,
    isLoading: rawDatabaseMetadataIsLoading,
    error: rawDatabaseMetadataIsError
  } = useGetDatabaseMetadataWithoutParamsQuery(
    insightDB !== null ? { id: insightDB } : skipToken
  );

  useEffect(() => {
    if (rawDatabaseMetadata && Array.isArray(rawDatabaseMetadata.tables)) {
      const rawSchema = rawDatabaseMetadata.tables.map((table) => ({
        display_name: table.display_name,
        id: table.id,
        fields: table.fields?.map((field) => ({
          id: field.id,
          name: field.name,
          fieldName: field.display_name,
          description: field.description,
          details: field.fingerprint ? JSON.stringify(field.fingerprint) : null
        }))
      }));
      setInsightSchema(rawSchema);
      dispatch(setInitialInsightSchema(rawSchema))
    }
  }, [rawDatabaseMetadata]);


  useEffect(() => {
    setInputValue("");
    dispatch(setInitialMessage(""));
  }, []);

  useEffect(() => {

    setInputValue("");
    dispatch(setInitialMessage(""));
    setShowChatAssistant(false);

    if (window.location.pathname === "/browse/insights") {
      setSelectedChatType("insights");
      setSelectedChatHistoryType("getInsights");
      setInsights(insights);
      return;
    }

    // "/" ||  "/browse/chat"
    setSelectedChatType("default");
    setSelectedChatHistoryType("dataAgent");
    setInsights([]);

  }, [window.location.pathname]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    dispatch(setInitialMessage(inputValue)); // Set the initial message in Redux
    setShowChatAssistant(true);

    setInputValue(""); // Clear the input value
  };

  const handleStartNewChat = async () => {
    try {
      if (!client) return;
      const createdThread = await client.threads.create();

      setSelectedThreadId(null);
      setThreadId(createdThread);

      setMessages([]);
      setInputValue("");

      setOldCardId(null);
    } catch (error) {
      console.error("Error creating new chat thread:", error);
    }
  };

  const toggleChatHistory = () => {
    setIsChatHistoryOpen(!isChatHistoryOpen);
  };

  return (
    <>
      {!showChatAssistant ? (
        <>
          {!hasDatabases ? (
            <NoDatabaseError />
          ) : (
            <>
              <Button
                variant="outlined"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                  zIndex: "900"
                }}
                onClick={() => setIsDBModalOpen(true)}
              >
                <Icon name="database" size={20} />
              </Button>
              
              {!dbId && window.location.pathname === "/browse/chat" ? <SemanticError details={undefined} /> :
                (window.location.pathname !== "/browse/chat" ? (
                  <LayoutRoot data-testid="home-page">
                    <ContentContainer>
                      <ChatGreeting chatType={selectedChatType} />
                    </ContentContainer>
                    {schema.length > 0 ? (
                      <ChatSection>
                        <ChatPrompt
                          client={client}
                          chatType={selectedChatType}
                          inputValue={inputValue}
                          setInputValue={setInputValue}
                          onSendMessage={handleSendMessage}
                        />
                      </ChatSection>
                    ) : (
                      <ChatSection>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                            <p style={{ fontSize: "16px", color: "#76797D", fontWeight: "500", marginBottom: "1rem" }}>
                              {t`Please Wait while we initialize the chat`}
                            </p>
                            <LoadingSpinner />
                          </div>
                        </div>
                      </ChatSection>
                    )}
                  </LayoutRoot>
                ) : (
                  <LayoutRoot data-testid="home-page" style={{ display: "flex", flexDirection: "row", padding: "4rem 4rem 2rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", width: "70%", justifyContent: "space-between" }}>
                      <ContentContainer>
                        <ChatGreeting chatType={selectedChatType} />
                      </ContentContainer>
                      {schema.length > 0 ? (
                        <ChatSection>
                          <ChatPrompt
                            client={client}
                            chatType={selectedChatType}
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            onSendMessage={handleSendMessage}
                          />
                        </ChatSection>
                      ) : (
                        <ChatSection>
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                              <p style={{ fontSize: "16px", color: "#76797D", fontWeight: "500", marginBottom: "1rem" }}>
                                {t`Please Wait while we initialize the chat`}
                              </p>
                              <LoadingSpinner />
                            </div>
                          </div>
                        </ChatSection>
                      )}
                    </div>
                    {client && (
                      <Stack
                        mb="lg"
                        spacing="xs"
                        style={{ minWidth: "300px", width: "300px" }}
                      >
                        <ChatHistory
                          client={client}
                          setSelectedChatHistory={setSelectedChatHistory}
                          setThreadId={setSelectedThreadId}
                          type={selectedChatHistoryType}
                          setOldCardId={setOldCardId}
                          setInsights={setInsights}
                          showChatAssistant={showChatAssistant}
                          setShowChatAssistant={setShowChatAssistant}
                          shouldRefetchHistory={shouldRefetchHistory}
                          setShouldRefetchHistory={setShouldRefetchHistory}
                        />
                      </Stack>
                    )}

                  </LayoutRoot>
                ))

              }
            </>

          )}
        </>
      ) : (
        <BrowseContainer>
          {showButton && (
            <Flex
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
                marginRight: "3rem",
                gap: "1rem",
              }}
            >
              <button
                style={{ color: isChatHistoryOpen ? "#8A64DF" : "#76797D", cursor: "pointer", marginTop: ".2rem" }}
                onClick={toggleChatHistory}
              >
                <Icon
                  name="chatHistory"
                  size={18}
                  style={{ fill: isChatHistoryOpen ? "#8A64DF" : "#76797D", paddingTop: "2px", paddingLeft: "2px" }}
                />
              </button>

              <button
                style={{ color: "#8A64DF", cursor: "pointer" }}
                onClick={handleStartNewChat}
              >
                <p style={{ fontSize: "14px", color: "#8A64DF", fontWeight: "500" }}>
                  {t`New Thread`}
                </p>
              </button>
            </Flex>
          )}
          <BrowseMain>
            <Flex style={{ height: "85vh", width: "100%" }}>
              <Stack
                mb="lg"
                spacing="xs"
                style={{
                  flexGrow: 1,
                  // borderRight: isChatHistoryOpen ? "1px solid #e3e3e3" : "none",
                }}
              >
                <ChatAssistant
                  metabase_id_back={metabase_id_back}
                  client={client}
                  clientSmith={clientSmith}
                  selectedMessages={selectedChatHistory}
                  selectedThreadId={selectedThreadId}
                  chatType={selectedChatType}
                  setSelectedThreadId={setSelectedThreadId}
                  initial_message={initialMessage}
                  setInitialMessage={setInitialMessage}
                  setMessages={setMessages}
                  setInputValue={setInputValue}
                  setThreadId={setThreadId}
                  threadId={threadId}
                  inputValue={inputValue}
                  messages={messages}
                  isChatHistoryOpen={isChatHistoryOpen}
                  setShowButton={setShowButton}
                  setShouldRefetchHistory={setShouldRefetchHistory}
                  modelSchema={modelSchema}
                  customDbValue={dbInputValueModal}
                />
              </Stack>
              {isChatHistoryOpen && selectedChatType !== "insights" && (
                <Stack
                  mb="lg"
                  spacing="xs"
                  style={{ minWidth: "300px", width: "300px", marginTop: "1rem" }}
                >
                  <ChatHistory
                    client={client}
                    setSelectedChatHistory={setSelectedChatHistory}
                    setThreadId={setSelectedThreadId}
                    type={selectedChatHistoryType}
                    setOldCardId={setOldCardId}
                    setInsights={setInsights}
                    showChatAssistant={showChatAssistant}
                    setShowChatAssistant={setShowChatAssistant}
                    shouldRefetchHistory={shouldRefetchHistory}
                    setShouldRefetchHistory={setShouldRefetchHistory}
                  />
                </Stack>
              )}
            </Flex>
          </BrowseMain>
        </BrowseContainer>
      )}
      {isDBModalOpen && (
        <Modal isOpen={isDBModalOpen} onClose={() => setIsDBModalOpen(false)}>
          <div style={{ padding: "20px" }}>
            <h2 style={{ marginBottom: "10px" }}>Enter DB Value</h2>
            <Input
              id="dbInput"
              type="text"
              value={dbInputValueModal}
              onChange={(e) => setDBInputValueModal(e.target.value)}
              style={{ marginBottom: "20px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" style={{ marginRight: "10px" }} onClick={() => setIsDBModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="filled" onClick={() => setIsDBModalOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

