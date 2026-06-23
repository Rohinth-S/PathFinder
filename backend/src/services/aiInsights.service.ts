import { geminiProvider } from "../ai/gemini.provider.js";
import {AI_INSIGHTS_SYSTEM_PROMPT,buildAiInsightsPrompt} from "../prompts/aiInsights.prompt.js";
import {aiInsightsGeminiSchema} from "../processors/query/aiInsights.jsonSchema.js";
import {aiInsightsSchema,type AiInsights} from "../processors/query/aiInsights.schema.js";

import type {
  QueryType,
} from "../processors/query/querySchema.js";

export interface AiInsightsInput {
  query: string;
  queryType: QueryType;
  journeyStatistics: {
    usersAnalyzed: number;
    experiencesAnalyzed: number;
  };
  commonPatterns: {
    title: string;
    description: string;
    frequency: number;
  }[];
  experiences: {
    title: string;
    context: string;
    outcome?: string | null;
    timelineSummary: string;
  }[];
}

export async function generateAiInsights(
  input: AiInsightsInput
): Promise<AiInsights> {

  const result =await geminiProvider.generateStructuredJson<unknown>({
      systemPrompt:
        AI_INSIGHTS_SYSTEM_PROMPT,
      userPrompt:
        buildAiInsightsPrompt(
          input.query,
          input.queryType,
          input.journeyStatistics,
          input.commonPatterns,
          input.experiences
        ),
      schema:
        aiInsightsGeminiSchema,
    });

  const validation = aiInsightsSchema.safeParse(result);

  if (!validation.success) {
    throw new Error(
      `AI insights validation failed: ${validation.error.message}`
    );
  }

  return validation.data;
}