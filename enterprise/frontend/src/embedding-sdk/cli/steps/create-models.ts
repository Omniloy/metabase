import ora from "ora";

import type { CliStepMethod } from "../types/cli";
import { createModelFromTable } from "../utils/create-model-from-table";

export const createModels: CliStepMethod = async state => {
  const { instanceUrl = "", databaseId, cookie = "", tables = [] } = state;

  if (databaseId === undefined) {
    return [{ type: "error", message: "No database selected." }, state];
  }

  const spinner = ora("Creating models…").start();

  try {
    // Create a model for each table
    await Promise.all(
      tables.map(table =>
        createModelFromTable({
          table,
          databaseId,
          cookie,
          instanceUrl,
        }),
      ),
    );

    spinner.succeed();
  } catch (error) {
    spinner.fail();

    const reason = error instanceof Error ? error.message : String(error);
    const message = `Cannot create models from selected tables. Reason: ${reason}`;

    return [{ type: "error", message }, state];
  }

  return [{ type: "done" }, state];
};
