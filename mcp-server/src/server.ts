import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { QUESTION_IDS, QUESTIONS } from "./questions.js";
import { loadQuestionGuidance } from "./reference.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ycroaster",
    version: "0.1.0",
  });

  server.registerTool(
    "list_questions",
    {
      title: "List YC application questions",
      description:
        "List all YC application questions with current wording, character limits, and question IDs " +
        "usable with get_question_guidance.",
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
    async ({ question_id }) => {
      const markdown = await loadQuestionGuidance(question_id);
      return {
        content: [{ type: "text", text: markdown }],
      };
    },
  );

  return server;
}
