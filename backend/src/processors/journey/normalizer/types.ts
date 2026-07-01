import type { JourneyJson } from "../types.js";

export interface NormalizationResult {
  journey: JourneyJson;
  appliedFixes: number;
}

export interface NormalizerRule {
  name: string;
  normalize(journey: JourneyJson): NormalizationResult;
}

export interface NormalizerEngineResult {
  journey: JourneyJson;
  totalFixes: number;
  ruleFixes: Record<string, number>;
}
