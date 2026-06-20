import type { Level } from "./types";

export const LEVELS: Level[] = ["kids", "junior", "adult", "expert"];

export const LEVEL_LABELS: Record<Level, string> = {
  kids: "Kids",
  junior: "Junior",
  adult: "Adult",
  expert: "Expert",
};

export const QUESTIONS_PER_ROUND = 10;

export const LEVEL_PROMPTS: Record<Level, string> = {
  kids:
    "ages roughly 6 to 10. Simple vocabulary, well-known and friendly facts (animals, basic geography, simple science, everyday things), no trick questions.",
  junior:
    "ages roughly 11 to 15, around GCSE level, moderate difficulty.",
  adult: "standard pub-quiz difficulty.",
  expert: "hard and specialist, for genuine enthusiasts.",
};
