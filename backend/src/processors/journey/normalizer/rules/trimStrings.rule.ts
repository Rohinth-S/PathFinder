import type { JourneyJson } from "../../types.js";
import type { NormalizerRule, NormalizationResult } from "../types.js";

export const trimStringsRule: NormalizerRule = {
  name: "trimStrings",
  normalize(journey: JourneyJson): NormalizationResult {
    let appliedFixes = 0;

    function trimObject(obj: any): any {
      if (obj === null || obj === undefined) return obj;

      if (typeof obj === "string") {
        const trimmed = obj.trim();
        if (trimmed !== obj) {
          appliedFixes++;
        }
        return trimmed;
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => trimObject(item));
      }

      if (typeof obj === "object") {
        const newObj: any = {};
        for (const key of Object.keys(obj)) {
          newObj[key] = trimObject(obj[key]);
        }
        return newObj;
      }

      return obj;
    }

    const cleanedJourney = trimObject(journey) as JourneyJson;

    return {
      journey: cleanedJourney,
      appliedFixes,
    };
  },
};
