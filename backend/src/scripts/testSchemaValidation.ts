import "../config/env.js";
import { validateJourneySchema } from "../processors/journey/schemaValidation.processor.js";
import type { JourneyJson } from "../processors/journey/types.js";

// A completely valid journey object following all JSON schema and ID conventions
const validJourney: JourneyJson = {
  user: {
    username: "john-doe-42",
    clerkId: "user_2NGB8s",
    preferredLanguage: "en",
    reputationScore: 100,
    flagCount: 0,
    isFlagged: false,
    email: "john@example.com",
  },
  goals: [
    {
      id: "jd-42-g-startup-growth",
      title: "Scale SaaS Startup",
      description: "Grow monthly recurring revenue to $10k.",
      status: "ongoing",
      topics: ["Startup"],
      subtopics: ["SaaS / Tech"],
      startDate: "2023-01-01",
      endDate: null,
    },
  ],
  experiences: [
    {
      id: "jd-42-e-mvp-launch",
      title: "Launched MVP of DevDoc",
      startDate: "2023-01-15",
      endDate: "2023-05-01",
      context: "Built the initial release with React and Node.",
      challengeFaced: "High latency in database queries.",
      outcome: "Successfully launched with 200 signups.",
      organization: "DevDoc Inc",
      applicationStatus: null,
      achievements: ["Reached #3 on Product Hunt", "Acquired 10 paid beta users"],
      isVerified: true,
      goalIds: ["jd-42-g-startup-growth"],
      skills: [
        { name: "Full Stack Development", type: "Technical" },
        { name: "User Interviews", type: "Soft" },
      ],
      proofs: [
        {
          id: "jd-42-proof-1",
          sourceType: "github",
          url: "https://github.com/johndoe/devdoc-mvp",
          status: "verified",
          verifiedAt: "2023-05-02T12:00:00Z",
          reason: "Repository exists and is public.",
        },
      ],
      timelineSummary: "Built and launched MVP of DevDoc.",
    },
  ],
  transitions: [
    {
      fromExperienceId: "jd-42-e-mvp-launch",
      toExperienceId: "jd-42-e-mvp-launch", // self-transition for testing, valid structurally
      decisionLabel: "Decided to iterate on user feedback.",
    },
  ],
};

function runTest(description: string, data: any) {
  console.log(`\n--------------------------------------------------`);
  console.log(`Test: ${description}`);
  console.log(`--------------------------------------------------`);

  const result = validateJourneySchema(data);
  if (result.success) {
    console.log("Result: ✓ SUCCESS");
    console.log("Validated Data user:", JSON.stringify(result.data.user));
    console.log(`Validated goals count: ${result.data.goals.length}`);
    console.log(`Validated experiences count: ${result.data.experiences.length}`);
  } else {
    console.log("Result: ✗ FAILED");
    console.log(`Error Type: ${result.errorType}`);
    console.log("Errors Details:");
    console.log(JSON.stringify(result.errors, null, 2));
  }
}

function main() {
  // Test 1: Fully Valid
  runTest("Fully Valid Journey", validJourney);

  // Test 2: Invalid Zod Schema (Missing required fields & invalid enums)
  const invalidZodJourney = {
    ...validJourney,
    user: {
      ...validJourney.user,
      username: "", // should fail min(1)
    },
    goals: [
      {
        ...validJourney.goals[0],
        status: "not-an-enum-value", // invalid enum
      },
    ],
  };
  runTest("Invalid Zod Schema (Username empty, invalid Goal Status enum)", invalidZodJourney);

  // Test 3: Invalid Date Formats
  const invalidDatesJourney = {
    ...validJourney,
    goals: [
      {
        ...validJourney.goals[0],
        startDate: "2023/01/01", // Not YYYY-MM-DD format
      },
    ],
  };
  runTest("Invalid Date Formats (YYYY/MM/DD instead of YYYY-MM-DD)", invalidDatesJourney);

  // Test 4: Invalid ID conventions (Goal ID doesn't match prefix, Experience ID doesn't match prefix)
  const invalidIDsJourney = {
    ...validJourney,
    goals: [
      {
        ...validJourney.goals[0],
        id: "some-random-goal-id-99", // doesn't start with jd-42-g-
      },
    ],
    experiences: [
      {
        ...validJourney.experiences[0]!,
        id: "exp-without-prefix", // doesn't start with jd-42-e-
        proofs: [
          {
            ...validJourney.experiences[0]!.proofs![0]!,
            id: "proof-1", // doesn't start with jd-42-proof-
          },
        ],
      },
    ],
    // update goalIds in exp and transition to prevent custom refinement issues
    transitions: [
      {
        fromExperienceId: "exp-without-prefix",
        toExperienceId: "exp-without-prefix",
        decisionLabel: "Transitioned.",
      },
    ],
  };
  // First update experiences goalIds to match
  invalidIDsJourney.experiences[0]!.goalIds = ["some-random-goal-id-99"];
  runTest("Invalid ID Conventions (IDs missing username-prefix conventions)", invalidIDsJourney);
}

main();
