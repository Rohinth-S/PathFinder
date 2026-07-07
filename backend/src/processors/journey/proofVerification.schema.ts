import { SchemaType, type Schema } from "@google/generative-ai";
import { z } from "zod";

export const geminiProofVerificationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    status: {
      type: SchemaType.STRING,
      description: "Whether the proof supports the claimed experience: must be 'verified' or 'rejected'",
    },
    score: {
      type: SchemaType.INTEGER,
      description: "Confidence score from 0 to 100 on how well the proof supports the experience",
    },
    reason: {
      type: SchemaType.STRING,
      description: "Detailed explanation of why the status was chosen and how the proof supports or fails to support the experience",
    },
  },
  required: ["status", "score", "reason"],
};

export const proofVerificationResultSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  score: z.number().int().min(0).max(100),
  verifiedAt: z.string().nullable(),
  reason: z.string().trim().min(1),
});

export type ProofVerificationResult = z.infer<typeof proofVerificationResultSchema>;
