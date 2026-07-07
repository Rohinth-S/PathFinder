import "../config/env.js";
import { verifyProof } from "../processors/journey/verifyProof.processor.js";
import type { JourneyExperience } from "../types/journey/Journey.types.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagePath = path.join(__dirname, "assets", "sample_certificate.png");

// -------------------------------------------------------------
// Mock Experiences
// -------------------------------------------------------------

// Claim that does NOT match the proofs (will result in REJECTION)
const mockRejectedExperience: JourneyExperience = {
  id: "user-exp-rejected",
  title: "Software Engineering Intern",
  organization: "Google",
  startDate: "2023-05",
  endDate: "2023-08",
  context: "Worked on building distributed backend microservices and API gateways using Go and gRPC.",
  challengeFaced: "Scaling database connections under high throughput.",
  outcome: "Improved latency by 20% and resolved socket leakage.",
  applicationStatus: null,
  achievements: ["Successfully completed and deployed the internship project", "Received a return offer"],
  isVerified: false,
  goalIds: [],
  skills: [{ name: "Go", type: "Technical" }, { name: "gRPC", type: "Technical" }],
  proofs: [],
  timelineSummary: "Completed software engineering internship at Google, improving system performance."
};

// Experience matching octocat/Hello-World (will result in ACCEPTANCE)
const mockGitHubSuccessExperience: JourneyExperience = {
  id: "user-exp-github-success",
  title: "Open Source Contributor",
  organization: "GitHub",
  startDate: "2011-01",
  endDate: "2011-02",
  context: "Contributed to open source community onboarding by setting up and editing the initial Hello-World repository for new users.",
  challengeFaced: null,
  outcome: null,
  applicationStatus: null,
  achievements: ["Helped create the Hello-World repository", "Added initial setup commits"],
  isVerified: false,
  goalIds: [],
  skills: [{ name: "Git", type: "Technical" }],
  proofs: [],
  timelineSummary: "Contributed to GitHub's open source Hello-World repository."
};

// Experience matching dummy.pdf (will result in ACCEPTANCE)
const mockPdfSuccessExperience: JourneyExperience = {
  id: "user-exp-pdf-success",
  title: "Creator / Writer",
  organization: "Writer",
  startDate: "2007-02",
  endDate: "2007-03",
  context: "Published document testing templates. Wrote and created a Dummy PDF file using OpenOffice.org creator tools.",
  challengeFaced: null,
  outcome: null,
  applicationStatus: null,
  achievements: ["Wrote a Dummy PDF template to test XML/PDF rendering tools"],
  isVerified: false,
  goalIds: [],
  skills: [{ name: "Technical Writing", type: "Domain" }],
  proofs: [],
  timelineSummary: "Wrote dummy PDF document."
};

// Experience matching sample_certificate.png exactly (will result in ACCEPTANCE)
const mockImageSuccessExperience: JourneyExperience = {
  id: "user-exp-image-success",
  title: "Software Engineering Intern",
  organization: "Google",
  startDate: "2024-06",
  endDate: "2024-08",
  context: "Participated in the Software Engineering Internship program at Google, contributing to projects within the Cloud Infrastructure Team. Demonstrated dedicated contribution, exceptional engineering skills, and outstanding performance.",
  challengeFaced: null,
  outcome: null,
  applicationStatus: null,
  achievements: ["Successfully completed the Google internship program", "Worked with the Cloud Infrastructure Team"],
  isVerified: false,
  goalIds: [],
  skills: [{ name: "Cloud Infrastructure", type: "Technical" }],
  proofs: [],
  timelineSummary: "Completed software engineering internship at Google under the Cloud Infrastructure Team."
};

// -------------------------------------------------------------
// Test Functions
// -------------------------------------------------------------

async function testGitHubRepository() {
  console.log("\n==========================================");
  console.log("TEST 1: GitHub Repo Proof (EXPECTED REJECT)");
  console.log("==========================================");
  const result = await verifyProof(mockRejectedExperience, {
    id: "user-proof-github-repo",
    sourceType: "github",
    url: "https://github.com/octocat/Hello-World",
    status: "pending",
  });
  console.log("GitHub Repo Result:", JSON.stringify(result, null, 2));
}

async function testGitHubRepositorySuccess() {
  console.log("\n==========================================");
  console.log("TEST 2: GitHub Repo Proof (EXPECTED VERIFIED)");
  console.log("==========================================");
  const result = await verifyProof(mockGitHubSuccessExperience, {
    id: "user-proof-github-repo-success",
    sourceType: "github",
    url: "https://github.com/octocat/Hello-World",
    status: "pending",
  });
  console.log("GitHub Repo Success Result:", JSON.stringify(result, null, 2));
}

async function testPdfProof() {
  console.log("\n==========================================");
  console.log("TEST 3: PDF Proof (EXPECTED REJECT)");
  console.log("==========================================");
  const result = await verifyProof(mockRejectedExperience, {
    id: "user-proof-pdf",
    sourceType: "pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "pending",
  });
  console.log("PDF Proof Result:", JSON.stringify(result, null, 2));
}

async function testPdfProofSuccess() {
  console.log("\n==========================================");
  console.log("TEST 4: PDF Proof (EXPECTED VERIFIED)");
  console.log("==========================================");
  const result = await verifyProof(mockPdfSuccessExperience, {
    id: "user-proof-pdf-success",
    sourceType: "pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "pending",
  });
  console.log("PDF Success Result:", JSON.stringify(result, null, 2));
}

async function testImageProof() {
  console.log("\n==========================================");
  console.log("TEST 5: Image Proof (EXPECTED REJECT)");
  console.log("==========================================");
  const result = await verifyProof(mockRejectedExperience, {
    id: "user-proof-image",
    sourceType: "image",
    url: imagePath,
    status: "pending",
  });
  console.log("Image Proof Result:", JSON.stringify(result, null, 2));
}

async function testImageProofSuccess() {
  console.log("\n==========================================");
  console.log("TEST 6: Image Proof (EXPECTED VERIFIED)");
  console.log("==========================================");
  const result = await verifyProof(mockImageSuccessExperience, {
    id: "user-proof-image-success",
    sourceType: "image",
    url: imagePath,
    status: "pending",
  });
  console.log("Image Success Result:", JSON.stringify(result, null, 2));
}

async function run() {
  try {
    await testGitHubRepository();
    await testGitHubRepositorySuccess();
    await testPdfProof();
    await testPdfProofSuccess();
    await testImageProof();
    await testImageProofSuccess();
  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
