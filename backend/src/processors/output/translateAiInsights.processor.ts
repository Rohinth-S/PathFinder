import { sarvamProvider } from "../../ai/sarvam.provider.js";
import type { AiInsights } from "../query/aiInsights.schema.js";

export interface TranslatedAiInsights {
  directAnswer: string;
  keyPoints: string[];
  actionableTakeaway: string;
}
export async function translateAiInsights(
  aiInsights: AiInsights,
  targetLanguage: string
): Promise<TranslatedAiInsights> {

  const [directAnswer, actionableTakeaway,keyPoints] = await Promise.all([
    sarvamProvider.translate(aiInsights.directAnswer,targetLanguage,"en-IN"),
    sarvamProvider.translate(aiInsights.actionableTakeaway,targetLanguage,"en-IN"),

    Promise.all(aiInsights.keyPoints.map((point) =>
          sarvamProvider.translate( point,targetLanguage,"en-IN"))),
  ]);

  return {
    directAnswer,
    keyPoints,
    actionableTakeaway,
  };
}