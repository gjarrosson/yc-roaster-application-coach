import { QUESTIONS, type QuestionId } from "./questions.js";
import {
  getQuestionGuidance,
  getCommonMistakes,
  getSuccessfulPatterns,
} from "./reference.js";

export const HARD_CAP_BYTES = 50 * 1024;
export const SOFT_CAP_BYTES = 20 * 1024;

export type RoastFocus =
  | "all"
  | "evidence"
  | "voice"
  | "specificity"
  | "competitors"
  | "traction";

export interface RoastApplicationInput {
  application_text: string;
  batch?: string;
  focus?: RoastFocus;
}

export interface RoastSectionInput {
  question_id: QuestionId;
  answer: string;
}

const OUTPUT_FORMAT = `## Required output format

For each section of the application, return:
- ✗ TOP WEAKNESS — one specific line of pushback. Quote the exact phrase you're objecting to.
- ⚠ Secondary issues — 1–3 bullets, each naming a specific phrase or claim.
- ✓ What works — 1 bullet if anything does; skip if nothing does.
- → Probe — one question that, if the founder answered it well, would sharpen this section.

End with one short paragraph titled "Overall narrative gap" naming the single thing this application fails to convince a YC partner of.

Do not rewrite the application. Do not soften your critique. Quote real phrases from the draft, don't paraphrase them.`;

const FOCUS_INSTRUCTIONS: Record<RoastFocus, string> = {
  all: "Apply the full rubric across all dimensions.",
  evidence:
    "Focus the critique on claims unsupported by evidence: 'we believe', 'users love', vague TAM, etc. Flag every assertion that lacks a checkable source.",
  voice:
    "Focus the critique on AI-generated texture and founder voice. Flag every sentence that reads polished-but-generic, every startup cliché, every line a founder wouldn't say out loud.",
  specificity:
    "Focus the critique on vagueness. Flag every hedging word, every generic noun where a specific one was possible, every claim that could describe ten other companies.",
  competitors:
    "Focus the critique on competitive positioning. Demand a stated insight advantage; flag missing or hand-waved competitor analysis.",
  traction:
    "Focus the critique on traction claims. Demand absolute numbers, time periods, and growth rates. Flag selective metrics and anecdote-as-pattern.",
};

export class InputTooLargeError extends Error {
  constructor(public readonly bytes: number) {
    super(
      `Application text is ${bytes} bytes; hard cap is ${HARD_CAP_BYTES} bytes (~50KB). ` +
        `YC applications are typically 8–16KB. Trim the draft and try again.`,
    );
    this.name = "InputTooLargeError";
  }
}

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function sizeWarning(bytes: number): string | null {
  if (bytes <= SOFT_CAP_BYTES) return null;
  return `> ⚠ Heads-up: this draft is ${bytes} bytes (~${Math.round(
    bytes / 1024,
  )}KB). YC partners spend about three minutes per application. Tighten before submitting.`;
}

export function buildRoastApplicationBrief(input: RoastApplicationInput): string {
  const bytes = byteLength(input.application_text);
  if (bytes > HARD_CAP_BYTES) throw new InputTooLargeError(bytes);

  const warning = sizeWarning(bytes);
  const focus = input.focus ?? "all";
  const batchLine = input.batch ? `\nTarget batch: ${input.batch}` : "";

  const sections: string[] = [];
  if (warning) sections.push(warning);
  sections.push(`# Roast brief — YC application

You are a YC alum who has read thousands of applications and is roasting this one for the founder. Your job is to expose every weak claim, every vague phrase, every place a YC partner will lose interest. The founder asked for honesty, not encouragement.

${FOCUS_INSTRUCTIONS[focus]}${batchLine}

---

## Rubric — common mistakes that get applications rejected

${getCommonMistakes()}

---

## Rubric — what strong answers look like

${getSuccessfulPatterns()}

---

## The application to roast

\`\`\`
${input.application_text}
\`\`\`

---

${OUTPUT_FORMAT}`);

  return sections.join("\n\n");
}

export function buildRoastSectionBrief(input: RoastSectionInput): string {
  const bytes = byteLength(input.answer);
  if (bytes > HARD_CAP_BYTES) throw new InputTooLargeError(bytes);

  const question = QUESTIONS[input.question_id];
  const guidance = getQuestionGuidance(input.question_id);
  const warning = sizeWarning(bytes);

  const sections: string[] = [];
  if (warning) sections.push(warning);
  sections.push(`# Roast brief — single YC application question

You are a YC alum roasting one section of a founder's draft. Use the per-question guidance below as your rubric. The founder asked for honesty.

## The question

> ${question.text}${
    question.character_limit
      ? ` (max ${question.character_limit} characters)`
      : ""
  }

## The founder's draft answer

\`\`\`
${input.answer}
\`\`\`

---

## Rubric — what YC is evaluating for this question

${guidance}

---

${OUTPUT_FORMAT}`);

  return sections.join("\n\n");
}
