import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const missingOutcomesValidator: Validator = {
  name: "missingOutcomes",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (journey.experiences) {
      journey.experiences.forEach((exp) => {
        let isCompleted = false;

        if (exp.endDate) {
          try {
            const end = new Date(exp.endDate);
            if (!isNaN(end.getTime())) {
              end.setHours(0, 0, 0, 0);
              if (end <= now) {
                isCompleted = true;
              }
            }
          } catch {
            // date parsing failed, handled in missingDurations
          }
        }

        if (exp.applicationStatus === "accepted" || exp.applicationStatus === "rejected") {
          isCompleted = true;
        }

        if (isCompleted && (!exp.outcome || exp.outcome.trim() === "")) {
          issues.push({
            type: "missing_outcome",
            severity: "info",
            nodeId: exp.id,
            field: "outcome",
            message: `Completed experience "${exp.title}" is missing an outcome/result.`,
          });
        }

      });
    }

    return issues;
  },
};
