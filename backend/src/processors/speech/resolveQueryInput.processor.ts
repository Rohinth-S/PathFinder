import {resolveAudioQuery,type ResolvedQuery} from "../../services/speechProcessing.service.js";

export interface ResolveQueryInput {
  query?: unknown;
  audioFile: Express.Multer.File | undefined;
}

export async function resolveQueryInput(
  input: ResolveQueryInput
): Promise<ResolvedQuery> {

  const { query, audioFile } = input;
  if (audioFile) {
    return resolveAudioQuery(audioFile);
  }

  if (typeof query === "string" && query.trim()) {
    return { query, transcribed: false};
  }

  throw new Error(
    "Either query or audioFile is required"
  );
}