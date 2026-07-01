import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const missingRelationshipsValidator: Validator = {
  name: "missingRelationships",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    if (journey.experiences) {
      journey.experiences.forEach((exp) => {
        if (!exp.goalIds || exp.goalIds.length === 0) {
          issues.push({
            type: "missing_relationship",
            severity: "critical",
            nodeId: exp.id,
            field: "goalIds",
            message: `Experience "${exp.title}" is not linked to any goal.`,
          });
        }

      });
    }

    return issues;
  },
};
