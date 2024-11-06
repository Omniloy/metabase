import { useEffect, useMemo, useState } from "react";
import { LayoutRoot, ContentContainer, ChatSection } from "./HomeLayout.styled";
import { ChatGreeting } from "metabase/browse/components/ChatItems/Welcome";
import ChatPrompt from "metabase/browse/components/ChatItems/Prompt";
import { useDispatch } from "metabase/lib/redux";
import {
  setInitialMessage
} from "metabase/redux/initialMessage";
import { setDBInputValue, setCompanyName, setInsightDBInputValue, getDBInputValue } from "metabase/redux/initialDb";
import { setInitialSchema, setInitialInsightSchema } from "metabase/redux/initialSchema";
import { Flex, Stack, Icon } from "metabase/ui";
import { useListDatabasesQuery, useGetDatabaseMetadataWithoutParamsQuery, skipToken } from "metabase/api";
import LoadingSpinner from "metabase/components/LoadingSpinner";
import { NoDatabaseError, SemanticError } from "metabase/components/ErrorPages";
import { Client } from "@langchain/langgraph-sdk";
import { Client as ClientSmith } from "langsmith/client";
import { useSetting } from "metabase/common/hooks";
import { t } from "ttag";
import { Canvas } from "metabase/query_builder/components/Canvas/Canvas";

export const HomeLayout = () => {
  const [inputValue, setInputValue] = useState("");
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [selectedChatType, setSelectedChatType] = useState("default");
  const [selectedChatHistoryType, setSelectedChatHistoryType] =
    useState("dataAgent");
  const [insights, setInsights] = useState([]);
  const [hasDatabases, setHasDatabases] = useState<boolean>(false)
  const [dbId, setDbId] = useState<number | null>(null)
  const [schema, setSchema] = useState<any[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [insightDB, setInsightDB] = useState<number | null>(null);
  const [insightSchema, setInsightSchema] = useState<any[]>([]);
  const langchain_url =
    "https://assistants-prod-9c6885f051b75a548b0496804051487b.default.us.langgraph.app";
  const langchain_key = "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";
  const [client, setClient] = useState<any>(null);
  const [clientSmith, setSmithClient] = useState<any>(null);
  const siteName = useSetting("site-name");
  const formattedSiteName = siteName
  ? siteName.replace(/\s+/g, "_").toLowerCase()
  : "";
  
  useEffect(() => {
    const initializeClient = async () => {
      const clientInstance = new Client();
      const clientSmithInstance = new ClientSmith({ apiKey: langchain_key })
      setSmithClient(clientSmithInstance)
      setClient(clientInstance);
    };
    if (langchain_url !== null && langchain_key !== null) {
      initializeClient();
    }

  }, [langchain_url, langchain_key]);
  

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

  return (
    <>
      {showChatAssistant ? (
        <>
          {!hasDatabases ? (
            <NoDatabaseError />
          ) : (
            <>
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
                  </LayoutRoot>
                ))

              }
            </>

          )}
        </>
      ) : (
  
            <Flex style={{ height: "100%", width: "100%" }}>
              <Stack
                mb="lg"
                spacing="xs"
                style={{
                  flexGrow: 1,
                }}
              >
                <Canvas user={{id: '1'}} />
              </Stack>
              
            </Flex>
       
      )}
    </>
  );
};

