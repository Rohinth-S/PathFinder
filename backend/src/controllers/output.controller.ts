import type { Request, Response, } from "express";
import { translateAiInsights } from "../processors/output/translateAiInsights.processor.js";
import { generateSpeech } from "../processors/output/generateSpeech.processor.js";
import { getSession, closeSession } from "../services/neo4j.service.js";

async function getPreferredLanguage(
  clerkId: string
): Promise<string> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})
      RETURN u.preferredLanguage AS preferredLanguage
      `,
      { clerkId }
    );

    if (result.records.length === 0) {
      throw new Error("User not found.");
    }

    const preferredLanguage = result.records[0]?.get(
      "preferredLanguage"
    ) as string | null;

    if (!preferredLanguage) {
      throw new Error("Preferred language not set.");
    }

    return preferredLanguage;
  } finally {
    await closeSession(session);
  }
}

export async function translateController(
  req: Request,
  res: Response
): Promise<void> {

  try {
    const userId = req.userId;
    const language = await getPreferredLanguage(userId);
    const { aiInsights } = req.body;
    const translatedAiInsights = await translateAiInsights(aiInsights, language);

    res.json({ translatedAiInsights });

  } catch (error: unknown) {

    const message = error instanceof Error ? error.message : String(error);

    res.status(500).json({ error: message });
  }
}

export async function speechController(
  req: Request,
  res: Response
): Promise<void> {

  try {
    const userId = req.userId;
    const language = await getPreferredLanguage(userId);
    const { aiInsights, speaker } = req.body;
    const audioBuffer = await generateSpeech({ aiInsights, language, speaker });
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", "inline; filename=speech.wav");
    res.send(audioBuffer);

  } catch (error: unknown) {

    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}