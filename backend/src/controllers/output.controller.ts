import type {Request,Response,} from "express";
import { translateAiInsights } from "../processors/output/translateAiInsights.processor.js";
import { generateSpeech } from "../processors/output/generateSpeech.processor.js";

export async function translateController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const {aiInsights,language} = req.body;
    const translatedAiInsights = await translateAiInsights(aiInsights,language);

    res.json({translatedAiInsights});

  } catch (error: unknown) {

    const message = error instanceof Error ? error.message : String(error);

    res.status(500).json({error: message});
  }
}

export async function speechController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { aiInsights, language, speaker} = req.body;
    const audioBuffer = await generateSpeech({aiInsights, language, speaker});
    res.setHeader("Content-Type","audio/wav");
    res.setHeader("Content-Disposition","inline; filename=speech.wav");
    res.send(audioBuffer);

  } catch (error: unknown) {

    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({error: message});
  }
}