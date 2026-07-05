import { getJourneySession, updateJourneySession } from "../../services/journeySession.service.js";
import { extractJourneyDraft } from "./extractJourneyDraft.processor.js";
import { finalizeJourneyDraft } from "./finalizeJourneyDraft.processor.js";
import type { JourneyMessage } from "../../types/journey/JourneySession.types.js";

export async function continueJourney(
  conversationId: string,
  message: string
) {
  const session = await getJourneySession(conversationId);
  if (!session) {
    throw new Error("Journey session not found");
  }

  const userMessage: JourneyMessage = {
    role: "user",
    content: message,
    timestamp: Date.now(),
  };
  session.conversationHistory.push(userMessage);
  const geminiDraft = await extractJourneyDraft(message);
  const journeyDraft = await finalizeJourneyDraft(geminiDraft,session.userId);

  session.journeyDraft = journeyDraft;
  session.updatedAt = Date.now();
  await updateJourneySession(conversationId, session);
  return { conversationId, journeyDraft };
}