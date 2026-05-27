import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { QUESTION_IDS, QUESTIONS } from "./questions.js";
import { getQuestionGuidance } from "./reference.js";
import {
  buildRoastApplicationBrief,
  buildRoastSectionBrief,
  InputTooLargeError,
} from "./roast.js";

export const SERVER_VERSION = "0.3.0";

const ROAST_FOCUS_VALUES = [
  "all",
  "evidence",
  "voice",
  "specificity",
  "competitors",
  "traction",
] as const;

export function registerTools(server: McpServer): void {
  server.registerTool(
    "list_questions",
    {
      title: "List YC application questions",
      description:
        "List all YC application questions with current wording, character limits, and question IDs " +
        "usable with get_question_guidance and roast_section.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(Object.values(QUESTIONS), null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "get_question_guidance",
    {
      title: "Get coaching guidance for one YC question",
      description:
        "Get YC's evaluation criteria, strong-answer patterns, common failure modes, and probing " +
        "questions for one application question. Use list_questions first to discover valid IDs.",
      inputSchema: {
        question_id: z
          .enum(QUESTION_IDS)
          .describe("Canonical question ID from list_questions."),
      },
    },
    async ({ question_id }) => ({
      content: [{ type: "text", text: getQuestionGuidance(question_id) }],
    }),
  );

  server.registerTool(
    "roast_application",
    {
      title: "Roast a full YC application draft",
      description:
        "Roast a complete YC application draft. Returns a structured critique brief — rubrics, the " +
        "draft, and an instruction to the calling LLM to produce section-by-section pushback. The " +
        "calling agent should pass the returned text to its LLM as the next turn. Hard cap 50KB, " +
        "soft warning over 20KB.",
      inputSchema: {
        application_text: z
          .string()
          .min(1)
          .describe("Full application draft, ideally with question headers."),
        batch: z
          .string()
          .optional()
          .describe("Target YC batch, e.g. 'W27'. Optional."),
        focus: z
          .enum(ROAST_FOCUS_VALUES)
          .optional()
          .describe(
            "Narrow the critique to one dimension: evidence, voice, specificity, competitors, or traction. Defaults to 'all'.",
          ),
      },
    },
    async ({ application_text, batch, focus }) => {
      try {
        const text = buildRoastApplicationBrief({
          application_text,
          batch,
          focus,
        });
        return { content: [{ type: "text", text }] };
      } catch (err) {
        if (err instanceof InputTooLargeError) {
          return {
            isError: true,
            content: [{ type: "text", text: err.message }],
          };
        }
        throw err;
      }
    },
  );

  server.registerTool(
    "roast_section",
    {
      title: "Roast one YC application question",
      description:
        "Roast a founder's answer to one YC application question. Sharper than roast_application " +
        "for working a single section. Returns a critique brief the calling agent's LLM should " +
        "process. Hard cap 50KB.",
      inputSchema: {
        question_id: z
          .enum(QUESTION_IDS)
          .describe("Canonical question ID from list_questions."),
        answer: z
          .string()
          .min(1)
          .describe("Founder's current draft answer for this question."),
      },
    },
    async ({ question_id, answer }) => {
      try {
        const text = buildRoastSectionBrief({ question_id, answer });
        return { content: [{ type: "text", text }] };
      } catch (err) {
        if (err instanceof InputTooLargeError) {
          return {
            isError: true,
            content: [{ type: "text", text: err.message }],
          };
        }
        throw err;
      }
    },
  );
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ycroaster",
    version: SERVER_VERSION,
  });
  registerTools(server);
  return server;
}
