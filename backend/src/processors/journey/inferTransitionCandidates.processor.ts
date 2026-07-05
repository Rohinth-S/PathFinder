import { generateEmbedding } from "../../services/embeddings.service.js";
import { closeSession, getSession } from "../../services/neo4j.service.js";

export interface CurrentExperience {
    id: string;
    title: string;
    context: string;
    timelineSummary: string;
    decisionLabel: string;
}

export interface TransitionCandidate {
    id: string;
    title: string;
    context: string;
    timelineSummary: string;
}

export interface TransitionInferenceInput {
    current: CurrentExperience;
    top5: TransitionCandidate[];
}

export async function inferTransitionCandidates(
    toExperienceId: string,
    decisionLabel: string
): Promise<TransitionInferenceInput> {
    const session = getSession();

    try {
        const destinationResult = await session.run(
            `
      MATCH (e:Experience {id: $experienceId})
      RETURN
        e.title AS title,
        e.context AS context,
        e.timelineSummary AS timelineSummary,
        e.startDate AS startDate
      `,
            {
                experienceId: toExperienceId,
            }
        );
        if (destinationResult.records.length === 0) {
            throw new Error("Destination experience not found.");
        }
        const destination = destinationResult.records[0];
        if (!destination) {
            throw new Error("Destination experience not found.");
        }
        const title = destination.get("title") as string;
        const context = destination.get("context") as string;
        const startDate = destination.get("startDate");
        const timelineSummary = destination.get("timelineSummary") as string;
        const embeddingText = [`Title: ${title}`, `Context: ${context}`, `Decision: ${decisionLabel}`, `Timeline Summary: ${timelineSummary}`].join("\n\n");
        const embedding = await generateEmbedding(embeddingText);
        const result = await session.run(
            `
      CALL db.index.vector.queryNodes(
        'experience_embedding_index',
        5,
        $embedding
      )
      YIELD node, score
      WHERE
        node.id <> $experienceId
        AND coalesce(node.endDate, node.startDate) < $startDate
      RETURN
        node.id AS id,
        node.title AS title,
        node.context AS context,
        node.timelineSummary AS timelineSummary
      `,
            {
                embedding,
                experienceId: toExperienceId,
                startDate,
            }
        );

        return {
            current: {
                id: toExperienceId,
                title,
                context,
                timelineSummary,
                decisionLabel,
            },
            top5: result.records.map((record) => ({
                id: record.get("id") as string,
                title: record.get("title") as string,
                context: record.get("context") as string,
                timelineSummary: record.get("timelineSummary") as string,
            })),
        };
    } finally {
        await closeSession(session);
    }
}