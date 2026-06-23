import { sarvamConfig } from "../config/sarvam.config.js";

export class SarvamProvider {
  /**
   * Translates text from source language to target language using Sarvam Translate API.
   * Supports 22 scheduled Indian languages and English.
   * 
   * @param text The text to translate (max 2000 chars)
   * @param targetLanguageCode Target language code (e.g. "hi-IN", "te-IN")
   * @param sourceLanguageCode Source language code (e.g. "en-IN", "auto" for detection)
   */
  async translate(
    text: string,
    targetLanguageCode: string,
    sourceLanguageCode: string = "auto"
  ): Promise<string> {
    const response = await fetch(`${sarvamConfig.baseUrl}/translate`, {
      method: "POST",
      headers: {
        "api-subscription-key": sarvamConfig.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        source_language_code: sourceLanguageCode,
        target_language_code: targetLanguageCode,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sarvam Translation API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as { translated_text: string };
    return data.translated_text;
  }

  /**
   * Synthesizes speech from text using Sarvam Bulbul TTS API.
   * 
   * @param text The text to convert to speech (max 2500 chars)
   * @param targetLanguageCode Target BCP-47 language code (e.g. "hi-IN", "en-IN")
   * @param speaker The speaker voice name (default "shubh")
   * @param pace Speed pace of speech (0.5 to 2.0)
   * @returns Base64 encoded audio string
   */
  async textToSpeech(
    text: string,
    targetLanguageCode: string,
    speaker: string = "shubh",
    pace: number = 1.0
  ): Promise<string> {
    const response = await fetch(`${sarvamConfig.baseUrl}/text-to-speech`, {
      method: "POST",
      headers: {
        "api-subscription-key": sarvamConfig.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        target_language_code: targetLanguageCode,
        speaker,
        model: "bulbul:v3",
        pace,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sarvam TTS API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as { audios: string[] };
    const audio = data.audios?.[0];
    if (!audio) {
      throw new Error("Sarvam TTS API returned no audio content");
    }

    return audio;
  }

  /**
   * Transcribes an audio file buffer to text using Sarvam Saaras STT API.
   * 
   * @param audioBuffer The audio buffer containing WAV/MP3 data
   * @param mode Speech mode ("transcribe", "translate", etc.)
   * @returns The transcribed/translated text
   */
  async speechToText(
    audioBuffer: Buffer,
    mode: "transcribe" | "translate" | "verbatim" | "translit" | "codemix" = "translate"
  ): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" });
    formData.append("file", blob, "audio.wav");
    formData.append("model", "saaras:v3");
    formData.append("mode", mode);

    const response = await fetch(`${sarvamConfig.baseUrl}/speech-to-text`, {
      method: "POST",
      headers: {
        "api-subscription-key": sarvamConfig.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sarvam STT API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as { transcript: string };
    return data.transcript;
  }
}

export const sarvamProvider = new SarvamProvider();
