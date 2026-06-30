import { apiFetch } from "./api";
import { Paths, File } from "expo-file-system";

export interface TranslateResponse {
  translatedAiInsights: {
    directAnswer: string;
    actionableTakeaway: string;
    keyPoints: string[];
  };
}

export async function translateInsights(
  token: string | null,
  aiInsights: any,
  language: string
): Promise<TranslateResponse> {
  return apiFetch<TranslateResponse>(
    "/translate",
    {
      method: "POST",
      body: JSON.stringify({ aiInsights, language }),
    },
    token || undefined
  );
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function generateSpeechUri(
  token: string | null,
  aiInsights: any,
  language: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ aiInsights, language, speaker: "meera" }), // Sarvam uses meera as default speaker
  });

  if (!response.ok) {
    throw new Error("Failed to generate speech");
  }

  // We need to read the audio blob as base64 and save it to a local file to play it with expo-av
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        const file = new File(Paths.document, "speech.wav");
        await file.write(base64Data, { encoding: "base64" });
        resolve(file.uri);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
