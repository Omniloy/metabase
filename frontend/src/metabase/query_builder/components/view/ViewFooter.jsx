/* eslint-disable react/prop-types */
import cx from "classnames";
import { t } from "ttag";

import ButtonBar from "metabase/components/ButtonBar";
import CS from "metabase/css/core/index.css";
import { EmbedMenu } from "metabase/dashboard/components/EmbedMenu";
import QueryDownloadWidget from "metabase/query_builder/components/QueryDownloadWidget";
import { ViewFooterSharingButton } from "metabase/query_builder/components/view/ViewFooterSharingButton";
import { MODAL_TYPES } from "metabase/query_builder/constants";
import { Group } from "metabase/ui";
import * as Lib from "metabase-lib";

import { ExecutionTime } from "./ExecutionTime";
import QuestionAlertWidget from "./QuestionAlertWidget";
import QuestionDisplayToggle from "./QuestionDisplayToggle";
import { QuestionLastUpdated } from "./QuestionLastUpdated/QuestionLastUpdated";
import QuestionRowCount from "./QuestionRowCount";
import QuestionTimelineWidget from "./QuestionTimelineWidget";
import ViewButton from "./ViewButton";
import { FooterButtonGroup, ViewFooterRoot } from "./ViewFooter.styled";

const ViewFooter = ({
  question,
  result,
  className,
  isShowingChartTypeSidebar,
  isShowingChartSettingsSidebar,
  isShowingRawTable,
  onOpenChartType,
  onOpenModal,
  onCloseChartType,
  onOpenChartSettings,
  onCloseChartSettings,
  setUIControls,
  isObjectDetail,
  questionAlerts,
  visualizationSettings,
  canManageSubscriptions,
  isVisualized,
  isTimeseries,
  isShowingTimelineSidebar,
  onOpenTimelines,
  onCloseTimelines,
}) => {
  if (!result) {
    return null;
  }

  const { isEditable } = Lib.queryDisplayInfo(question.query());
  const hideChartSettings =
    (result.error && !isEditable) || question.isArchived();
  const type = question.type();

  return (
    <ViewFooterRoot
      className={cx(className, CS.textMedium, CS.borderTop)}
      data-testid="view-footer"
    >
      <ButtonBar
        className={CS.flexFull}
        left={[
          !hideChartSettings && (
            <FooterButtonGroup>
              <ViewButton
                medium
                labelBreakpoint="sm"
                data-testid="viz-type-button"
                active={isShowingChartTypeSidebar}
                onClick={
                  isShowingChartTypeSidebar
                    ? () => onCloseChartType()
                    : () => onOpenChartType()
                }
              >
                {t`Visualization`}
              </ViewButton>
              <ViewButton
                active={isShowingChartSettingsSidebar}
                icon="gear"
                iconSize={16}
                medium
                onlyIcon
                labelBreakpoint="sm"
                data-testid="viz-settings-button"
                onClick={
                  isShowingChartSettingsSidebar
                    ? () => onCloseChartSettings()
                    : () => onOpenChartSettings()
                }
              />
            </FooterButtonGroup>
          ),
        ]}
        center={
          isVisualized && (
            <QuestionDisplayToggle
              key="viz-table-toggle"
              className={CS.mx1}
              question={question}
              isShowingRawTable={isShowingRawTable}
              onToggleRawTable={isShowingRawTable => {
                setUIControls({ isShowingRawTable });
              }}
            />
          )
        }
        right={[
          QuestionRowCount.shouldRender({
            result,
            isObjectDetail,
          }) && <QuestionRowCount key="row_count" />,
          ExecutionTime.shouldRender({ result }) && (
            <ExecutionTime key="execution_time" time={result.running_time} />
          ),
          <Group key="button-group" spacing="sm" noWrap>
            {QuestionLastUpdated.shouldRender({ result }) && (
              <QuestionLastUpdated
                className={cx(CS.hide, CS.smShow)}
                result={result}
              />
            )}
            {QueryDownloadWidget.shouldRender({ result }) && (
              <QueryDownloadWidget
                className={cx(CS.hide, CS.smShow)}
                question={question}
                result={result}
                visualizationSettings={visualizationSettings}
                dashcardId={question.card().dashcardId}
                dashboardId={question.card().dashboardId}
              />
            )}
            {QuestionAlertWidget.shouldRender({
              question,
              visualizationSettings,
            }) && (
              <QuestionAlertWidget
                className={cx(CS.hide, CS.smShow)}
                canManageSubscriptions={canManageSubscriptions}
                question={question}
                questionAlerts={questionAlerts}
                onCreateAlert={() =>
                  question.isSaved()
                    ? onOpenModal(MODAL_TYPES.CREATE_ALERT)
                    : onOpenModal(MODAL_TYPES.SAVE_QUESTION_BEFORE_ALERT)
                }
              />
            )}
            {type === "question" &&
              !question.isArchived() &&
              (question.isSaved() ? (
                <EmbedMenu
                  resource={question}
                  resourceType="question"
                  hasPublicLink={!!question.publicUUID()}
                  onModalOpen={() => onOpenModal(MODAL_TYPES.EMBED)}
                />
              ) : (
                <ViewFooterSharingButton
                  onClick={() =>
                    onOpenModal(MODAL_TYPES.SAVE_QUESTION_BEFORE_EMBED)
                  }
                />
              ))}
            {QuestionTimelineWidget.shouldRender({ isTimeseries }) && (
              <QuestionTimelineWidget
                className={cx(CS.hide, CS.smShow)}
                isShowingTimelineSidebar={isShowingTimelineSidebar}
                onOpenTimelines={onOpenTimelines}
                onCloseTimelines={onCloseTimelines}
              />
            )}
          </Group>,
        ]}
      />
    </ViewFooterRoot>
  );
};

export default ViewFooter;
