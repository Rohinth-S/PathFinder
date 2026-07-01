import type { JourneyJson } from "../../types.js";
import type { NormalizerRule, NormalizationResult } from "../types.js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(dateStr: string | undefined | null): boolean {
  if (!dateStr || !DATE_REGEX.test(dateStr)) return false;
  const time = Date.parse(dateStr);
  return !isNaN(time);
}

export const sortExperiencesRule: NormalizerRule = {
  name: "sortExperiences",
  normalize(journey: JourneyJson): NormalizationResult {
    if (!journey.experiences || journey.experiences.length <= 1) {
      return { journey, appliedFixes: 0 };
    }

    // Check if ALL experiences have a valid startDate
    const allValid = journey.experiences.every((exp) => isValidDate(exp.startDate));

    if (!allValid) {
      // If dates are missing, partial, or invalid, preserve the original order.
      return { journey, appliedFixes: 0 };
    }

    // Check if they are already sorted
    let isAlreadySorted = true;
    for (let i = 0; i < journey.experiences.length - 1; i++) {
      const current = Date.parse(journey.experiences[i]!.startDate);
      const next = Date.parse(journey.experiences[i + 1]!.startDate);
      if (current > next) {
        isAlreadySorted = false;
        break;
      }
    }

    if (isAlreadySorted) {
      return { journey, appliedFixes: 0 };
    }

    // Sort ascending chronologically (stable sort)
    const sorted = journey.experiences
      .map((exp, idx) => ({ exp, idx }))
      .sort((a, b) => {
        const timeA = Date.parse(a.exp.startDate);
        const timeB = Date.parse(b.exp.startDate);
        if (timeA !== timeB) {
          return timeA - timeB;
        }
        return a.idx - b.idx; // stable sort fallback
      })
      .map((item) => item.exp);

    return {
      journey: {
        ...journey,
        experiences: sorted,
      },
      appliedFixes: 1,
    };
  },
};
