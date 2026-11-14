import {type Schema,SchemaType} from "@google/generative-ai";

export const transitionInferenceSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    currentTitle: {
      type: SchemaType.STRING,
    },
    fromTitle: {
      type: SchemaType.STRING,
    },
  },
  required: [
    "currentTitle",
    "fromTitle",
  ],
};