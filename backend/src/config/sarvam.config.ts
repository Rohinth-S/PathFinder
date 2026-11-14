import "../config/env.js";

const apiKey = process.env.SARVAM_API_KEY;

if (!apiKey) {
  throw new Error("SARVAM_API_KEY is missing");
}

export const sarvamConfig = {
  apiKey,
  baseUrl: "https://api.sarvam.ai",
};
