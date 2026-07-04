import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateFormat(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const time = Date.parse(dateStr);
  return !isNaN(time);
}

export const missingDurationsValidator: Validator = {
  name: "missingDurations",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    // Validate Goal dates
    if (journey.goals) {
      journey.goals.forEach((goal) => {
        // Check startDate format
        if (goal.startDate) {
          if (!isValidDateFormat(goal.startDate)) {
            issues.push({
              type: "missing_duration",
              severity: "critical",
              nodeId: goal.id,
              field: "startDate",
              message: `Goal "${goal.title}" has an invalid startDate format (expected YYYY-MM-DD).`,
            });
          }
        }

        // Check completion and endDate
        if (goal.status === "achieved" || goal.status === "abandoned") {
          if (!goal.endDate) {
            issues.push({
              type: "missing_duration",
              severity: "warning",
              nodeId: goal.id,
              field: "endDate",
              message: `Completed goal "${goal.title}" (status: "${goal.status}") is missing an endDate.`,
            });
          }
        }

        if (goal.endDate) {
          if (!isValidDateFormat(goal.endDate)) {
            issues.push({
              type: "missing_duration",
              severity: "critical",
              nodeId: goal.id,
              field: "endDate",
              message: `Goal "${goal.title}" has an invalid endDate format (expected YYYY-MM-DD).`,
            });
          } else if (goal.startDate && isValidDateFormat(goal.startDate)) {
            const start = new Date(goal.startDate);
            const end = new Date(goal.endDate);
            if (start > end) {
              issues.push({
                type: "missing_duration",
                severity: "critical",
                nodeId: goal.id,
                message: `Goal "${goal.title}" has a startDate ("${goal.startDate}") that is after its endDate ("${goal.endDate}").`,
              });
            }
          }
        }
      });
    }

    // Validate Experience dates
    if (journey.experiences) {
      journey.experiences.forEach((exp) => {
        if (exp.startDate) {
          if (!isValidDateFormat(exp.startDate)) {
            issues.push({
              type: "missing_duration",
              severity: "critical",
              nodeId: exp.id,
              field: "startDate",
              message: `Experience "${exp.title}" has an invalid startDate format (expected YYYY-MM-DD).`,
            });
          }
        }

        if (exp.endDate) {
          if (!isValidDateFormat(exp.endDate)) {
            issues.push({
              type: "missing_duration",
              severity: "critical",
              nodeId: exp.id,
              field: "endDate",
              message: `Experience "${exp.title}" has an invalid endDate format (expected YYYY-MM-DD).`,
            });
          } else if (exp.startDate && isValidDateFormat(exp.startDate)) {
            const start = new Date(exp.startDate);
            const end = new Date(exp.endDate);
            if (start > end) {
              issues.push({
                type: "missing_duration",
                severity: "critical",
                nodeId: exp.id,
                message: `Experience "${exp.title}" has a startDate ("${exp.startDate}") that is after its endDate ("${exp.endDate}").`,
              });
            }
          }
        }
      });
    }


    return issues;
  },
};
