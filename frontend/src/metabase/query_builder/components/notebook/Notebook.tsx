import { t } from "ttag";
import { useState } from "react";
import { useDispatch } from "metabase/lib/redux";
import { setUIControls } from "metabase/query_builder/actions";
import { Box, Button } from "metabase/ui";
import * as Lib from "metabase-lib";
import type Question from "metabase-lib/v1/Question";
import { NotebookSteps } from "./NotebookSteps";
import WebSocketHandler from "./WebSocketHandler"; // Import the new component

export type NotebookProps = {
  question: Question;
  isDirty: boolean;
  isRunnable: boolean;
  isResultDirty: boolean;
  reportTimezone: string;
  hasVisualizeButton?: boolean;
  updateQuestion: (question: Question) => Promise<void>;
  runQuestionQuery: () => void;
  setQueryBuilderMode: (mode: string) => void;
  readOnly?: boolean;
};

const Notebook = ({
  updateQuestion,
  reportTimezone,
  readOnly,
  question,
  isDirty,
  isRunnable,
  isResultDirty,
  hasVisualizeButton = true,
  runQuestionQuery,
  setQueryBuilderMode,
}: NotebookProps) => {
  const dispatch = useDispatch();

  async function cleanupQuestion() {
    let cleanQuestion = question.setQuery(
      Lib.dropEmptyStages(question.query()),
    );
    if (cleanQuestion.display() === "table") {
      cleanQuestion = cleanQuestion.setDefaultDisplay();
    }
    console.log("CleanUp Question");
    console.log({ cleanQuestion });
    await updateQuestion(cleanQuestion);
  }

  async function visualize() {
    if (isDirty) {
      cleanupQuestion();
    }
    await setQueryBuilderMode("view");
    if (isResultDirty) {
      await runQuestionQuery();
    }
  }

  const handleUpdateQuestion = (question: Question): Promise<void> => {
    dispatch(setUIControls({ isModifiedFromNotebook: true }));
    console.log("Question");
    console.log({ question });
    return updateQuestion(question);
  };

  return (
    <Box pos="relative" p={{ base: "1rem", sm: "2rem" }}>
      <NotebookSteps
        updateQuestion={handleUpdateQuestion}
        question={question}
        reportTimezone={reportTimezone}
        readOnly={readOnly}
      />
      {hasVisualizeButton && isRunnable && (
        <Button
          variant="filled"
          style={{ minWidth: 220, marginRight: "1rem" }}
          onClick={visualize}
        >
          {t`Visualize`}
        </Button>
      )}

      {/* Include the WebSocketHandler component */}
      <WebSocketHandler
        question={question}
        isDirty={isDirty}
        isRunnable={isRunnable}
        isResultDirty={isResultDirty}
        updateQuestion={updateQuestion}
        runQuestionQuery={runQuestionQuery}
        setQueryBuilderMode={setQueryBuilderMode}
      />
    </Box>
  );
};

export default Notebook;
