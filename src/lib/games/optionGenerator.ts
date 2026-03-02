import type { ContentCard, Direction } from "@/types"

export interface MCOption {
  text: string
  isCorrect: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateOptions(
  card: ContentCard,
  allCards: ContentCard[],
  direction: Direction,
  count: number = 4,
): MCOption[] {
  const correctText =
    direction === "en→zh" ? card.back.text : card.front.text

  // Build distractor pool from same type, excluding the correct card
  const sameCategory = allCards.filter(
    (c) => c.type === card.type && c.id !== card.id && c.category === card.category,
  )
  const otherCategory = allCards.filter(
    (c) => c.type === card.type && c.id !== card.id && c.category !== card.category,
  )

  // Prefer same-category distractors, fall back to other categories
  const pool = [...shuffle(sameCategory), ...shuffle(otherCategory)]

  const distractorTexts = new Set<string>()
  const distractors: MCOption[] = []

  for (const c of pool) {
    if (distractors.length >= count - 1) break

    const text = direction === "en→zh" ? c.back.text : c.front.text

    // Skip duplicates and the correct answer
    if (text === correctText || distractorTexts.has(text)) continue

    distractorTexts.add(text)
    distractors.push({ text, isCorrect: false })
  }

  const options: MCOption[] = [
    { text: correctText, isCorrect: true },
    ...distractors,
  ]

  return shuffle(options)
}
