import type { JourneyProof } from "./Journey.types.js";
import type { JourneyGoal } from "../../types/journey/Journey.types.js";
import type {GeminiExperience} from "./GeminiJourneyDraft.types.js";

export interface PartialJourneyDraft {
  goals: Pick<JourneyGoal, "id" | "title">[];
  experiences: (GeminiExperience & {
    id: string;
    goalIds: string[];
    proofs: JourneyProof[];
    isVerified: boolean;
  })[];
}