import type { JourneyJson } from "../../types.js";
import type { NormalizerRule, NormalizationResult } from "../types.js";

export const deduplicateProofsRule: NormalizerRule = {
  name: "deduplicateProofs",
  normalize(journey: JourneyJson): NormalizationResult {
    let appliedFixes = 0;

    if (!journey.experiences) {
      return { journey, appliedFixes: 0 };
    }

    const updatedExperiences = journey.experiences.map((exp) => {
      if (!exp.proofs || exp.proofs.length === 0) {
        return exp;
      }

      const seenUrls = new Set<string>();
      const seenIds = new Set<string>();
      const uniqueProofs = [];

      for (const proof of exp.proofs) {
        const urlNormalized = proof.url ? proof.url.trim().toLowerCase() : "";
        const idNormalized = proof.id ? proof.id.trim().toLowerCase() : "";

        let isDuplicate = false;

        if (urlNormalized && seenUrls.has(urlNormalized)) {
          isDuplicate = true;
        }
        if (idNormalized && seenIds.has(idNormalized)) {
          isDuplicate = true;
        }

        if (!isDuplicate) {
          if (urlNormalized) seenUrls.add(urlNormalized);
          if (idNormalized) seenIds.add(idNormalized);
          uniqueProofs.push(proof);
        } else {
          appliedFixes++;
        }
      }

      return {
        ...exp,
        proofs: uniqueProofs,
      };
    });

    return {
      journey: {
        ...journey,
        experiences: updatedExperiences,
      },
      appliedFixes,
    };
  },
};
