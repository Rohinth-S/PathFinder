import { journeyExperienceSchema, submitJourneySchema, type SubmitJourney, type JourneyTransition, journeyTransitionSchema } from "./journeySchema.js";
import type { JourneyExperience, JourneyGoal } from "../../types/journey/Journey.types.js";
import { createExperiences, createTransitions } from "./createSubFields.processor.js";
import { generateExperienceEmbedding } from "./generateEmbeddings.processor.js";
import { getUsernameByUserId } from "../../services/user.service.js";
import { inferTransitionCandidates } from "./inferTransitionCandidates.processor.js";
import { geminiProvider } from "../../ai/gemini.provider.js";
import {
    TRANSITION_INFERENCE_SYSTEM_PROMPT, buildTransitionInferencePrompt,
} from "../../prompts/onboarding/transitionInference.prompt.js";
import { transitionInferenceSchema } from "./transitionInference.schema.js";
import { getGoalsByIds } from "../../services/goal.service.js";
import { generateUserSummary } from "./generateUserSummary.processor.js";
import { updateUserSummary } from "../../services/user.service.js";
import { validateExperienceDuplicate } from "./staticAnalysis/experienceDuplicate.validator.js";
import {deleteJourneySession} from "../../services/journeySession.service.js";

export interface SubmitJourneyResponse {
    goals: JourneyGoal[];
    experiences: Omit<JourneyExperience, "proofs">[];
    transitions: JourneyTransition[];
}

interface TransitionInference {
    currentTitle: string;
    fromTitle: string;
}

async function inferTransition(
    current: {
        title: string;
        context: string;
        timelineSummary: string;
        decisionLabel: string;
    },
    top5: {
        title: string;
        context: string;
        timelineSummary: string;
    }[]
): Promise<TransitionInference> {
    return geminiProvider.generateStructuredJson<TransitionInference>({
        systemPrompt: TRANSITION_INFERENCE_SYSTEM_PROMPT,
        userPrompt: buildTransitionInferencePrompt(current, top5),
        schema: transitionInferenceSchema,
    });
}
export async function submitJourney(
    userId: string,
    conversationId: string,
    input: SubmitJourney
): Promise<SubmitJourneyResponse> {
    const validation = submitJourneySchema.safeParse(input);
    if (!validation.success) {
        throw new Error(
            `Invalid journey submission: ${validation.error.message}`
        );
    }
    const validJourney = validation.data;
    const experiences: JourneyExperience[] = validJourney.experiences.map(
        ({ decisionReason, ...experience }) => {
            const parsed = journeyExperienceSchema.safeParse({
                ...experience,
                endDate: experience.endDate ?? null,
                challengeFaced: experience.challengeFaced ?? null,
                outcome: experience.outcome ?? null,
                organization: experience.organization ?? null,
                applicationStatus: experience.applicationStatus ?? null,
                achievements: experience.achievements ?? null,
                isVerified: experience.isVerified ?? false,
            });
            if (!parsed.success) {
                throw new Error(
                    `Invalid experience: ${parsed.error.message}`
                );
            }
            return parsed.data as JourneyExperience;
        }
    );

    for (const exp of experiences) {
        const isDuplicate = await validateExperienceDuplicate(userId, {
            title: exp.title,
            organization: exp.organization ?? undefined,
            description: exp.context,
            achievements: exp.achievements ?? undefined,
            outcome: exp.outcome ?? undefined,
        });

        if (isDuplicate) {
            throw new Error(
                `Submission rejected: An experience matching "${exp.title}" already exists in your journey footprint.`
            );
        }
    }

    const transitions = validJourney.experiences.flatMap((experience) => {
        const decisionReason = experience.decisionReason?.trim();
        if (!decisionReason) {
            return [];
        }
        return [{
            toExperienceId: experience.id,
            decisionLabel: decisionReason,
        }];
    });
    const username = await getUsernameByUserId(userId);
    await createExperiences(username, experiences);
    for (const experience of experiences) {
        await generateExperienceEmbedding({
            id: experience.id,
            title: experience.title,
            context: experience.context,
            challengeFaced:
                experience.challengeFaced ?? null,
            outcome:
                experience.outcome ?? null,
            achievements:
                experience.achievements ?? null,
            skills:
                experience.skills.map((s) => s.name),
        });
    }
    const inferredTransitions: TransitionInference[] = [];
    for (const transition of transitions) {
        const candidates = await inferTransitionCandidates(transition.toExperienceId, transition.decisionLabel);
        const inferred = await inferTransition(candidates.current, candidates.top5);
        inferredTransitions.push(inferred);
    }
    const validatedTransitions: JourneyTransition[] = inferredTransitions.map(
        (transition) => {
            const currentExperience = experiences.find((experience) => experience.title === transition.currentTitle);
            if (!currentExperience) {
                throw new Error(`Current experience "${transition.currentTitle}" not found.`);
            }
            const previousExperience = experiences.find((experience) => experience.title === transition.fromTitle);
            if (!previousExperience) {
                throw new Error(`Previous experience "${transition.fromTitle}" not found.`);
            }
            const decisionLabel = validJourney.experiences.find(
                (experience) => experience.title === transition.currentTitle)?.decisionReason;
            if (!decisionLabel) {
                throw new Error(
                    `Decision reason not found for "${transition.currentTitle}".`
                );
            }
            const parsed = journeyTransitionSchema.safeParse({
                fromExperienceId: previousExperience.id,
                toExperienceId: currentExperience.id,
                decisionLabel,
            });
            if (!parsed.success) {
                throw new Error(
                    `Invalid transition: ${parsed.error.message}`
                );
            }
            return parsed.data;
        }
    );
    await createTransitions(validatedTransitions);
    const { summary, expertiseAreas } = await generateUserSummary(userId);
    await updateUserSummary(userId, summary, expertiseAreas);
    const goalIds = [...new Set(experiences.flatMap((experience) => experience.goalIds))];
    const goals = await getGoalsByIds(goalIds);
    try {
        await deleteJourneySession(conversationId);
    } catch (redisError) {
        console.error(`Failed to wipe Redis onboarding cache session ${conversationId}:`, redisError);
    }
    return {
        goals,
        experiences: experiences.map(
            ({ proofs, ...experience }) => experience
        ),
        transitions: validatedTransitions,
    };

}