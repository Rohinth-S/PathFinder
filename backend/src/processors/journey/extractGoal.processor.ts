import { geminiProvider } from "../../ai/gemini.provider.js";
import {GOAL_EXTRACTOR_SYSTEM_PROMPT,buildGoalExtractorPrompt,} from "../../prompts/onboarding/goalExtractor.prompt.js";
import { goalExtractorSchema } from "./goalExtractor.schema.js";
import type { GoalExtraction } from "../../types/journey/GoalExtraction.types.js";

export async function extractGoal(
  narrative: string
): Promise<GoalExtraction> {
  return geminiProvider.generateStructuredJson<GoalExtraction>({
    systemPrompt: GOAL_EXTRACTOR_SYSTEM_PROMPT,
    userPrompt: buildGoalExtractorPrompt(
      narrative
    ),
    schema: goalExtractorSchema,
  });

}