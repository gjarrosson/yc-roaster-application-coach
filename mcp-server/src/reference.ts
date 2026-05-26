import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { QUESTIONS, type QuestionId } from "./questions.js";

const here = dirname(fileURLToPath(import.meta.url));

// Resolves the reference/ directory in two layouts:
//   - in-repo dev:  mcp-server/dist/ → ../../reference
//   - npm-bundled:  <pkg>/dist/      → ../reference (when published with a copy step)
async function referenceRoot(): Promise<string> {
  const candidates = [
    resolve(here, "..", "reference"),
    resolve(here, "..", "..", "reference"),
  ];
  for (const path of candidates) {
    try {
      await access(path);
      return path;
    } catch {
      // try next
    }
  }
  throw new Error(
    `reference/ directory not found. Tried: ${candidates.join(", ")}`,
  );
}

export async function loadQuestionGuidance(id: QuestionId): Promise<string> {
  const root = await referenceRoot();
  const path = resolve(root, "question-guidance", QUESTIONS[id].guidance_file);
  return readFile(path, "utf8");
}
