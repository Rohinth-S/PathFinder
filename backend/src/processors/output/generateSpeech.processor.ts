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

  const speechText = [
    content.directAnswer,
    ...content.keyPoints,
    content.actionableTakeaway,
  ].join("\n\n");

  return sarvamProvider.textToSpeech(
    speechText,
    language,
    speaker
  );
}