import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const missingFieldsValidator: Validator = {
  name: "missingFields",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    if (journey.goals) {
      journey.goals.forEach((goal) => {
        if (!goal.title || goal.title.trim() === "") {
          issues.push({
            type: "missing_field",
            severity: "critical",
            nodeId: goal.id,
            field: "title",
            message: "Goal is missing a title.",
          });
        }
        if (!goal.description || goal.description.trim() === "") {
          issues.push({
            type: "missing_field",
            severity: "critical",
            nodeId: goal.id,
            field: "description",
            message: `Goal "${goal.title || goal.id}" is missing a description.`,
          });
        }
      });
    }

    if (journey.experiences) {
      journey.experiences.forEach((exp) => {
        if (!exp.title || exp.title.trim() === "") {
          issues.push({
            type: "missing_field",
            severity: "critical",
            nodeId: exp.id,
            field: "title",
            message: "Experience is missing a title.",
          });
        }
        if (!exp.context || exp.context.trim() === "") {
          issues.push({
            type: "missing_field",
            severity: "critical",
            nodeId: exp.id,
            field: "context",
            message: `Experience "${exp.title || exp.id}" is missing context details.`,
          });
        }
        if (!exp.timelineSummary || exp.timelineSummary.trim() === "") {
          issues.push({
            type: "missing_field",
            severity: "critical",
            nodeId: exp.id,
            field: "timelineSummary",
            message: `Experience "${exp.title || exp.id}" is missing a timeline summary.`,
          });
        }

        if (exp.proofs) {
          exp.proofs.forEach((proof) => {
            if (!proof.url || proof.url.trim() === "") {
              issues.push({
                type: "missing_field",
                severity: "critical",
                nodeId: proof.id,
                field: "url",
                message: `Proof in experience "${exp.title || exp.id}" is missing a URL.`,
              });
            }
          });
        }
      });
    }


    return issues;
  },
};
