import {
  SchemaType,
  type Schema,
} from "@google/generative-ai";

export const userSummarySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
    },
    expertiseAreas: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
    },
  },
  required: [
    "summary",
    "expertiseAreas",
  ],
};