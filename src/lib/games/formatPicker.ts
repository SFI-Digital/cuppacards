import type { GameFormat, CardState, ContentCard } from "@/types"

const FORMAT_RULES: Record<string, GameFormat[]> = {
  // Phrases
  "phrase::new": ["flashcard"],
  "phrase::learning": ["multiple-choice", "listening", "true-false"],
  "phrase::review": ["multiple-choice", "listening", "fill-in-blank"],
  "phrase::mastered": ["multiple-choice", "translation", "fill-in-blank"],

  // Understatement
  "understatement::new": ["flashcard"],
  "understatement::learning": ["understatement"],
  "understatement::review": ["understatement"],
  "understatement::mastered": ["understatement"],

  // Vocabulary
  "vocabulary::new": ["flashcard"],
  "vocabulary::learning": ["multiple-choice", "listening", "true-false"],
  "vocabulary::review": ["multiple-choice", "listening", "translation"],
  "vocabulary::mastered": ["multiple-choice", "listening", "translation"],
}

export function pickFormat(
  type: ContentCard["type"],
  state: CardState,
): GameFormat {
  const key = `${type}::${state}`
  const allowed = FORMAT_RULES[key] || ["flashcard"]
  return allowed[Math.floor(Math.random() * allowed.length)]
}
