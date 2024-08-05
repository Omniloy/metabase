import { useState, useMemo } from "react";
import { c, t } from "ttag";
import { useUserSetting } from "metabase/common/hooks";
import { useHasModels } from "metabase/common/hooks/use-has-models";
import CollapseSection from "metabase/components/CollapseSection";
import { DelayedLoadingAndErrorWrapper } from "metabase/components/LoadingAndErrorWrapper/DelayedLoadingAndErrorWrapper";
import CS from "metabase/css/core/index.css";
import { Flex, Skeleton } from "metabase/ui";
import { PaddedSidebarLink, SidebarHeading } from "../MainNavbar.styled";
import type { SelectedItem } from "../types";
import Modal from "metabase/components/Modal";
import Notebook from "metabase/query_builder/components/notebook/Notebook";
import Question from "metabase-lib/v1/Question";
import { DEFAULT_QUERY, SAMPLE_METADATA } from "metabase-lib/test-helpers";
import { runQuestionQuery } from "metabase/services";

export const BrowseNavSection = ({
  nonEntityItem,
  onItemSelect,
  hasDataAccess,
}: {
  nonEntityItem: SelectedItem;
  onItemSelect: () => void;
  hasDataAccess: boolean;
}) => {
  const BROWSE_MODELS_URL = "/browse/models";
  const BROWSE_DATA_URL = "/browse/databases";
  const BROWSE_CHAT = "/browse/chat";

  const {
    hasModels,
    isLoading: areModelsLoading,
    error: modelsError,
  } = useHasModels();
  const noModelsExist = hasModels === false;

  const [expandBrowse = true, setExpandBrowse] = useUserSetting(
    "expand-browse-in-nav",
  );

  const defaultQuestion = useMemo(() => {
    return Question.create({
      databaseId: 1,
      name: "Sample Question",
      type: "query",
      display: "table",
      visualization_settings: {},
      dataset_query: DEFAULT_QUERY,
      metadata: SAMPLE_METADATA,
    });
  }, []);

  const updateQuestion = async (updatedQuestion: Question) => {
    console.log("Update Question:", updatedQuestion);
  };

  const setQueryBuilderMode = (mode: string) => {
    console.log("Set Query Builder Mode:", mode);
  };

  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (noModelsExist && !hasDataAccess) {
    return null;
  }

  return (
    <>
      <CollapseSection
        header={
          <SidebarHeading>{c("A verb, shown in the sidebar")
            .t`Browse`}</SidebarHeading>
        }
        initialState={expandBrowse ? "expanded" : "collapsed"}
        iconPosition="right"
        iconSize={8}
        headerClass={CS.mb1}
        onToggle={setExpandBrowse}
      >
        <DelayedLoadingAndErrorWrapper
          loading={areModelsLoading}
          error={modelsError}
          loader={
            <Flex py="sm" px="md" h="32.67px" gap="sm" align="center">
              <Skeleton radius="md" h="md" w="md" />
              <Skeleton radius="xs" w="4rem" h="1.2rem" />
            </Flex>
          }
          delay={0}
        >
          {!noModelsExist && (
            <PaddedSidebarLink
              icon="model"
              url={BROWSE_MODELS_URL}
              isSelected={nonEntityItem?.url?.startsWith(BROWSE_MODELS_URL)}
              onClick={onItemSelect}
              aria-label={t`Browse models`}
            >
              {t`Models`}
            </PaddedSidebarLink>
          )}
        </DelayedLoadingAndErrorWrapper>
        {hasDataAccess && (
          <PaddedSidebarLink
            icon="database"
            url={BROWSE_DATA_URL}
            isSelected={nonEntityItem?.url?.startsWith(BROWSE_DATA_URL)}
            onClick={onItemSelect}
            aria-label={t`Browse databases`}
          >
            {t`Databases`}
          </PaddedSidebarLink>
        )}
        <PaddedSidebarLink
          icon="chat"
          url={BROWSE_CHAT}
          isSelected={nonEntityItem?.url?.startsWith(BROWSE_CHAT)}
          onClick={onItemSelect}
          aria-label={t`Chat`}
        >
          {t`Chat`}
        </PaddedSidebarLink>
        {/* <PaddedSidebarLink children={t`Chat`} icon="chat" onClick={openModal} /> */}
      </CollapseSection>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          full={false}
          title={"OMNILOY CHAT"}
        >
          <Notebook
            question={defaultQuestion}
            isDirty={true}
            isRunnable={true}
            isResultDirty={true}
            reportTimezone="UTC"
            hasVisualizeButton={true}
            updateQuestion={updateQuestion}
            runQuestionQuery={runQuestionQuery}
            setQueryBuilderMode={setQueryBuilderMode}
            readOnly={undefined}
          />
        </Modal>
      )}
    </>
  );
};
