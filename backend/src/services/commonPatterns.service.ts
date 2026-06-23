import { groqProvider } from "../ai/groq.provider.js";
import {commonPatternsJsonSchema} from "../processors/query/commonPatterns.jsonSchema.js";
import {commonPatternSchema,type CommonPatternResponse} from "../processors/query/commonPatterns.schema.js";
import {COMMON_PATTERNS_SYSTEM_PROMPT,buildCommonPatternsPrompt} from "../prompts/commonPatterns.prompt.js";

export async function generateJourneyPatterns(
  journeyPatterns: {
    pattern: string;
    frequency: number;
  }[]
): Promise<CommonPatternResponse["patterns"]> {

  const result = await groqProvider.generateStructuredJson<unknown>({
      systemPrompt:
        COMMON_PATTERNS_SYSTEM_PROMPT,
      userPrompt:
        buildCommonPatternsPrompt(
          journeyPatterns
        ),
      jsonSchema:
        commonPatternsJsonSchema,
    });

  const validation = commonPatternSchema.safeParse(result);

  if (!validation.success) {
    throw new Error(
      `Common pattern validation failed: ${validation.error.message}`
    );
  }

  return validation.data.patterns ?? [];
}