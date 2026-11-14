import type { AiInsights } from "../query/aiInsights.schema.js";
import {translateAiInsights} from "./translateAiInsights.processor.js";
import type {TranslatedAiInsights} from "./translateAiInsights.processor.js";
import { sarvamProvider } from "../../ai/sarvam.provider.js";

export interface GenerateSpeechInput {
  aiInsights: AiInsights;
  language?: string;
  speaker?: string;
}

export async function generateSpeech(
  input: GenerateSpeechInput
): Promise<Buffer> {

  const {aiInsights,language = "en-IN",speaker = "shubh"} = input;

  let content: AiInsights | TranslatedAiInsights = aiInsights;

  if (language !== "en-IN") {
    content = await translateAiInsights(aiInsights, language);
  }

  const speechParts = [
    content.directAnswer,
    ...(Array.isArray(content.keyPoints) ? content.keyPoints : []),
    content.actionableTakeaway,
  ].filter(Boolean);

  const speechText = speechParts.join("\n\n").slice(0, 2400);

  return sarvamProvider.textToSpeech(
    speechText,
    language,
    speaker
  );
}