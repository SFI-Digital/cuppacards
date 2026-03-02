import type { ContentCard } from "@/types"

export interface ValidationError {
  index: number
  cardId: string
  reason: string
}

export interface ValidationResult {
  valid: ContentCard[]
  errors: ValidationError[]
}

export function validateCards(cards: ContentCard[]): ValidationResult {
  const valid: ContentCard[] = []
  const errors: ValidationError[] = []

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    const reasons: string[] = []

    if (!card.id) reasons.push("missing id")
    if (!card.front.text) reasons.push("missing front text")
    if (!card.back.text) reasons.push("missing back text")
    if (!["phrase", "vocabulary", "sentence"].includes(card.type)) {
      reasons.push(`invalid type: ${card.type}`)
    }

    if (reasons.length > 0) {
      errors.push({
        index: i,
        cardId: card.id || `unknown_${i}`,
        reason: reasons.join("; "),
      })
    } else {
      valid.push(card)
    }
  }

  if (errors.length > 0) {
    console.warn(
      `[validator] ${errors.length} invalid card(s) filtered out`,
      errors,
    )
  }

  return { valid, errors }
}
