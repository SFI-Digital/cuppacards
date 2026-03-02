import type { ContentCard } from "@/types"

export interface VocabMatch {
  word: string
  card: ContentCard
}

/**
 * Tokenise a phrase/sentence and find matching vocabulary cards.
 * Returns vocabulary cards whose front.text appears as a word in the given text.
 */
export function lookupVocab(
  text: string,
  vocabCards: ContentCard[],
): VocabMatch[] {
  // Tokenise the input text into lowercase words
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
    .filter((w) => w.length > 0)

  const wordSet = new Set(words)
  const matches: VocabMatch[] = []
  const seen = new Set<string>()

  for (const card of vocabCards) {
    if (card.type !== "vocabulary") continue

    const vocabWord = card.front.text.toLowerCase().trim()
    if (wordSet.has(vocabWord) && !seen.has(vocabWord)) {
      seen.add(vocabWord)
      matches.push({ word: vocabWord, card })
    }
  }

  return matches
}
