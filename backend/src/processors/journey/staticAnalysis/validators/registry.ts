import { emptyCollectionsValidator } from "./emptyCollections.validator.js";
import { missingFieldsValidator } from "./missingFields.validator.js";
import { missingRelationshipsValidator } from "./missingRelationships.validator.js";
import { missingTransitionsValidator } from "./missingTransitions.validator.js";
import { missingOutcomesValidator } from "./missingOutcomes.validator.js";
import { missingOrganizationsValidator } from "./missingOrganizations.validator.js";
import { missingDurationsValidator } from "./missingDurations.validator.js";
import { duplicateExperiencesValidator } from "./duplicateExperiences.validator.js";
import { invalidReferencesValidator } from "./invalidReferences.validator.js";
import { brokenRelationshipsValidator } from "./brokenRelationships.validator.js";
import { orphanNodesValidator } from "./orphanNodes.validator.js";
import type { Validator } from "../types.js";

export {
  emptyCollectionsValidator,
  missingFieldsValidator,
  missingRelationshipsValidator,
  missingTransitionsValidator,
  missingOutcomesValidator,
  missingOrganizationsValidator,
  missingDurationsValidator,
  duplicateExperiencesValidator,
  invalidReferencesValidator,
  brokenRelationshipsValidator,
  orphanNodesValidator,
};

export const defaultValidators: Validator[] = [
  emptyCollectionsValidator,
  missingFieldsValidator,
  missingRelationshipsValidator,
  missingTransitionsValidator,
  missingOutcomesValidator,
  missingOrganizationsValidator,
  missingDurationsValidator,
  duplicateExperiencesValidator,
  invalidReferencesValidator,
  brokenRelationshipsValidator,
  orphanNodesValidator,
];

