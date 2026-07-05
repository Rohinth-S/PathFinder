import { geminiProvider } from "../../ai/gemini.provider.js";
import { JOURNEY_DRAFT_SYSTEM_PROMPT, buildJourneyDraftPrompt, } from "../../prompts/onboarding/journeyDraft.prompt.js";
import type { GeminiJourneyDraft } from "../../types/journey/GeminiJourneyDraft.types.js";
import { partialJourneyDraftSchema } from "./partialJourneyDraft.schema.js";

export async function extractJourneyDraft(
  narrative: string
): Promise<GeminiJourneyDraft> {

  return geminiProvider.generateStructuredJson<GeminiJourneyDraft>({
    systemPrompt: JOURNEY_DRAFT_SYSTEM_PROMPT,
    userPrompt: buildJourneyDraftPrompt(narrative),
    schema: partialJourneyDraftSchema,
  });

}