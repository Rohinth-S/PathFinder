import { randomUUID } from "crypto";
import { createGoal } from "../../services/goal.service.js";
import { extractGoal } from "./extractGoal.processor.js";
import {submitGoalSchema,journeyGoalSchema} from "./journeySchema.js";
import type { JourneyGoal, SubmitGoal } from "../../types/journey/Journey.types.js";
import { validateGoalDuplicate } from "./staticAnalysis/goalDuplicate.validator.js";
import { addGoalReputation } from "../../services/reputation.service.js";

export async function submitGoal(
  userId: string,
  input: SubmitGoal
) {
    const validation = submitGoalSchema.safeParse(input);
    if (!validation.success) {
    throw new Error(
      `Invalid goal: ${validation.error.message}`
    );
  }
  const validGoal = validation.data;
  const extractedGoal = await extractGoal(validGoal.narrative);
  const tempgoal = {
  id: randomUUID(),
  title: extractedGoal.title,
  description: extractedGoal.description,
  topics: validGoal.topics,
  subtopics: validGoal.subtopics,
  status: validGoal.status,
  startDate: validGoal.startDate,
  ...(validGoal.endDate !== undefined && {
    endDate: validGoal.endDate,
  })
};
const goalValidation =journeyGoalSchema.safeParse(tempgoal);
if (!goalValidation.success) {
  throw new Error(
    `Invalid generated goal: ${goalValidation.error.message}`
  );
}
const parsedGoal = goalValidation.data;
const goal: JourneyGoal = {
  id: parsedGoal.id,
  title: parsedGoal.title,
  description: parsedGoal.description,
  status: parsedGoal.status,
  topics: parsedGoal.topics,
  subtopics: parsedGoal.subtopics,
  startDate: parsedGoal.startDate,
  ...(parsedGoal.endDate !== undefined && {
    endDate: parsedGoal.endDate,
  }),
};
const isDuplicate = await validateGoalDuplicate(
  userId,
  goal.title,
  goal.description
);
if (isDuplicate) {
  throw new Error("A similar goal already exists.");
}
  await createGoal(userId, goal);
  await addGoalReputation(userId, 1);
  return {
    id: goal.id,
    title: goal.title,
  };
}