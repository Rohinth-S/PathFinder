import { pipeline } from "@xenova/transformers";

let embeddingPipeline: any = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/bge-small-en-v1.5"
    );
  }

  return embeddingPipeline;
}

export async function initializeEmbeddingModel(): Promise<void> {
  await getEmbeddingPipeline();
}

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}