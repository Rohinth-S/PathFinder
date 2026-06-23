export const commonPatternsJsonSchema = {
  name: "common_patterns",

  strict: true,

  schema: {
    type: "object",

    properties: {
      patterns: {
        type: "array",

        items: {
          type: "object",

          properties: {
            title: {
              type: "string",
            },

            description: {
              type: "string",
            },

            frequency: {
              type: "integer",
            },
          },

          required: [
            "title",
            "description",
            "frequency",
          ],

          additionalProperties: false,
        },
      },
    },

    required: [
      "patterns",
    ],

    additionalProperties: false,
  },
} as const;