import { z } from "zod";

export const queryTypeSchema = z.enum([
  "journey_pattern",
  "comparison",
  "exploration",
  "recommendation",
  "similar_journey",
]);

export type QueryType = z.infer<
  typeof queryTypeSchema
>;

export const topicSchema = z.enum([
  "Startup",
  "Professionals",
  "College Students",
]);

export const subtopicSchema = z.enum([
  "SaaS / Tech",
  "D2C / Consumer",
  "Fintech",
  "Edtech",
  "Social Impact",
  "Software Engineering",
  "Product Management",
  "Data / AI",
  "Design",
  "Sales / GTM",
  "Cracking Placements",
  "MS Abroad Applications",
  "Dropping Out To Build",
  "Getting Into IITs/NITs",
  "Internship",
  "Other",
  "Competition",
]);

export const focusSchema = z.enum([
  "products",
  "customer_acquisition",
  "career_transition",
  "skills",
  "internships",
  "placements",
  "startup_growth",
  "fundraising",
  "product_market_fit",
  "leadership",
  "ai_careers",
  "founding_journey",
  "education",
  "ms_applications",
  "competitions",
  "decision_patterns",
  "general",
]);

export const queryUnderstandingSchema = z
  .object({
    queryType: queryTypeSchema,
    topics: z.array(topicSchema),
    subtopics: z.array(subtopicSchema),
    skills: z.array(z.string()),
    semanticQuery: z.string().trim().min(1),
    focus: focusSchema,
  })
  .strict();

export type QueryUnderstanding = z.infer<
  typeof queryUnderstandingSchema
>;