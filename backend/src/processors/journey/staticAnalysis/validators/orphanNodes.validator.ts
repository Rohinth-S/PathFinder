import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const orphanNodesValidator: Validator = {
  name: "orphanNodes",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    const experiencesCount = journey.experiences ? journey.experiences.length : 0;

    // Only run if there are multiple experiences
    if (experiencesCount > 1 && journey.experiences) {
      const activeFromIds = new Set<string>();
      const activeToIds = new Set<string>();

      if (journey.transitions) {
        journey.transitions.forEach((trans) => {
          activeFromIds.add(trans.fromExperienceId);
          activeToIds.add(trans.toExperienceId);
        });
      }

      journey.experiences.forEach((exp) => {
        const hasIncoming = activeToIds.has(exp.id);
        const hasOutgoing = activeFromIds.has(exp.id);

        if (!hasIncoming && !hasOutgoing) {
          issues.push({
            type: "orphan_node",
            severity: "warning",
            nodeId: exp.id,
            message: `Experience "${exp.title}" is an orphan node with no incoming or outgoing transitions.`,
          });
        }

      });
    }

    return issues;
  },
};
