import type { ContentCard } from "@/types"

export interface BlankResult {
  /** The sentence with the blanked word replaced by "___" */
  display: string
  /** The correct answer (the blanked word) */
  answer: string
}

/**
 * Pick a "key word" from the English text and blank it out.
 * For phrases/sentences we pick the longest non-trivial word.
 * For vocabulary we blank the single word itself.
 */
export function generateBlank(card: ContentCard): BlankResult {
  const text = card.front.text

  if (card.type === "vocabulary") {
    // Single-word card — blank the whole thing
    return { display: "___", answer: text.trim() }
  }

  const words = text.split(/\s+/)

  // Skip very short words (articles, prepositions, pronouns)
  const SKIP = new Set([
    "a", "an", "the", "i", "is", "am", "are", "was", "were",
    "be", "to", "of", "in", "on", "at", "it", "my", "me",
    "he", "she", "we", "us", "or", "so", "if", "do", "no",
    "up", "by", "as", "and", "but", "not", "for", "you",
    "his", "her", "its", "our", "has", "had", "can",
  ])

  // Find the longest non-trivial word
  let best = ""
  let bestIndex = -1

  for (let i = 0; i < words.length; i++) {
    const clean = words[i].replace(/[^a-zA-Z'-]/g, "").toLowerCase()
    if (clean.length > best.length && !SKIP.has(clean)) {
      best = clean
      bestIndex = i
    }
  }

  // Fallback: if no suitable word found, blank the last word
  if (bestIndex === -1) {
    bestIndex = words.length - 1
    best = words[bestIndex].replace(/[^a-zA-Z'-]/g, "")
  }

  // Preserve punctuation attached to the blanked word
  const original = words[bestIndex]
  const blanked = original.replace(/[a-zA-Z'-]+/, "___")

  const display = [...words.slice(0, bestIndex), blanked, ...words.slice(bestIndex + 1)].join(" ")

  return { display, answer: best }
}
