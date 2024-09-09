import { t } from "ttag";

import NoResults from "assets/img/no_results.svg";
import { useListDatabasesWithTablesQuery } from "metabase/api";
import { useCreateCompanyMutation } from "metabase/api/cube";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";
import CS from "metabase/css/core/index.css";
import { color } from "metabase/lib/colors";
import * as Urls from "metabase/lib/urls";
import { Box, Button, Icon, Title } from "metabase/ui";

import {
  BrowseContainer,
  BrowseMain,
  BrowseSection,
  CenteredEmptyState,
} from "./BrowseContainer.styled";
import { BrowseDataHeader } from "./BrowseDataHeader";
import {
  DatabaseCard,
  DatabaseCardLink,
  DatabaseGrid,
} from "./BrowseDatabases.styled";
import { BrowseSemanticHeader } from "./BrowseSemanticHeader";
import { BrowseSemanticLayerTable } from "./BrowseSemanticLayerTable";
import { useEffect, useState } from "react";
import Database from "metabase-lib/v1/metadata/Database";


const mapDetailsToRequest = (details: Record<string, unknown>) => {
  return {
    dbHost: details.host as string || "localhost",
    dbPort: details.port as number || 5432,
    dbName: details.dbname as string || "unknown_db",
    dbUser: details.user as string || "unknown_user",
    dbPass: details.password as string || "unknown_password",
    dbType: "postgres",
  };
};

export const BrowseSemanticLayers = () => {
  const [showTable, setShowTable] = useState(false);
  const [showNonCubeDatabases, setShowNonCubeDatabases] = useState(false);
  const { data, isLoading, error } = useListDatabasesWithTablesQuery();
  const [createCompany] = useCreateCompanyMutation();
  const databases = data?.data;

  useEffect(() => {
    const filteredDatabases = databases?.filter(database => database.is_cube === true);

    if (filteredDatabases?.length === 1) {
      // Navigate directly to the component if only one database exists
      window.history.pushState({}, '', Urls.browseSemanticLayer(filteredDatabases[0]));
      setShowTable(true);
    }
  }, [databases]);

  const handleCreateCompany = async (database: any) => {
    const parsedDetails = mapDetailsToRequest(database.details);

    if (!parsedDetails) {
      console.error("Failed to parse database details");
      return;
    }
    try {
      await createCompany({
        companyName: database.companyName,
        databaseId: database.id,
        ...parsedDetails,
      });
      window.history.pushState({}, '', Urls.browseSemanticLayer(database));
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  if (error) {
    return <LoadingAndErrorWrapper error />;
  }

  if (!databases && isLoading) {
    return <LoadingAndErrorWrapper loading />;
  }

  const filteredDatabases = databases?.filter(database => database.is_cube === true);

  const nonCubeDatabases = databases?.filter(database => database.is_cube === false && database.engine === "postgres");

  if (!filteredDatabases?.length && !showNonCubeDatabases) {
    return (
      <CenteredEmptyState
        title={
          <>
            <Box mb=".5rem">{t`No Semantic Layer here yet`}</Box>
            {nonCubeDatabases?.length !== 0 &&
              <Button variant="filled" onClick={() => setShowNonCubeDatabases(true)}>Add Semantic Layer</Button>
            }
          </>
        }
        illustrationElement={
          <Box mb=".5rem">
            <img src={NoResults} />
          </Box>
        }
      />
    );
  }

  if (showTable) {
    return <BrowseSemanticLayerTable />;
  }


  if (showNonCubeDatabases) {
    return (
      <BrowseContainer>
        <BrowseSemanticHeader />
        <BrowseMain>
          <BrowseSection>
            <DatabaseGrid data-testid="database-browser">
              {nonCubeDatabases?.map(database => (
                <div key={database.id}>
                  <DatabaseCard onClick={() => handleCreateCompany(database)}>
                    <Icon
                      name="semantic_layer"
                      color={color("accent2")}
                      className={CS.mb3}
                      size={32}
                    />
                    <Title order={2} size="1rem" lh="1rem" color="inherit">
                      {database.name}
                    </Title>
                  </DatabaseCard>
                </div>
              ))}
            </DatabaseGrid>
          </BrowseSection>
        </BrowseMain>
      </BrowseContainer>
    );
  }

  return (
    <BrowseContainer>
      <BrowseSemanticHeader />
      <BrowseMain>
        <BrowseSection>
          <DatabaseGrid data-testid="database-browser">
            {filteredDatabases!.map(database => (
              <div key={database.id}>
                <DatabaseCard onClick={() => handleCreateCompany(database)}>
                  <Icon
                    name="semantic_layer"
                    color={color("accent2")}
                    className={CS.mb3}
                    size={32}
                  />
                  <Title order={2} size="1rem" lh="1rem" color="inherit">
                    {database.name}
                  </Title>
                </DatabaseCard>
              </div>
            ))}
          </DatabaseGrid>
        </BrowseSection>
      </BrowseMain>
    </BrowseContainer>
  );
};