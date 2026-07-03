import type { JourneyJson } from "../types.js";
import type { StaticAnalysisReport, Validator } from "./types.js";
import { defaultValidators } from "./validators/registry.js";

/**
 * Runs deterministic rule-based analysis checks on a schema-valid Journey graph.
 *
 * @param journey The validated JourneyJson graph structure.
 * @param validators Optional list of custom validators to run instead of the default ones.
 * @returns StaticAnalysisReport containing success flag and the list of detected issues.
 */
export function analyzeStaticRules(
  journey: JourneyJson,
  validators: Validator[] = defaultValidators
): StaticAnalysisReport {
  const issues = [];

  for (const validator of validators) {
    try {
      const validatorIssues = validator.validate(journey);
      issues.push(...validatorIssues);
    } catch (err) {
      console.error(`Static Analysis: Validator "${validator.name}" threw an error:`, err);
      // We do not let a single validator crash the entire analysis report
    }
  }

  return {
    success: true,
    issues,
  };
}
