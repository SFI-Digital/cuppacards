import type { GameFormat, CardState, ContentCard } from "@/types"

const FORMAT_RULES: Record<string, GameFormat[]> = {
  // Phrases
  "phrase::new": ["flashcard"],
  "phrase::learning": ["flashcard", "multiple-choice", "listening"],
  "phrase::review": ["flashcard", "multiple-choice", "listening", "fill-in-blank", "translation"],
  "phrase::mastered": ["multiple-choice", "translation", "fill-in-blank"],

  // Vocabulary
  "vocabulary::new": ["flashcard"],
  "vocabulary::learning": ["flashcard", "multiple-choice"],
  "vocabulary::review": ["flashcard", "multiple-choice", "translation"],
  "vocabulary::mastered": ["multiple-choice", "translation"],
}

export function pickFormat(
  type: ContentCard["type"],
  state: CardState,
): GameFormat {
  const key = `${type}::${state}`
  const allowed = FORMAT_RULES[key] || ["flashcard"]
  return allowed[Math.floor(Math.random() * allowed.length)]
}
