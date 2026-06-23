import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date in YYYY-MM-DD format");

const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime({ local: true }));

const nullableDateSchema = isoDateSchema.nullable().optional();
const nullableDateTimeSchema = isoDateTimeSchema.nullable().optional();

export const goalStatusSchema = z.enum([
  "achieved",
  "abandoned",
  "ongoing",
]);

export const goalTopicSchema = z.enum([
  "Startup",
  "Professionals",
  "College Students",
]);

export const goalSubtopicSchema = z.enum([
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
  "Competition"
]);

export const skillTypeSchema = z.enum([
  "Technical",
  "Soft",
  "Domain",
  "ExtraCurricular",
]);

export const proofSourceTypeSchema = z.enum(["image", "pdf", "github", "link"]);
export const proofStatusSchema = z.enum([
  "pending",
  "verified",
  "rejected",
  "skipped",
]);
export const applicationStatusSchema = z.enum([
  "accepted",
  "rejected",
  "waitlisted",
  "pending",
]);

export const journeyUserSchema = z
  .object({
    username: z.string().trim().min(1),
    clerkId: z.string().trim().min(1).nullable().optional(),
    preferredLanguage: z.string().trim().min(1).nullable().optional(),
    reputationScore: z.number().int().min(0).optional(),
    flagCount: z.number().int().min(0).optional(),
    isFlagged: z.boolean().optional(),
  })
  .strict();

export const journeyGoalSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    status: goalStatusSchema,
    topics: z.array(goalTopicSchema).min(1),
    subtopics: z.array(goalSubtopicSchema).min(1),
    startDate: isoDateSchema,
    endDate: nullableDateSchema,
  })
  .strict();

export const journeySkillSchema = z
  .object({
    name: z.string().trim().min(1),
    type: skillTypeSchema,
  })
  .strict();

export const journeyProofSchema = z
  .object({
    id: z.string().trim().min(1),
    sourceType: proofSourceTypeSchema,
    url: z.string().trim().min(1),
    status: proofStatusSchema,
    verifiedAt: nullableDateTimeSchema,
    reason: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

export const journeyExperienceSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    startDate: isoDateSchema,
    endDate: nullableDateSchema,
    context: z.string().trim().min(1),
    challengeFaced: z.string().trim().min(1).nullable().optional(),
    outcome: z.string().trim().min(1).nullable().optional(),
    organization: z.string().trim().min(1).nullable().optional(),
    applicationStatus: applicationStatusSchema.nullable().optional(),
    achievements: z.array(z.string().trim().min(1)).nullable().optional(),
    isVerified: z.boolean().optional(),
    goalIds: z.array(z.string().trim().min(1)),
    skills: z.array(journeySkillSchema),
    proofs: z.array(journeyProofSchema),
    timelineSummary: z.string().trim().min(1),
  })
  .strict();

export const journeyTransitionSchema = z
  .object({
    fromExperienceId: z.string().trim().min(1),
    toExperienceId: z.string().trim().min(1),
    decisionLabel: z.string().trim().min(1),
  })
  .strict();

export const journeyJsonSchema = z
  .object({
    user: journeyUserSchema,
    goals: z.array(journeyGoalSchema),
    experiences: z.array(journeyExperienceSchema),
    transitions: z.array(journeyTransitionSchema),
  })
  .strict()
  .superRefine((journey, ctx) => {
    const goalIds = new Set(journey.goals.map((goal) => goal.id));
    const experienceIds = new Set(
      journey.experiences.map((experience) => experience.id)
    );

    if (goalIds.size !== journey.goals.length) {
      ctx.addIssue({
        code: "custom",
        message: "Goal ids must be unique",
        path: ["goals"],
      });
    }

    if (experienceIds.size !== journey.experiences.length) {
      ctx.addIssue({
        code: "custom",
        message: "Experience ids must be unique",
        path: ["experiences"],
      });
    }

    journey.experiences.forEach((experience, experienceIndex) => {
      experience.goalIds.forEach((goalId, goalIndex) => {
        if (!goalIds.has(goalId)) {
          ctx.addIssue({
            code: "custom",
            message: `Unknown goal id "${goalId}"`,
            path: ["experiences", experienceIndex, "goalIds", goalIndex],
          });
        }
      });
    });

    journey.transitions.forEach((transition, transitionIndex) => {
      if (!experienceIds.has(transition.fromExperienceId)) {
        ctx.addIssue({
          code: "custom",
          message: `Unknown fromExperienceId "${transition.fromExperienceId}"`,
          path: ["transitions", transitionIndex, "fromExperienceId"],
        });
      }

      if (!experienceIds.has(transition.toExperienceId)) {
        ctx.addIssue({
          code: "custom",
          message: `Unknown toExperienceId "${transition.toExperienceId}"`,
          path: ["transitions", transitionIndex, "toExperienceId"],
        });
      }
    });
  });

export type JourneyJson = z.infer<typeof journeyJsonSchema>;
