import type { Request, Response, } from "express";
import { translateAiInsights } from "../processors/output/translateAiInsights.processor.js";
import { generateSpeech } from "../processors/output/generateSpeech.processor.js";
import { getSession, closeSession } from "../services/neo4j.service.js";

function normalizeLanguageCode(lang: string | undefined | null): string {
  if (!lang) return "en-IN";
  const normalized = lang.toLowerCase().trim();
  if (normalized === "en") return "en-IN";
  if (normalized === "hi") return "hi-IN";
  if (normalized === "te") return "te-IN";
  if (normalized === "ta") return "ta-IN";
  if (normalized === "mr") return "mr-IN";
  if (normalized === "bn") return "bn-IN";
  if (normalized === "kn") return "kn-IN";
  if (normalized === "ml") return "ml-IN";
  if (normalized === "gu") return "gu-IN";
  if (normalized === "pa") return "pa-IN";
  if (normalized === "od") return "od-IN";
  if (normalized === "ur") return "ur-IN";
  
  const validCodes = [
    'bn-IN', 'en-IN', 'gu-IN', 'hi-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'od-IN', 'pa-IN', 'ta-IN', 'te-IN',
    'as-IN', 'brx-IN', 'doi-IN', 'kok-IN', 'ks-IN', 'mai-IN', 'mni-IN', 'ne-IN', 'sa-IN', 'sat-IN', 'sd-IN', 'ur-IN'
  ];
  if (validCodes.includes(lang)) return lang;
  return "en-IN";
}

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
    const { aiInsights, language: bodyLang } = req.body;
    let language = bodyLang;
    if (!language) {
      language = await getPreferredLanguage(userId).catch(() => "en-IN");
    }
    language = normalizeLanguageCode(language);
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
    let { aiInsights, speaker, language: bodyLang } = req.body;
    let language = bodyLang;
    if (!language) {
      language = await getPreferredLanguage(userId).catch(() => "en-IN");
    }
    language = normalizeLanguageCode(language);

    const validSpeakers = [
      'anushka', 'abhilash', 'manisha', 'vidya', 'arya', 'karun', 'hitesh', 'aditya', 'ritu', 'priya',
      'neha', 'rahul', 'pooja', 'rohan', 'simran', 'kavya', 'amit', 'dev', 'ishita', 'shreya',
      'ratan', 'varun', 'manan', 'sumit', 'roopa', 'kabir', 'aayan', 'shubh', 'ashutosh', 'advait',
      'anand', 'tanya', 'tarun', 'sunny', 'mani', 'gokul', 'vijay', 'shruti', 'suhani', 'mohit',
      'kavitha', 'rehan', 'soham', 'rupali'
    ];
    if (!speaker || !validSpeakers.includes(speaker.toLowerCase().trim())) {
      speaker = "shubh";
    }

    const audioBuffer = await generateSpeech({ aiInsights, language, speaker });
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", "inline; filename=speech.wav");
    res.send(audioBuffer);

  } catch (error: unknown) {

    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}