import type { ContentCard, Direction, ProgressRecord, Stats } from "@/types"
import storage from "@/lib/storage/store"

const STORAGE_KEY = "progress"

function makeKey(cardId: string, direction: Direction): string {
  return `${cardId}::${direction}`
}

export function getAllProgress(): Record<string, ProgressRecord> {
  return storage.get<Record<string, ProgressRecord>>(STORAGE_KEY) || {}
}

export function getProgress(
  cardId: string,
  direction: Direction,
): ProgressRecord | null {
  const all = getAllProgress()
  return all[makeKey(cardId, direction)] || null
}

export function saveProgress(record: ProgressRecord): void {
  const all = getAllProgress()
  all[makeKey(record.cardId, record.direction)] = record
  storage.set(STORAGE_KEY, all)
}

export function getDueCards(): ProgressRecord[] {
  const all = getAllProgress()
  const today = new Date().toISOString().split("T")[0]

  return Object.values(all).filter(
    (r) => r.state !== "new" && r.dueDate <= today,
  )
}

export function getNewCardIds(
  allCards: ContentCard[],
): ContentCard[] {
  const all = getAllProgress()

  return allCards.filter((card) => {
    const enKey = makeKey(card.id, "en→zh")
    const zhKey = makeKey(card.id, "zh→en")
    return !all[enKey] && !all[zhKey]
  })
}

export function getStats(allCards: ContentCard[]): Stats {
  // Exclude sentences from stats — they use read-aloud, not SRS
  const srsCards = allCards.filter((c) => c.type !== "sentence")
  const srsCardIds = new Set(srsCards.map((c) => c.id))

  const all = getAllProgress()
  const records = Object.values(all).filter((r) => srsCardIds.has(r.cardId))

  const byState = {
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
  }

  let totalReviews = 0
  let correctReviews = 0
  let maxStreak = 0

  for (const r of records) {
    byState[r.state]++
    totalReviews += r.totalReviews
    correctReviews += r.correctReviews
    if (r.streak > maxStreak) maxStreak = r.streak
  }

  // Count cards with no progress as "new"
  const trackedCardIds = new Set(records.map((r) => r.cardId))
  const untrackedNew = srsCards.filter((c) => !trackedCardIds.has(c.id)).length
  byState.new += untrackedNew

  return {
    total: srsCards.length,
    byState,
    accuracy: totalReviews > 0 ? correctReviews / totalReviews : 0,
    streak: maxStreak,
  }
}

export function resetProgress(): void {
  storage.remove(STORAGE_KEY)
}
