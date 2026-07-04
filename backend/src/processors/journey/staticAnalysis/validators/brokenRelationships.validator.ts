import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const brokenRelationshipsValidator: Validator = {
  name: "brokenRelationships",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    const goalsWithExperiences = new Set<string>();

    if (journey.experiences) {
      journey.experiences.forEach((exp) => {
        if (exp.goalIds) {
          exp.goalIds.forEach((gid) => goalsWithExperiences.add(gid));
        }
      });
    }

    if (journey.goals) {
      journey.goals.forEach((goal) => {
        if (!goalsWithExperiences.has(goal.id)) {
          issues.push({
            type: "broken_relationship",
            severity: "warning",
            nodeId: goal.id,
            message: `Goal "${goal.title}" is not referenced by any experience in the journey.`,
          });
        }

      });
    }

    return issues;
  },
};
