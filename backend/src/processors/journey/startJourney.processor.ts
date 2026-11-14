import { getShareJourneyPrompt } from "../../prompts/onboarding/shareJourney.prompt.js";
import { createJourneySession } from "../../services/journeySession.service.js";

export async function startJourney(
  userId: string
) {
  const conversationId =
    await createJourneySession(userId);

  return {
    conversationId,
    message: getShareJourneyPrompt(),
  };
}