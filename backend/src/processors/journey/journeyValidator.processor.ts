import { geminiProvider } from "../../ai/gemini.provider.js";
import { JOURNEY_VALIDATOR_SYSTEM_PROMPT, buildJourneyValidatorPrompt } from "../../prompts/journeyValidator.prompt.js";
import { journeyValidationSchema } from "./journeyValidator.schema.js";
import type { OnboardingMessage, JourneyValidationResult } from "./journeyValidator.schema.js";
import type { ExistingUserGraph } from "../../services/userGraphRetrieval.service.js";

/**
 * Validates the onboarding conversation history against graph schema expectations and
 * the existing user graph (if present) to find gaps, inconsistencies, and conflicts.
 *
 * @param conversation - The array of onboarding messages.
 * @param existingGraph - The user's existing graph retrieved from Neo4j (or null if new user).
 * @returns JourneyValidationResult containing completion status, findings, and follow-up questions.
 */
export async function validateJourneyConversation(
  conversation: OnboardingMessage[],
  existingGraph: ExistingUserGraph | null
): Promise<JourneyValidationResult> {
  if (!Array.isArray(conversation) || conversation.length === 0) {
    throw new Error("Conversation must be a non-empty array of OnboardingMessage objects.");
  }

  const userPrompt = buildJourneyValidatorPrompt(conversation, existingGraph);

  const result = await geminiProvider.generateStructuredJson<JourneyValidationResult>({
    systemPrompt: JOURNEY_VALIDATOR_SYSTEM_PROMPT,
    userPrompt,
    schema: journeyValidationSchema,
  });

  // Force questions to be empty if the conversation is complete
  if (result.conversationComplete) {
    result.questions = [];
  }

  return result;
}
