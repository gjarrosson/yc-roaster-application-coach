export const QUESTION_IDS = [
  "company_description",
  "product_description",
  "team",
  "location",
  "progress",
  "traction",
  "idea_origin",
  "competitors",
  "monetization",
  "equity",
  "curious",
] as const;

export type QuestionId = (typeof QUESTION_IDS)[number];

export interface Question {
  id: QuestionId;
  text: string;
  character_limit: number | null;
  guidance_file: string;
}

export const QUESTIONS: Record<QuestionId, Question> = {
  company_description: {
    id: "company_description",
    text: "Describe what your company does in 50 characters or less.",
    character_limit: 50,
    guidance_file: "company-description.md",
  },
  product_description: {
    id: "product_description",
    text: "What is your company going to make?",
    character_limit: null,
    guidance_file: "product-description.md",
  },
  team: {
    id: "team",
    text: "Who writes code, or does other technical work on your product? Are you looking for a cofounder?",
    character_limit: null,
    guidance_file: "team.md",
  },
  location: {
    id: "location",
    text: "Where do you live now, and where would the company be based after YC?",
    character_limit: null,
    guidance_file: "location.md",
  },
  progress: {
    id: "progress",
    text: "How far along are you?",
    character_limit: null,
    guidance_file: "progress.md",
  },
  traction: {
    id: "traction",
    text: "Are people using your product? Do you have revenue?",
    character_limit: null,
    guidance_file: "traction.md",
  },
  idea_origin: {
    id: "idea_origin",
    text: "Why did you pick this idea to work on? Do you have domain expertise? How do you know people need what you're making?",
    character_limit: null,
    guidance_file: "idea-origin.md",
  },
  competitors: {
    id: "competitors",
    text: "Who are your competitors? What do you understand about your business that they don't?",
    character_limit: null,
    guidance_file: "competitors.md",
  },
  monetization: {
    id: "monetization",
    text: "How do or will you make money? How much could you make?",
    character_limit: null,
    guidance_file: "monetization.md",
  },
  equity: {
    id: "equity",
    text: "Have you formed ANY legal entity yet? Have you taken any investment? Are you currently fundraising?",
    character_limit: null,
    guidance_file: "equity.md",
  },
  curious: {
    id: "curious",
    text: "What convinced you to apply to Y Combinator? How did you hear about Y Combinator?",
    character_limit: null,
    guidance_file: "curious.md",
  },
};
