import { z } from "zod";

export const aiInsightsSchema = z.object({
  directAnswer: z.string().min(1),

  keyPoints: z.array(
    z.string().min(1)
  ).min(1),

  actionableTakeaway: z.string().min(1),
});

export type AiInsights =
  z.infer<typeof aiInsightsSchema>;