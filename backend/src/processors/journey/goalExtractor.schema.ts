import {SchemaType,type Schema,} from "@google/generative-ai";

export const goalExtractorSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
    },
    description: {
      type: SchemaType.STRING,
    },
  },
  required: ["title","description"],
};