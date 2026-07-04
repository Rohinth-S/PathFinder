import { trimStringsRule } from "./trimStrings.rule.js";
import { deduplicateSkillsRule } from "./deduplicateSkills.rule.js";
import { deduplicateProofsRule } from "./deduplicateProofs.rule.js";
import { deduplicateRelationshipsRule } from "./deduplicateRelationships.rule.js";
import { sortExperiencesRule } from "./sortExperiences.rule.js";
import type { NormalizerRule } from "../types.js";

export {
  trimStringsRule,
  deduplicateSkillsRule,
  deduplicateProofsRule,
  deduplicateRelationshipsRule,
  sortExperiencesRule,
};

export const defaultRules: NormalizerRule[] = [
  trimStringsRule,
  deduplicateSkillsRule,
  deduplicateProofsRule,
  deduplicateRelationshipsRule,
  sortExperiencesRule,
];
