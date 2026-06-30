import { journeyJsonSchema } from "./journeySchema.js";
import type { JourneyJson } from "./types.js";
import { ZodError } from "zod";

export interface ValidationErrorDetail {
  path: (string | number)[];
  pathString: string;
  message: string;
  code: string;
}

export type SchemaValidationSuccessResult = {
  success: true;
  data: JourneyJson;
};

export type SchemaValidationFailureResult = {
  success: false;
  errorType: "SCHEMA_VALIDATION";
  errors: ValidationErrorDetail[];
};

export type SchemaValidationResult = SchemaValidationSuccessResult | SchemaValidationFailureResult;

function cleanUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getUserPrefix(username: string): string {
  const cleaned = cleanUsername(username);
  const parts = cleaned.split("-");

  const letters = parts
    .filter((p) => !/^\d+$/.test(p))
    .map((p) => p[0])
    .join("");

  const numbers = parts.filter((p) => /^\d+$/.test(p)).join("");

  const suffix = numbers ? `-${numbers}` : "-99";
  return `${letters}${suffix}`;
}

function formatPath(path: (string | number)[]): string {
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === "number") {
      return `${acc}[${segment}]`;
    }
    return acc ? `${acc}.${segment}` : segment;
  }, "");
}

/**
 * Validates the structure and ID conventions of an extracted journey JSON.
 *
 * @param journey The raw extracted journey output to validate.
 * @returns SchemaValidationResult containing either success: true and data, or success: false and error details.
 */
export function validateJourneySchema(journey: unknown): SchemaValidationResult {
  const validation = journeyJsonSchema.safeParse(journey);

  if (!validation.success) {
    const errors: ValidationErrorDetail[] = validation.error.issues.map((issue) => {
      const path = issue.path.map((p) => (typeof p === "symbol" ? p.toString() : p));
      return {
        path,
        pathString: formatPath(path),
        message: issue.message,
        code: issue.code,
      };
    });

    return {
      success: false,
      errorType: "SCHEMA_VALIDATION",
      errors,
    };
  }

  const validJourney = validation.data as JourneyJson;
  const errors: ValidationErrorDetail[] = [];

  // Validate ID Format following existing project conventions
  const username = validJourney.user.username;
  const userPrefix = getUserPrefix(username);

  // 1. Validate Goal IDs start with [prefix]-g-
  validJourney.goals.forEach((goal, idx) => {
    if (!goal.id.startsWith(`${userPrefix}-g-`)) {
      errors.push({
        path: ["goals", idx, "id"],
        pathString: `goals[${idx}].id`,
        message: `Goal ID "${goal.id}" does not follow the project's convention (must start with "${userPrefix}-g-")`,
        code: "invalid_id_format",
      });
    }
  });

  // 2. Validate Experience IDs start with [prefix]-e-
  validJourney.experiences.forEach((exp, idx) => {
    if (!exp.id.startsWith(`${userPrefix}-e-`)) {
      errors.push({
        path: ["experiences", idx, "id"],
        pathString: `experiences[${idx}].id`,
        message: `Experience ID "${exp.id}" does not follow the project's convention (must start with "${userPrefix}-e-")`,
        code: "invalid_id_format",
      });
    }

    // 3. Validate Proof IDs start with [prefix]-proof-
    exp.proofs.forEach((proof, proofIdx) => {
      if (!proof.id.startsWith(`${userPrefix}-proof-`)) {
        errors.push({
          path: ["experiences", idx, "proofs", proofIdx, "id"],
          pathString: `experiences[${idx}].proofs[${proofIdx}].id`,
          message: `Proof ID "${proof.id}" does not follow the project's convention (must start with "${userPrefix}-proof-")`,
          code: "invalid_id_format",
        });
      }
    });
  });

  if (errors.length > 0) {
    return {
      success: false,
      errorType: "SCHEMA_VALIDATION",
      errors,
    };
  }

  return {
    success: true,
    data: validJourney,
  };
}
