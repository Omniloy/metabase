import { t } from "ttag";
import { useEffect, useState } from "react";

import NoResults from "assets/img/no_results.svg";
import {
  useGetCubeDataQuery,
  useUpdateCubeDataMutation,
  useSyncDatabaseSchemaMutation,
  skipToken,
} from "metabase/api";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";
import { Button, Box, Input } from "metabase/ui";
import { getUser } from "metabase/selectors/user";
import {
  BrowseContainer,
  BrowseMain,
  BrowseSection,
  CenteredEmptyState,
} from "./BrowseContainer.styled";
import { CubeResult, CubeTable } from "./CubeTable";
import { SingleCube } from "./CubeSql";
import { CubeHeader } from "./CubeHeader";
import { BrowseHeaderContent } from "./BrowseHeader.styled";
import { CubeDataItem } from "metabase-types/api";
import { CubePreviewTable } from "metabase/components/Cube/CubePreviewTable";
import { useSelector } from "react-redux";
import {
  useListCubesRequestDetailsQuery,
  useUpdateCubesRequestDetailsMutation,
} from "metabase/api/cubes_requests";
import { useSetting } from "metabase/common/hooks";

export const BrowseCubes = () => {
  const siteName = useSetting("site-name");
  const formattedSiteName = siteName
    ? siteName.replace(/\s+/g, "_").toLowerCase()
    : "";
  const [updateCubesRequestDetails] = useUpdateCubesRequestDetailsMutation(); // Initialize the mutation hook

  const user = useSelector(getUser);

  // Hook to fetch cube requests
  const {
    data: cubeRequestsData,
    isLoading: isLoadingRequests,
    error: errorRequests,
    refetch: refetchCubeRequests, // Add refetch to trigger fetch again
  } = useListCubesRequestDetailsQuery(); // Use the hook directly

  const {
    data: cubeDataResponse,
    isLoading,
    error,
  } = useGetCubeDataQuery(formattedSiteName ? { projectName: formattedSiteName } : skipToken);
  const [updateCubeData] = useUpdateCubeDataMutation();
  const [syncSChema] = useSyncDatabaseSchemaMutation();
  const [dbId, setDbId] = useState<number | null>(null);
  const [isCubeFlowOpen, setIsCubeFlowOpen] = useState<boolean>(false);
  const [selectedCube, setSelectedCube] = useState<CubeDataItem | null>(null);
  const [isSql, setIsSql] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [activeTab, setActiveTab] = useState("Definition");
  const [showValidations, setShowValidations] = useState<boolean>(false);

  // State for filter inputs
  const [descriptionFilter, setDescriptionFilter] = useState<string>(""); // New filter state
  const [userFilter, setUserFilter] = useState<string>("");
  const [verified_statusFilter, setverified_statusFilter] =
    useState<string>(""); // New filter state
  const [selectTeamFilter, setSelectTeamFilter] = useState<string>("");

  useEffect(() => {
    if (cubeDataResponse?.cubes) {
      setCubeFromUrl(cubeDataResponse.cubes);
    }
  }, [cubeDataResponse]);

  const handleSemanticView = () => {
    setIsSql(!isSql);
  };

  const setCubeFromUrl = (cubes: CubeDataItem[]) => {
    const cubeName = window.location.pathname.split("/").pop();

    if (!cubeName) return;

    const matchedCube = cubes.find((cube) => {
      const fileName = cube.name.toLowerCase();
      return fileName === cubeName.toLowerCase();
    });

    if (matchedCube) {
      setSelectedCube(matchedCube);
      setTitle(matchedCube.title);
      const dbId = setDbFromUrl();
      if (dbId !== undefined) {
        setDbId(dbId);
      }
    } else {
      console.warn(`No cube found matching the name: ${cubeName}`);
      setSelectedCube(null);
    }
  };

  const setDbFromUrl = () => {
    const pathSegments = window.location.pathname.split("/");
    const cubesIndex = pathSegments.indexOf("cubes");
    if (cubesIndex === -1 || cubesIndex === 0) return;

    const slug = pathSegments[cubesIndex - 1];

    if (!slug) return;
    const indexOfDash = slug.indexOf("-");
    if (indexOfDash === -1) {
      return 0;
    }
    return Number(slug.substring(0, indexOfDash));
  };


  const tabStyle = {
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  };

  const activeTabStyle = {
    ...tabStyle,
    borderBottom: "2px solid #587330",
  };

  if (error) {
    return <LoadingAndErrorWrapper error />;
  }

  if (!cubeDataResponse && isLoading) {
    return <LoadingAndErrorWrapper loading />;
  }

  if (!cubeDataResponse?.cubes.length) {
    return (
      <CenteredEmptyState
        title={<Box mb=".5rem">{t`No databases here yet`}</Box>}
        illustrationElement={
          <Box mb=".5rem">
            <img src={NoResults} />
          </Box>
        }
      />
    );
  }

  const handleUpdateverified_status = async (updatedCube: CubeResult) => {
    if (!selectedCube || !cubeRequestsData) return;
    const cubesDataArray = cubeRequestsData;

    const matchingCubeRequest = cubesDataArray.find(
      (cubeRequest: any) => cubeRequest.description === updatedCube.description,
    );

    if (!matchingCubeRequest) {
      console.warn("No matching cube request found to update.");
      return;
    }

    const admin_user = user?.common_name;
    if (!admin_user || admin_user.trim() === "") {
      console.error("Admin User is invalid or empty:", admin_user);
      return;
    }

    const updatedDetails = {
      id: matchingCubeRequest.id,
      verified_status: true,
      admin_user: admin_user,
      user: matchingCubeRequest.user,
      description: matchingCubeRequest.description,
      in_semantic_layer: matchingCubeRequest.in_semantic_layer,
    };

    try {
      await updateCubesRequestDetails(updatedDetails).unwrap();
      refetchCubeRequests(); // Refetch data after update
    } catch (error) {
      console.error("Failed to update cube request details:", error);
    }
  };

  return (
    <BrowseContainer>
      {selectedCube !== null && <CubeHeader cube={selectedCube} />}
      <BrowseMain>
        <BrowseSection>
          <div>
            {cubeDataResponse && !isCubeFlowOpen && selectedCube === null ? (
              <>
                <div style={{ display: "flex", flexDirection: "row" }}></div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "row" }}>
                {selectedCube !== null && (
                  <>
                    {isSql ? (
                      <SingleCube
                        cube={selectedCube}
                        isExpanded={true}
                        handleSemanticView={handleSemanticView}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <BrowseHeaderContent />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "20px",
                            marginBottom: "10px",
                          }}
                        >
                          {/* Conditionally render filters or tabs based on showValidations */}
                          {showValidations ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                gap: "10px",
                              }}
                            >
                              <Input
                                placeholder={t`Description`} // Description Filter
                                value={descriptionFilter}
                                onChange={e =>
                                  setDescriptionFilter(e.target.value)
                                }
                              />
                              <Input
                                placeholder={t`User`}
                                value={userFilter}
                                onChange={e => setUserFilter(e.target.value)}
                              />
                              <Input
                                placeholder={t`Verified Status`} // Verified Status Filter
                                value={verified_statusFilter}
                                onChange={e =>
                                  setverified_statusFilter(e.target.value)
                                }
                              />
                              <Input
                                placeholder={t`Select Team`}
                                value={selectTeamFilter}
                                onChange={e =>
                                  setSelectTeamFilter(e.target.value)
                                }
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                              }}
                            >
                              <div
                                style={
                                  activeTab === "Definition"
                                    ? activeTabStyle
                                    : tabStyle
                                }
                                onClick={() => setActiveTab("Definition")}
                              >
                                Definition
                              </div>
                              <div
                                style={
                                  activeTab === "Preview"
                                    ? activeTabStyle
                                    : tabStyle
                                }
                                onClick={() => setActiveTab("Preview")}
                              >
                                Preview
                              </div>
                            </div>
                          )}
                          {/* Validations button remains on the right side */}
                          {cubeRequestsData && cubeRequestsData.length > 0 && (
                            <Button
                              style={{
                                width: "150px",
                                height: "40px",
                                marginLeft: "auto",
                                background: "#D5E3C3",
                                color: "#587330",
                                borderRadius: "8px",
                              }}
                              onClick={() =>
                                setShowValidations(!showValidations)
                              }
                            >
                              {showValidations
                                ? t`Definitions`
                                : t`Validations`}
                            </Button>
                          )}
                          {/*!showValidations && (
                            <Button
                              style={{
                                width: "150px",
                                height: "40px",
                                background: "#D5E3C3",
                                color: "#587330",
                                borderRadius: "8px",
                              }}
                              onClick={handleSemanticView}
                            >
                              {t`Edit Cube`}
                            </Button>
                          )*/}
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          {activeTab === "Definition" &&
                            (showValidations ? (
                              <CubeTable
                                cubeData={selectedCube}
                                isValidation={true}
                                handleSemanticView={handleSemanticView}
                                onUpdateCube={handleUpdateverified_status}
                                questionFilter={descriptionFilter} // Pass descriptionFilter
                                isValidateFilter={verified_statusFilter} // Pass verified_statusFilter
                                userFilter={userFilter} // Pass userFilter
                                cubeRequests={cubeRequestsData} // Use fetched cube requests data
                              />
                            ) : (
                              <CubeTable
                                cubeData={selectedCube}
                                isValidation={false}
                                handleSemanticView={handleSemanticView}
                                onUpdateCube={handleUpdateverified_status}
                                questionFilter={descriptionFilter} // Pass descriptionFilter
                                isValidateFilter={verified_statusFilter} // Pass verified_statusFilter
                                userFilter={userFilter} // Pass userFilter
                                cubeRequests={cubeRequestsData} // Use fetched cube requests data
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </BrowseSection>
        {cubeDataResponse?.cubes && selectedCube && activeTab === "Preview" && dbId && (
          <CubePreviewTable dbId={dbId} cubeData={selectedCube} />
        )}
      </BrowseMain>
    </BrowseContainer>
  );
};
