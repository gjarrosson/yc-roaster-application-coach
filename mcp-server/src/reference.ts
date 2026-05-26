import { QUESTIONS, type QuestionId } from "./questions.js";
import {
  COMMON_MISTAKES,
  SUCCESSFUL_PATTERNS,
  QUESTION_GUIDANCE,
} from "./reference-bundle.js";

export function getQuestionGuidance(id: QuestionId): string {
  const text = QUESTION_GUIDANCE[id];
  if (!text) {
    throw new Error(
      `No guidance bundled for question_id=${id} (file: ${QUESTIONS[id]?.guidance_file}). ` +
        `Run npm run build to regenerate the reference bundle.`,
    );
  }
  return text;
}

export function getCommonMistakes(): string {
  return COMMON_MISTAKES;
}

export function getSuccessfulPatterns(): string {
  return SUCCESSFUL_PATTERNS;
}
