import { geminiClient } from "../../config/gemini.config.js";
import type { JourneyExperience, JourneyProof } from "../../types/journey/Journey.types.js";
import { PROOF_VERIFICATION_SYSTEM_PROMPT, buildProofVerificationPrompt } from "../../prompts/onboarding/proofVerification.prompt.js";
import { geminiProofVerificationSchema, proofVerificationResultSchema, type ProofVerificationResult } from "./proofVerification.schema.js";
import { createRequire } from "module";
import * as fs from "fs/promises";

const require = createRequire(import.meta.url);
const _pdf = require("pdf-parse");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

interface GitHubParseResult {
  type: "repository" | "pull" | "commit" | "user";
  owner: string;
  repo?: string;
  id?: string;
}

/**
 * Parses and strictly validates a GitHub URL to support Profile, Repo, PR, and Commit types.
 */
function parseGitHubUrl(url: string): GitHubParseResult | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;

    const owner = parts[0];
    if (!owner) return null;

    // User Profile: github.com/username
    if (parts.length === 1) {
      return { type: "user", owner };
    }

    const repo = parts[1];
    if (!repo) return null;

    // Repository: github.com/owner/repo
    if (parts.length === 2) {
      return { type: "repository", owner, repo: repo.replace(/\.git$/, "") };
    }

    // Pull Request: github.com/owner/repo/pull/num
    if (parts.length >= 4 && parts[2] === "pull") {
      const id = parts[3];
      if (!id) return null;
      return { type: "pull", owner, repo, id };
    }

    // Commit: github.com/owner/repo/commit/sha
    if (parts.length >= 4 && parts[2] === "commit") {
      const id = parts[3];
      if (!id) return null;
      return { type: "commit", owner, repo, id };
    }

    // Fallback to repository
    return { type: "repository", owner, repo };
  } catch {
    return null;
  }
}

/**
 * Fetches the first 1000 characters of a repository's README.
 */
async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { "User-Agent": "PathFinder-Proof-Verification" },
    });
    if (!res.ok) return "No README available or failed to fetch";
    const data = (await res.json()) as any;
    if (data.content) {
      const decoded = Buffer.from(data.content, "base64").toString("utf8");
      return decoded.substring(0, 1000) + (decoded.length > 1000 ? "... [truncated]" : "");
    }
    return "No README content found";
  } catch {
    return "Failed to fetch README";
  }
}

/**
 * Resolves local file paths or remote URLs with file safety validation.
 */
export async function fetchProofFile(urlOrPath: string): Promise<{ buffer: Buffer; mimeType: string }> {
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const res = await fetch(urlOrPath);
    if (!res.ok) {
      throw new Error(`Failed to fetch file from URL: ${urlOrPath} (Status ${res.status})`);
    }
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      throw new Error(`File exceeds maximum size of 10MB`);
    }
    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      throw new Error(`File exceeds maximum size of 10MB`);
    }
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = res.headers.get("content-type") || getMimeTypeFromUrl(urlOrPath);
    return { buffer, mimeType };
  } else {
    const stat = await fs.stat(urlOrPath);
    if (stat.size > MAX_FILE_SIZE) {
      throw new Error(`File exceeds maximum size of 10MB (${(stat.size / (1024 * 1024)).toFixed(2)}MB)`);
    }
    const buffer = await fs.readFile(urlOrPath);
    const mimeType = getMimeTypeFromUrl(urlOrPath);
    return { buffer, mimeType };
  }
}

function getMimeTypeFromUrl(urlOrPath: string): string {
  const ext = urlOrPath.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "application/octet-stream";
}

/**
 * Standalone Proof Verification Processor.
 * Verifies if the submitted proof supports the claimed experience.
 * This processor does not mutate database records.
 */
