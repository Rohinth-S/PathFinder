import type { Request, Response } from "express";
import { understandQuery } from "../processors/query/understandQuery.processor.js";
import { retrieveContext } from "../processors/query/retrieveContext.processor.js";
import { aggregateContext } from "../processors/query/aggregateContext.processor.js";
import { sarvamProvider } from "../ai/sarvam.provider.js";

export async function queryController(req: Request, res: Response): Promise<void> {
  try {
    const { query, audio, translateTo, tts, speaker } = req.body;
    let resolvedQuery = "";
    let isTranscribed = false;

    if (audio) {
      if (typeof audio !== "string") {
        res.status(400).json({ error: "Audio must be a base64 encoded string" });
        return;
      }
      const audioBuffer = Buffer.from(audio, "base64");
      resolvedQuery = await sarvamProvider.speechToText(audioBuffer, "translate");
      isTranscribed = true;

      if (!resolvedQuery || !resolvedQuery.trim()) {
        res.status(400).json({ error: "Failed to transcribe audio or audio is silent" });
        return;
      }
    } else if (query) {
      if (typeof query !== "string" || !query.trim()) {
        res.status(400).json({ error: "Query must be a non-empty string" });
        return;
      }
      resolvedQuery = query;
    } else {
      res.status(400).json({ error: "Either query or audio is required" });
      return;
    }

    const structuredQuery = await understandQuery(resolvedQuery);
    const context = await retrieveContext(structuredQuery);
    const aggregatedContext = await aggregateContext(resolvedQuery, structuredQuery, context);

    let translatedAiInsights = null;
    if (translateTo && typeof translateTo === "string") {
      const insights = aggregatedContext.aiInsights;
      const [translatedDirect, translatedTakeaway, translatedKeys] = await Promise.all([
        sarvamProvider.translate(insights.directAnswer, translateTo, "en-IN"),
        sarvamProvider.translate(insights.actionableTakeaway, translateTo, "en-IN"),
        Promise.all(insights.keyPoints.map(point => sarvamProvider.translate(point, translateTo, "en-IN")))
      ]);

      translatedAiInsights = {
        directAnswer: translatedDirect,
        actionableTakeaway: translatedTakeaway,
        keyPoints: translatedKeys
      };
    }

    let audioResponse: string | null = null;
    if (tts) {
      const targetInsights = translatedAiInsights || aggregatedContext.aiInsights;
      const ttsText = [
        `Direct Answer: ${targetInsights.directAnswer}`,
        `Key Points: ${targetInsights.keyPoints.join(". ")}`,
        `Actionable Takeaway: ${targetInsights.actionableTakeaway}`
      ].join("\n\n");

      const ttsLang = translateTo && typeof translateTo === "string" ? translateTo : "en-IN";
      const ttsSpeaker = typeof speaker === "string" ? speaker : "shubh";
      audioResponse = await sarvamProvider.textToSpeech(ttsText, ttsLang, ttsSpeaker);
    }

    res.json({
      query: resolvedQuery,
      transcribed: isTranscribed,
      structuredQuery,
      context,
      aggregatedContext,
      translatedAiInsights,
      audioResponse,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Failed to process query: ${message}` });
  }
}