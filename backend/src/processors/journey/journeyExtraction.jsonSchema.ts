import type { Schema } from "@google/generative-ai";
import { SchemaType } from "@google/generative-ai";

export const journeyExtractionSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    user: {
      type: SchemaType.OBJECT,
      properties: {
        username: { type: SchemaType.STRING },
        preferredLanguage: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
      },
      required: ["username"],
    },
    goals: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          status: {
            type: SchemaType.STRING,
            enum: ["achieved", "abandoned", "ongoing"],
          },
          topics: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.STRING,
              enum: ["Startup", "Professionals", "College Students"],
            },
          },
          subtopics: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.STRING,
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
                "Competition"
              ],
            },
          },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
        },
        required: [
          "id",
          "title",
          "description",
          "status",
          "topics",
          "subtopics",
          "startDate"
        ],
      },
    },
    experiences: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
          context: { type: SchemaType.STRING },
          challengeFaced: { type: SchemaType.STRING },
          outcome: { type: SchemaType.STRING },
          organization: { type: SchemaType.STRING },
          applicationStatus: {
            type: SchemaType.STRING,
            enum: ["accepted", "rejected", "waitlisted", "pending"],
          },
          achievements: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          goalIds: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          skills: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                type: {
                  type: SchemaType.STRING,
                  enum: ["Technical", "Soft", "Domain", "ExtraCurricular"],
                },
              },
              required: ["name", "type"],
            },
          },
          proofs: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                sourceType: {
                  type: SchemaType.STRING,
                  enum: ["image", "pdf", "github", "link"],
                },
                url: { type: SchemaType.STRING },
                status: {
                  type: SchemaType.STRING,
                  enum: ["pending", "verified", "rejected", "skipped"],
                },
                reason: { type: SchemaType.STRING },
              },
              required: ["id", "sourceType", "url", "status"],
            },
          },
          timelineSummary: { type: SchemaType.STRING },
        },
        required: [
          "id",
          "title",
          "startDate",
          "context",
          "goalIds",
          "skills",
          "proofs",
          "timelineSummary"
        ],
      },
    },
    transitions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          fromExperienceId: { type: SchemaType.STRING },
          toExperienceId: { type: SchemaType.STRING },
          decisionLabel: { type: SchemaType.STRING },
        },
        required: ["fromExperienceId", "toExperienceId", "decisionLabel"],
      },
    },
  },
  required: ["user", "goals", "experiences", "transitions"],
};
