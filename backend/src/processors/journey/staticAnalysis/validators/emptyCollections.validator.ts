import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const emptyCollectionsValidator: Validator = {
  name: "emptyCollections",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    if (!journey.goals || journey.goals.length === 0) {
      issues.push({
        type: "empty_collection",
        severity: "critical",
        message: "The journey does not contain any goals.",
      });
    }

    if (!journey.experiences || journey.experiences.length === 0) {
      issues.push({
        type: "empty_collection",
        severity: "critical",
        message: "The journey does not contain any experiences.",
      });
    }

    if (journey.experiences) {
      journey.experiences.forEach((exp) => {
        if (!exp.skills || exp.skills.length === 0) {
          issues.push({
            type: "empty_collection",
            severity: "info",
            nodeId: exp.id,
            field: "skills",
            message: `Experience "${exp.title}" contains no associated skills.`,
          });
        }
        if (!exp.proofs || exp.proofs.length === 0) {
          issues.push({
            type: "empty_collection",
            severity: "info",
            nodeId: exp.id,
            field: "proofs",
            message: `Experience "${exp.title}" contains no associated proofs/evidence.`,
          });
        }
      });
    }


    return issues;
  },
};
