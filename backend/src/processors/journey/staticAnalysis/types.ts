import type {
  JourneyJson,
  JourneyGoal,
  JourneyExperience,
  JourneyTransition,
  JourneySkill,
  JourneyProof,
} from "../types.js";

export type {
  JourneyJson,
  JourneyGoal,
  JourneyExperience,
  JourneyTransition,
  JourneySkill,
  JourneyProof,
};


export type IssueSeverity = "info" | "warning" | "critical";

export type IssueType =
  | "missing_field"
  | "missing_relationship"
  | "missing_transition"
  | "missing_outcome"
  | "missing_organization"
  | "missing_duration"
  | "duplicate_experience"
  | "invalid_reference"
  | "broken_relationship"
  | "orphan_node"
  | "empty_collection";


export interface StaticAnalysisIssue {
  type: IssueType;
  severity: IssueSeverity;
  nodeId?: string;
  field?: string;
  message: string;
}

export interface StaticAnalysisReport {
  success: boolean;
  issues: StaticAnalysisIssue[];
}

export interface Validator {
  name: string;
  validate(journey: JourneyJson): StaticAnalysisIssue[];
}
