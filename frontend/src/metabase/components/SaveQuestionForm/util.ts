import { match, P } from "ts-pattern";
import { t } from "ttag";

import {
  canonicalCollectionId,
  getInstanceAnalyticsCustomCollection,
  isInstanceAnalyticsCollection,
} from "metabase/collections/utils";
import type Question from "metabase-lib/v1/Question";
import type { CardType, Collection } from "metabase-types/api";

import type { FormValues } from "./types";

const updateQuestion = async (
  originalQuestion: Question,
  newQuestion: Question,
  onSave: (question: Question) => Promise<void>,
) => {
  const collectionId = canonicalCollectionId(originalQuestion.collectionId());
  const displayName = originalQuestion.displayName();
  const description = originalQuestion.description();
  const isExample = originalQuestion.isExample();
  const updatedQuestion = newQuestion
    .setDisplayName(displayName)
    .setDescription(description)
    .setCollectionId(collectionId)
    .setIsExample(isExample);

  await onSave(updatedQuestion.setId(originalQuestion.id()));
};

export const createQuestion = async (
  details: FormValues,
  question: Question,
  onCreate: (question: Question) => Promise<void>,
) => {
  if (details.saveType !== "create") {
    return;
  }

  const collectionId = canonicalCollectionId(details.collection_id);
  const displayName = details.name.trim();
  const description = details.description ? details.description.trim() : null;
  const isExample = details.isExample;
  const newQuestion = question
    .setDisplayName(displayName)
    .setDescription(description)
    .setCollectionId(collectionId)
    .setIsExample(isExample);
  await onCreate(newQuestion);
};

export async function submitQuestion(
  originalQuestion: Question | null,
  details: FormValues,
  question: Question,
  onSave: (question: Question) => Promise<void>,
  onCreate: (question: Question) => Promise<void>,
) {
  if (details.saveType === "overwrite" && originalQuestion) {
    await updateQuestion(originalQuestion, question, onSave);
  } else {
    await createQuestion(details, question, onCreate);
  }
}

export const getInitialValues = (
  collections: Collection[],
  originalQuestion: Question | null,
  question: Question,
  initialCollectionId: FormValues["collection_id"],
): FormValues => {
  const isReadonly = originalQuestion != null && !originalQuestion.canWrite();

  // we can't use null because that can be ID of the root collection
  const instanceAnalyticsCollectionId =
    collections?.find(isInstanceAnalyticsCollection)?.id ?? "not found";
  const isInInstanceAnalyticsQuestion =
    originalQuestion?.collectionId() === instanceAnalyticsCollectionId;

  if (collections && isInInstanceAnalyticsQuestion) {
    const customCollection = getInstanceAnalyticsCustomCollection(collections);
    if (customCollection) {
      initialCollectionId = customCollection.id;
    }
  }

  const getOriginalNameModification = (originalQuestion: Question | null) =>
    originalQuestion
      ? t`${originalQuestion.displayName()} - Modified`
      : undefined;

  return {
    name:
      // Saved question
      getOriginalNameModification(originalQuestion) ||
      // Ad-hoc query
      question.generateQueryDescription() ||
      "",
    description:
      originalQuestion?.description() || question.description() || "",
    collection_id:
      question.collectionId() === undefined ||
      isReadonly ||
      isInInstanceAnalyticsQuestion
        ? initialCollectionId
        : question.collectionId(),
    saveType:
      originalQuestion &&
      originalQuestion.type() === "question" &&
      originalQuestion.canWrite()
        ? "overwrite"
        : "create",
    isExample: 
      question.isExample()
  };
};

export const getTitle = (
  cardType: CardType,
  showSaveType: boolean = false,
  multiStep: boolean = false,
): string => {
  const stepType = multiStep ? "multiStep" : "singleStep";

  return match<[CardType, typeof stepType, boolean]>([
    cardType,
    stepType,
    showSaveType,
  ])
    .returnType<string>()
    .with(["question", "singleStep", true], () => t`Save question`)
    .with(["question", "singleStep", false], () => t`Save new question`)
    .with(["question", "multiStep", P._], () => t`First, save your question`)
    .with(["model", "singleStep", P._], () => t`Save model`)
    .with(["model", "multiStep", P._], () => t`First, save your model`)
    .with(["metric", "singleStep", P._], () => t`Save metric`)
    .with(["metric", "multiStep", P._], () => t`First, save your metric`)
    .exhaustive();
};

export const getPlaceholder = (cardType: CardType): string =>
  match<CardType, string>(cardType)
    .with("question", () => t`What is the name of your question?`)
    .with("model", () => t`What is the name of your model?`)
    .with("metric", () => t`What is the name of your metric?`)
    .exhaustive();
