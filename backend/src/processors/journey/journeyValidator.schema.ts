import type { Schema } from "@google/generative-ai";
import { SchemaType } from "@google/generative-ai";

export interface OnboardingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface JourneyValidationFinding {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  priority: "low" | "medium" | "high";
  field: string;
  reason: string;
}

export interface JourneyValidationQuestion {
  id: string;
  question: string;
  priority: "low" | "medium" | "high";
  expectedFields: string[];
}

export interface JourneyValidationResult {
  conversationComplete: boolean;
  completionReason: string;
  confidence: number;
  findings: JourneyValidationFinding[];
  questions: JourneyValidationQuestion[];
}

export const journeyValidationSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    conversationComplete: {
      type: SchemaType.BOOLEAN,
      description: "Set to true when all critical graph information is complete, verified, and consistent. Otherwise false.",
    },
    completionReason: {
      type: SchemaType.STRING,
      description: "Brief summary explaining why the conversation is complete or what primary details are still missing.",
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: "A value from 0.0 to 1.0 indicating sufficiency, consistency, and trustworthiness of the collected details for generating the final graph.",
    },
    findings: {
      type: SchemaType.ARRAY,
      description: "Specific issues, gaps, ambiguities, inconsistencies, or plausibility findings identified in the user's claims.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING, description: "e.g. completeness, ambiguity, consistency, plausibility, relationship, existing_graph" },
          severity: {
            type: SchemaType.STRING,
            enum: ["info", "warning", "critical"],
          },
          priority: {
            type: SchemaType.STRING,
            enum: ["low", "medium", "high"],
          },
          field: { type: SchemaType.STRING, description: "The specific schema field or relationship this finding targets." },
          reason: { type: SchemaType.STRING, description: "Detailed explanation of the finding." },
        },
        required: ["id", "type", "severity", "priority", "field", "reason"],
      },
    },
    questions: {
      type: SchemaType.ARRAY,
      description: "Optimized, merged, natural conversational questions to resolve findings. Must be empty if conversationComplete is true.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING, description: "The conversational question asking for details." },
          priority: {
            type: SchemaType.STRING,
            enum: ["low", "medium", "high"],
          },
          expectedFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Direct schema fields or relationships that this question will populate (e.g. ['organization', 'startDate', 'endDate'])."
          },
        },
        required: ["id", "question", "priority", "expectedFields"],
      },
    },
  },
  required: ["conversationComplete", "completionReason", "confidence", "findings", "questions"],
};
