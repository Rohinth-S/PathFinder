import "../config/env.js";
import { analyzeStaticRules } from "../processors/journey/staticAnalysis/engine.js";
import type { JourneyJson } from "../processors/journey/types.js";

// Helper function to build a baseline valid journey
function getValidJourney(): JourneyJson {
  return {
    user: {
      username: "alex-builder",
      email: "alex@example.com",
    },
    goals: [
      {
        id: "ab-g-startup",
        title: "Build SaaS Startup",
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
        id: "ab-e-mvp",
        title: "Software Engineer Intern",
        startDate: "2024-02-01",
        endDate: "2024-05-01",
        context: "Built the prototype MVP using React and Express.",
        challengeFaced: "Scaling database connections.",
        outcome: "Successfully launched beta testing with 50 users.",
        organization: "Acme Corp",
        applicationStatus: "accepted",
        achievements: ["Coded frontend and backend", "Fixed major query latency"],
        isVerified: true,
        goalIds: ["ab-g-startup"],
        skills: [
          { name: "Node.js", type: "Technical" },
          { name: "React", type: "Technical" },
        ],
        proofs: [
          {
            id: "ab-proof-1",
            sourceType: "github",
            url: "https://github.com/alex/mvp",
            status: "verified",
          },
        ],
        timelineSummary: "Worked as a software engineer intern building the MVP.",
      },
    ],
    transitions: [],
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
  console.log("Running Static Analysis Engine Tests");
  console.log("==================================================");

  // 1. Fully Valid Journey
  {
    console.log("\nTest Case 1: Fully Valid Journey");
    const journey = getValidJourney();
    const report = analyzeStaticRules(journey);
    assert(report.success === true, "Report success should be true");
    assert(report.issues.length === 0, "Should have 0 issues on a fully valid journey");
  }

  // 2. Empty Collections
  {
    console.log("\nTest Case 2: Empty Collections");
    const journey = getValidJourney();
    journey.goals = [];
    journey.experiences = [];
    
    let report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "empty_collection" && i.severity === "critical" && i.message.includes("goals")),
      "Should detect empty goals list"
    );
    assert(
      report.issues.some((i) => i.type === "empty_collection" && i.severity === "critical" && i.message.includes("experiences")),
      "Should detect empty experiences list"
    );

    // Empty skills/proofs
    const journey2 = getValidJourney();
    journey2.experiences[0]!.skills = [];
    journey2.experiences[0]!.proofs = [];
    report = analyzeStaticRules(journey2);
    assert(
      report.issues.some((i) => i.type === "empty_collection" && i.severity === "info" && i.field === "skills"),
      "Should detect empty skills list in experience"
    );
    assert(
      report.issues.some((i) => i.type === "empty_collection" && i.severity === "info" && i.field === "proofs"),
      "Should detect empty proofs list in experience"
    );
  }

  // 3. Missing Fields
  {
    console.log("\nTest Case 3: Missing Fields");
    const journey = getValidJourney();
    journey.goals[0]!.title = "";
    journey.goals[0]!.description = "  "; // whitespace
    journey.experiences[0]!.title = "";
    journey.experiences[0]!.context = "";
    journey.experiences[0]!.timelineSummary = "";
    journey.experiences[0]!.proofs[0]!.url = "";

    const report = analyzeStaticRules(journey);
    assert(report.issues.some((i) => i.type === "missing_field" && i.nodeId === "ab-g-startup" && i.field === "title"), "Goal missing title");
    assert(report.issues.some((i) => i.type === "missing_field" && i.nodeId === "ab-g-startup" && i.field === "description"), "Goal missing description");
    assert(report.issues.some((i) => i.type === "missing_field" && i.nodeId === "ab-e-mvp" && i.field === "title"), "Experience missing title");
    assert(report.issues.some((i) => i.type === "missing_field" && i.nodeId === "ab-e-mvp" && i.field === "context"), "Experience missing context");
    assert(report.issues.some((i) => i.type === "missing_field" && i.nodeId === "ab-e-mvp" && i.field === "timelineSummary"), "Experience missing timelineSummary");
    assert(report.issues.some((i) => i.type === "missing_field" && i.nodeId === "ab-proof-1" && i.field === "url"), "Proof missing url");
  }

  // 4. Missing Relationships
  {
    console.log("\nTest Case 4: Missing Relationships");
    const journey = getValidJourney();
    journey.experiences[0]!.goalIds = [];
    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "missing_relationship" && i.nodeId === "ab-e-mvp" && i.field === "goalIds"),
      "Should flag experience with no goals linked"
    );
  }

  // 5. Missing Transitions
  {
    console.log("\nTest Case 5: Missing Transitions");
    const journey = getValidJourney();
    // Add another experience so we have > 1 experience but 0 transitions
    journey.experiences.push({
      ...journey.experiences[0]!,
      id: "ab-e-pm",
      title: "Product Manager Intern",
      startDate: "2024-06-01",
      endDate: "2024-08-01",
      goalIds: ["ab-g-startup"],
    });
    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "missing_transition" && i.severity === "warning"),
      "Should flag missing transitions when >1 experience and 0 transitions"
    );
  }

  // 6. Missing Outcomes
  {
    console.log("\nTest Case 6: Missing Outcomes");
    const journey = getValidJourney();
    journey.experiences[0]!.outcome = ""; // Missing outcome
    // Ensure it has an endDate in the past so it's completed
    journey.experiences[0]!.endDate = "2023-12-31"; 
    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "missing_outcome" && i.nodeId === "ab-e-mvp" && i.field === "outcome"),
      "Should flag completed experience missing outcome"
    );
  }

  // 7. Missing Organizations
  {
    console.log("\nTest Case 7: Missing Organizations for Work Experiences");
    const journey = getValidJourney();
    journey.experiences[0]!.organization = ""; // missing org
    journey.experiences[0]!.title = "Full Stack Engineer"; // Has "engineer" keyword
 
    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "missing_organization" && i.nodeId === "ab-e-mvp" && i.field === "organization"),
      "Should detect missing organization on engineer work experience"
    );
  }

  // 8. Missing Durations
  {
    console.log("\nTest Case 8: Missing Durations and Date Errors");
    const journey = getValidJourney();
    // Finished goal but missing endDate
    journey.goals[0]!.status = "achieved";
    journey.goals[0]!.endDate = null;

    // Experience date logical error: start > end
    journey.experiences[0]!.startDate = "2024-05-01";
    journey.experiences[0]!.endDate = "2024-01-01";

    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "missing_duration" && i.nodeId === "ab-g-startup" && i.field === "endDate"),
      "Should flag achieved goal missing endDate"
    );
    assert(
      report.issues.some((i) => i.type === "missing_duration" && i.nodeId === "ab-e-mvp" && i.message.includes("after its endDate")),
      "Should flag experience startDate > endDate error"
    );
  }


  // 10. Duplicate Experiences
  {
    console.log("\nTest Case 10: Duplicate Experiences");
    const journey = getValidJourney();
    // Add exact duplicate experience
    journey.experiences.push({
      ...journey.experiences[0]!,
      id: "ab-e-mvp-dup",
    });

    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "duplicate_experience" && i.nodeId === "ab-e-mvp-dup"),
      "Should flag duplicate experience"
    );
  }

  // 11. Invalid References
  {
    console.log("\nTest Case 11: Invalid References (Transitions)");
    const journey = getValidJourney();
    // Self transition
    journey.transitions.push({
      fromExperienceId: "ab-e-mvp",
      toExperienceId: "ab-e-mvp",
      decisionLabel: "Self transition",
    });

    let report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "invalid_reference" && i.message.includes("self-transition")),
      "Should flag self-transition"
    );

    // Loop cycle: A -> B and B -> A
    const journey2 = getValidJourney();
    journey2.experiences.push({
      ...journey2.experiences[0]!,
      id: "ab-e-pm",
      title: "PM Intern",
    });
    journey2.transitions.push(
      {
        fromExperienceId: "ab-e-mvp",
        toExperienceId: "ab-e-pm",
        decisionLabel: "Go to PM",
      },
      {
        fromExperienceId: "ab-e-pm",
        toExperienceId: "ab-e-mvp",
        decisionLabel: "Go back to engineer",
      }
    );

    report = analyzeStaticRules(journey2);
    assert(
      report.issues.some((i) => i.type === "invalid_reference" && i.message.includes("Transition cycle detected")),
      "Should flag transition cycles"
    );
  }

  // 12. Broken Relationships
  {
    console.log("\nTest Case 12: Broken Relationships");
    const journey = getValidJourney();
    // Add a goal, but no experience links to it
    journey.goals.push({
      id: "ab-g-finance",
      title: "Manage Personal Finance",
      description: "Save 30% of income",
      status: "ongoing",
      topics: ["Professionals"],
      subtopics: ["Fintech"],
      startDate: "2024-01-01",
      endDate: null,
    });

    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "broken_relationship" && i.nodeId === "ab-g-finance"),
      "Should flag disconnected goal"
    );
  }

  // 13. Orphan Nodes
  {
    console.log("\nTest Case 13: Orphan Nodes");
    const journey = getValidJourney();
    // Add two more experiences, only connect two of them, leaving one as orphan
    journey.experiences.push(
      {
        ...journey.experiences[0]!,
        id: "ab-e-pm",
        title: "PM Intern",
      },
      {
        ...journey.experiences[0]!,
        id: "ab-e-qa",
        title: "QA Engineer",
      }
    );
    journey.transitions.push({
      fromExperienceId: "ab-e-mvp",
      toExperienceId: "ab-e-pm",
      decisionLabel: "Transitioned to PM",
    });

    const report = analyzeStaticRules(journey);
    assert(
      report.issues.some((i) => i.type === "orphan_node" && i.nodeId === "ab-e-qa"),
      "Should flag QA experience as orphan node"
    );
    assert(
      !report.issues.some((i) => i.nodeId === "ab-e-mvp" || i.nodeId === "ab-e-pm"),
      "Should not flag connected experience nodes as orphan"
    );
  }

  console.log("\n--------------------------------------------------");
  console.log(`TEST SUMMARY: Passed ${passedTests} / ${totalTests} assertions.`);
  console.log("--------------------------------------------------");

  if (passedTests === totalTests) {
    console.log("✓ ALL TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error("✗ SOME TESTS FAILED.");
    process.exit(1);
  }
}

runTests();