export async function verifyProof(
  experience: JourneyExperience,
  proof: JourneyProof
): Promise<ProofVerificationResult> {
  const { sourceType, url } = proof;

  try {
    let proofDetails = "";
    let imagePart: any = null;

    if (sourceType === "github") {
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        return {
          status: "rejected",
          score: 0,
          verifiedAt: null,
          reason: `Invalid GitHub URL: ${url}`,
        };
      }

      const headers = { "User-Agent": "PathFinder-Proof-Verification" };
      let payload: any = { type: parsed.type };

      if (parsed.type === "repository") {
        const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });
        if (!res.ok) throw new Error(`GitHub Repository API error (${res.status}): ${res.statusText}`);
        const data = (await res.json()) as any;
        payload.repository = {
          name: data.name,
          description: data.description,
          language: data.language,
          created_at: data.created_at,
          updated_at: data.updated_at,
          pushed_at: data.pushed_at,
          owner: data.owner?.login,
        };
        payload.topics = data.topics || [];
        payload.readme = await fetchReadme(parsed.owner, parsed.repo!);

      } else if (parsed.type === "pull") {
        const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.id}`, { headers });
        if (!res.ok) throw new Error(`GitHub Pull Request API error (${res.status}): ${res.statusText}`);
        const data = (await res.json()) as any;
        payload.pullRequest = {
          title: data.title,
          body: data.body,
          state: data.state,
          created_at: data.created_at,
          closed_at: data.closed_at,
          user: data.user?.login,
          merged: data.merged,
          merged_at: data.merged_at,
          merged_by: data.merged_by?.login,
        };

      } else if (parsed.type === "commit") {
        const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits/${parsed.id}`, { headers });
        if (!res.ok) throw new Error(`GitHub Commit API error (${res.status}): ${res.statusText}`);
        const data = (await res.json()) as any;
        payload.commit = {
          message: data.commit?.message,
          author: data.commit?.author?.name,
          date: data.commit?.author?.date,
          login: data.author?.login,
          stats: data.stats,
          files: (data.files || []).slice(0, 10).map((f: any) => f.filename),
        };

      } else if (parsed.type === "user") {
        const res = await fetch(`https://api.github.com/users/${parsed.owner}`, { headers });
        if (!res.ok) throw new Error(`GitHub User API error (${res.status}): ${res.statusText}`);
        const data = (await res.json()) as any;
        payload.userProfile = {
          login: data.login,
          name: data.name,
          company: data.company,
          blog: data.blog,
          location: data.location,
          bio: data.bio,
          public_repos: data.public_repos,
          followers: data.followers,
        };
      }

      proofDetails = JSON.stringify(payload, null, 2);

    } else if (sourceType === "pdf") {
      let fileData;
      try {
        fileData = await fetchProofFile(url);
      } catch (err: any) {
        return {
          status: "rejected",
          score: 0,
          verifiedAt: null,
          reason: `Failed to retrieve PDF file: ${err.message}`,
        };
      }

      let extractedText = "";
      let pdfMetadata: any = {};
      try {
        const parsed = await _pdf(fileData.buffer);
        extractedText = parsed.text;
        pdfMetadata = parsed.metadata || {};
      } catch (err: any) {
        return {
          status: "rejected",
          score: 0,
          verifiedAt: null,
          reason: `Failed to parse PDF content: ${err.message}`,
        };
      }

      proofDetails = JSON.stringify({
        text: extractedText || "No text extracted from PDF.",
        metadata: pdfMetadata,
      }, null, 2);

    } else if (sourceType === "image") {
      let fileData;
      try {
        fileData = await fetchProofFile(url);
      } catch (err: any) {
        return {
          status: "rejected",
          score: 0,
          verifiedAt: null,
          reason: `Failed to retrieve image file: ${err.message}`,
        };
      }

      imagePart = {
        inlineData: {
          data: fileData.buffer.toString("base64"),
          mimeType: fileData.mimeType,
        },
      };

      proofDetails = JSON.stringify({
        description: "Analyzing uploaded visual proof",
        hasImageAttached: true,
      }, null, 2);
    } else {
      return {
        status: "rejected",
        score: 0,
        verifiedAt: null,
        reason: `Unsupported proof source type: ${sourceType}`,
      };
    }

    const model = geminiClient.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: PROOF_VERIFICATION_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: geminiProofVerificationSchema,
        temperature: 0.1,
      },
    });

    const userPrompt = buildProofVerificationPrompt(experience, sourceType, proofDetails);

    const contents: any[] = [userPrompt];
    if (imagePart) {
      contents.push(imagePart);
    }

    const result = await model.generateContent(contents);
    const text = result.response.text();
    if (!text) {
      throw new Error("Gemini returned empty verification response");
    }

    const verificationObj = JSON.parse(text) as { status: "verified" | "rejected"; score: number; reason: string };

    // Validate against the Zod schema
    const candidateResult = {
      status: verificationObj.status === "verified" ? "verified" : "rejected",
      score: typeof verificationObj.score === "number" ? verificationObj.score : 0,
      verifiedAt: verificationObj.status === "verified" ? new Date().toISOString() : null,
      reason: verificationObj.reason || "No reason provided",
    };

    const validated = proofVerificationResultSchema.safeParse(candidateResult);
    if (!validated.success) {
      throw new Error(`Gemini response failed schema validation: ${validated.error.message}`);
    }

    return validated.data;

  } catch (err: any) {
    return {
      status: "rejected",
      score: 0,
      verifiedAt: null,
      reason: `Verification failed during analysis: ${err.message}`,
    };
  }
}
