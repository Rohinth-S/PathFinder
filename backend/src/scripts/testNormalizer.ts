import "../config/env.js";
import { normalizeJourney } from "../processors/journey/normalizer/engine.js";
import type { JourneyJson } from "../processors/journey/types.js";

// Helper function to build a mock journey needing normalization
function getMockJourneyToNormalize(): JourneyJson {
  return {
    user: {
      username: "  alex-builder  ", // needs trim
      email: "alex@example.com  ", // needs trim
    },
    goals: [
      {
        id: "ab-g-startup",
        title: "  Build SaaS Startup  ", // needs trim
        description: "Launch and grow a SaaS business",
        status: "ongoing",
        topics: ["Startup"],
        subtopics: ["SaaS / Tech"],
        startDate: "2024-01-01",
        endDate: null,
      },
    ],
    experiences: [
      {
        id: "ab-e-second",
        title: "Software Engineer Intern",
        startDate: "2024-06-01", // chronological: 2nd
        endDate: "2024-08-01",
        context: "Built the prototype MVP using React.",
        organization: "Acme Corp",
        goalIds: ["ab-g-startup", "ab-g-startup"], // duplicate goalId
        skills: [
          { name: "Node.js", type: "Technical" },
          { name: "node.js", type: "Technical" }, // duplicate skill (case-insensitive)
          { name: "React", type: "Technical" },
        ],
        proofs: [
          {
            id: "ab-proof-1",
            sourceType: "github",
            url: "https://github.com/alex/mvp",
            status: "verified",
          },
          {
            id: "ab-proof-1-dup",
            sourceType: "github",
            url: "https://github.com/alex/mvp", // duplicate proof URL
            status: "pending",
          },
        ],
        timelineSummary: "Worked as a software engineer intern.",
      },
      {
        id: "ab-e-first",
        title: "Web Developer",
        startDate: "2024-02-01", // chronological: 1st (needs sorting)
        endDate: "2024-05-01",
        context: "Coded HTML/CSS templates.",
        organization: "Contract LLC",
        goalIds: ["ab-g-startup"],
        skills: [{ name: "CSS", type: "Technical" }],
        proofs: [],
        timelineSummary: "Web developer contract role.",
      },
    ],
    transitions: [
      {
        fromExperienceId: "ab-e-first",
        toExperienceId: "ab-e-second",
        decisionLabel: "Joined Acme Corp",
      },
      {
        fromExperienceId: "ab-e-first",
        toExperienceId: "ab-e-second",
        decisionLabel: "Joined Acme Corp", // duplicate transition
      },
    ],
  };
}

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function runTests() {
  console.log("==================================================");
  console.log("Running Journey Normalizer Tests");
  console.log("==================================================");

  // 1. Core Normalization Runner
  {
    console.log("\nTest Case 1: Core Normalizer Execution");
    const journey = getMockJourneyToNormalize();
    const result = normalizeJourney(journey);

    assert(result.journey.user.username === "alex-builder", "Should trim username");
    assert(result.journey.user.email === "alex@example.com", "Should trim email");
    assert(result.journey.goals[0]!.title === "Build SaaS Startup", "Should trim goal title");

    // Check duplicate skill cleanup
    const secondExp = result.journey.experiences.find((e) => e.id === "ab-e-second")!;
    assert(secondExp.skills.length === 2, "Should deduplicate experience skills from 3 to 2");
    assert(
      secondExp.skills.some((s) => s.name === "Node.js") && !secondExp.skills.some((s) => s.name === "node.js" && s !== secondExp.skills[0]),
      "Should keep only the first Node.js instance"
    );

    // Check duplicate proof cleanup
    assert(secondExp.proofs.length === 1, "Should deduplicate experience proofs from 2 to 1");

    // Check relationship cleanup
    assert(secondExp.goalIds.length === 1, "Should deduplicate experience goalIds from 2 to 1");
    assert(result.journey.transitions.length === 1, "Should deduplicate transitions from 2 to 1");

    // Check sorting
    assert(result.journey.experiences[0]!.id === "ab-e-first", "Experiences should be sorted chronologically (first experience first)");
    assert(result.journey.experiences[1]!.id === "ab-e-second", "Experiences should be sorted chronologically (second experience last)");

    // Check metadata tracking
    assert(result.totalFixes > 0, "Total fixes should be greater than 0");
    assert(result.ruleFixes["trimStrings"] === 3, "trimStrings should report 3 modifications");
    assert(result.ruleFixes["deduplicateSkills"] === 1, "deduplicateSkills should report 1 fix");
    assert(result.ruleFixes["deduplicateProofs"] === 1, "deduplicateProofs should report 1 fix");
    assert(result.ruleFixes["deduplicateRelationships"] === 2, "deduplicateRelationships should report 2 fixes (1 goalId, 1 transition)");
    assert(result.ruleFixes["sortExperiences"] === 1, "sortExperiences should report 1 fix");
  }

  // 2. Safe Sorting Validation
  {
    console.log("\nTest Case 2: Safe Sorting with Partial Dates");
    const journey = getMockJourneyToNormalize();
    // Inject invalid startDate
    journey.experiences[1]!.startDate = "invalid-date";

    const result = normalizeJourney(journey);
    // Should NOT sort
    assert(result.journey.experiences[0]!.id === "ab-e-second", "Should preserve original order when date is invalid");
    assert(result.ruleFixes["sortExperiences"] === 0, "sortExperiences should apply 0 fixes");
  }

  // 3. Idempotency Verification
  {
    console.log("\nTest Case 3: Idempotency Verification");
    const journey = getMockJourneyToNormalize();
    
    // First pass
    const pass1 = normalizeJourney(journey);
    
    // Second pass
    const pass2 = normalizeJourney(pass1.journey);

    assert(JSON.stringify(pass1.journey) === JSON.stringify(pass2.journey), "Journey output must be identical after second pass");
    assert(pass2.totalFixes === 0, "Second pass must apply 0 modifications");
    
    // Verify each rule specifically applied 0 modifications on second pass
    for (const ruleName of Object.keys(pass2.ruleFixes)) {
      assert(pass2.ruleFixes[ruleName] === 0, `Rule "${ruleName}" applied 0 fixes on second pass`);
    }
  }

  console.log("\n--------------------------------------------------");
  console.log(`TEST SUMMARY: Passed ${passedTests} / ${totalTests} assertions.`);
  console.log("--------------------------------------------------");

  if (passedTests === totalTests) {
    console.log("✓ ALL NORMALIZER TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error("✗ SOME NORMALIZER TESTS FAILED.");
    process.exit(1);
  }
}

runTests();

