import { z } from "zod";

export const commonPatternSchema = z.object({
  patterns: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      frequency: z.number().int().min(0),
    })
  ),
});

export type CommonPatternResponse =
  z.infer<
    typeof commonPatternSchema
  >;