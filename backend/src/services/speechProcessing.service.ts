import { sarvamProvider } from "../ai/sarvam.provider.js";

export interface ResolvedQuery {
  query: string;
  transcribed: boolean;
}

export async function resolveAudioQuery(
  audioFile: Express.Multer.File
): Promise<ResolvedQuery> {
  const query = await sarvamProvider.speechToText(audioFile.buffer, audioFile.originalname, audioFile.mimetype, "translate" );

  if (!query?.trim()) {
    throw new Error("Failed to transcribe audio");
  }

  return {
    query,
    transcribed: true,
  };
}