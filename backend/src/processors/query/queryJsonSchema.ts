export const queryJsonSchema = {
  name: "query_understanding",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,

    properties: {
      queryType: {
        type: "string",
        enum: [
          "journey_pattern",
          "comparison",
          "exploration",
          "recommendation",
          "similar_journey",
        ],
      },

      topics: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Startup",
            "Professionals",
            "College Students",
          ],
        },
      },

      subtopics: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "SaaS / Tech",
            "D2C / Consumer",
            "Fintech",
            "Edtech",
            "Social Impact",
            "Software Engineering",
            "Product Management",
            "Data / AI",
            "Design",
            "Sales / GTM",
            "Cracking Placements",
            "MS Abroad Applications",
            "Dropping Out To Build",
            "Getting Into IITs/NITs",
            "Internship",
            "Other",
            "Competition",
          ],
        },
      },

      skills: {
        type: "array",
        items: {
          type: "string",
        },
      },

      semanticQuery: {
        type: "string",
      },

      focus: {
        type: "string",
        enum: [
          "products",
          "customer_acquisition",
          "career_transition",
          "skills",
          "internships",
          "placements",
          "startup_growth",
          "fundraising",
          "product_market_fit",
          "leadership",
          "ai_careers",
          "founding_journey",
          "education",
          "ms_applications",
          "competitions",
          "decision_patterns",
          "general",
        ],
      },
    },

    required: [
      "queryType",
      "topics",
      "subtopics",
      "skills",
      "semanticQuery",
      "focus",
    ],
  },
} as const;