import type { Schema } from "@google/generative-ai";

import {SchemaType} from "@google/generative-ai";

export const aiInsightsGeminiSchema: Schema = {
  type: SchemaType.OBJECT,

  properties: {
    directAnswer: {
      type: SchemaType.STRING,
    },

    keyPoints: {
      type: SchemaType.ARRAY,

      items: {
        type: SchemaType.STRING,
      },
    },

    actionableTakeaway: {
      type: SchemaType.STRING,
    },
  },

  required: [
    "directAnswer",
    "keyPoints",
    "actionableTakeaway",
  ],
};