import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const invalidReferencesValidator: Validator = {
  name: "invalidReferences",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    if (journey.transitions) {
      const transitionMap = new Map<string, Set<string>>(); // from -> to[]

      journey.transitions.forEach((trans, idx) => {
        const from = trans.fromExperienceId;
        const to = trans.toExperienceId;

        // 1. Self transition check
        if (from === to) {
          issues.push({
            type: "invalid_reference",
            severity: "critical",
            message: `Transition at index ${idx} is a self-transition (from experience "${from}" to itself).`,
          });
        }

        // Build graph map for cycle checking
        if (!transitionMap.has(from)) {
          transitionMap.set(from, new Set());
        }
        transitionMap.get(from)!.add(to);
      });

      // 2. Direct cycle check (A -> B and B -> A)
      const checkedPairs = new Set<string>();
      for (const [from, targets] of transitionMap.entries()) {
        for (const to of targets) {
          const reverseTargets = transitionMap.get(to);
          if (reverseTargets && reverseTargets.has(from) && from !== to) {
            const pairKey = [from, to].sort().join("-");
            if (!checkedPairs.has(pairKey)) {
              issues.push({
                type: "invalid_reference",
                severity: "critical",
                message: `Transition cycle detected between experience "${from}" and experience "${to}".`,
              });
              checkedPairs.add(pairKey);
            }
          }
        }
      }

    }

    return issues;
  },
};
