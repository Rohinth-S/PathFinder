import type { JourneyJson } from "../types.js";
import type { NormalizerEngineResult, NormalizerRule } from "./types.js";
import { defaultRules } from "./rules/rulesRegistry.js";

/**
 * Executes a pipeline of deterministic, lossless transformations (rules) 
 * on a schema-valid Journey graph to normalize formatting and fix redundant data.
 *
 * @param journey The schema-valid JourneyJson graph to normalize.
 * @param rules Optional list of custom rules to run instead of the default ones.
 * @returns NormalizerEngineResult containing the normalized journey, total count of fixes, and a rule-by-rule breakdown.
 */
export function normalizeJourney(
  journey: JourneyJson,
  rules: NormalizerRule[] = defaultRules
): NormalizerEngineResult {
  // Deep clone to ensure we do not mutate original references
  let currentJourney = JSON.parse(JSON.stringify(journey)) as JourneyJson;
  let totalFixes = 0;
  const ruleFixes: Record<string, number> = {};

  for (const rule of rules) {
    try {
      const result = rule.normalize(currentJourney);
      currentJourney = result.journey;
      totalFixes += result.appliedFixes;
      ruleFixes[rule.name] = result.appliedFixes;
    } catch (err) {
      console.error(`Journey Normalizer: Rule "${rule.name}" threw an error:`, err);
      // We do not let a single rule crash the entire normalization pipeline
      ruleFixes[rule.name] = 0;
    }
  }

  return {
    journey: currentJourney,
    totalFixes,
    ruleFixes,
  };
}
