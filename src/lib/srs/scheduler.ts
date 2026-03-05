import type { ContentCard, Direction, ProgressRecord, SessionCard } from "@/types"
import { createInitialRecord } from "./algorithm"
import { pickFormat } from "@/lib/games/formatPicker"

const SESSION_SIZE = 20

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0]
}

function makeKey(cardId: string, direction: Direction): string {
  return `${cardId}::${direction}`
}

/**
 * Check if a card passes the difficulty filter.
 * Cards without a difficulty field (brit pack, sentences) always pass.
 */
function matchesDifficulty(
  card: ContentCard,
  enabledLevels: string[],
): boolean {
  if (!card.difficulty) return true
  return enabledLevels.includes(card.difficulty)
}

/**
 * Pick direction based on card state:
 * - new/learning → always en→zh (see English, recall Chinese)
 * - review/mastered → randomly en→zh or zh→en
 */
function pickDirection(state: ProgressRecord["state"]): Direction {
  if (state === "new" || state === "learning") return "en→zh"
  return Math.random() < 0.5 ? "en→zh" : "zh→en"
}

export function buildSession(
  allCards: ContentCard[],
  allProgress: Record<string, ProgressRecord>,
  enabledLevels: string[] = ["intermediate"],
): SessionCard[] {
  const today = todayISO()

  // Only phrases and vocabulary — sentences are separate
  const eligibleCards = allCards.filter((c) => c.type !== "sentence")

  // 1. Find due cards (learning + review only, not mastered)
  const cardMap = new Map(eligibleCards.map((c) => [c.id, c]))
  const dueRecords = Object.values(allProgress).filter((r) => {
    const card = cardMap.get(r.cardId)
    return (
      card &&
      (r.state === "learning" || r.state === "review") &&
      r.dueDate <= today
    )
  })

  // 2. Build SessionCards from due records
  const sessionCards: SessionCard[] = []

  for (const record of shuffle(dueRecords).slice(0, SESSION_SIZE)) {
    const content = cardMap.get(record.cardId)
    if (!content) continue

    // For due cards, use system-controlled direction based on state
    const direction = pickDirection(record.state)

    sessionCards.push({
      content,
      progress: record,
      gameFormat: pickFormat(content.type, record.state),
      direction,
    })
  }

  // 3. Top up with new cards if needed (phrases first, then vocabulary)
  //    Only introduce new cards that match the enabled difficulty levels
  if (sessionCards.length < SESSION_SIZE) {
    const usedCardIds = new Set(sessionCards.map((sc) => sc.content.id))
    const typePriority: ContentCard["type"][] = ["phrase", "vocabulary"]

    const newCards: ContentCard[] = []
    for (const type of typePriority) {
      const cardsOfType = eligibleCards.filter(
        (c) =>
          c.type === type &&
          !usedCardIds.has(c.id) &&
          matchesDifficulty(c, enabledLevels) &&
          !allProgress[makeKey(c.id, "en→zh")] &&
          !allProgress[makeKey(c.id, "zh→en")],
      )
      newCards.push(...cardsOfType)
    }

    const needed = SESSION_SIZE - sessionCards.length
    const toAdd = shuffle(newCards).slice(0, needed)

    // New cards always en→zh
    for (const card of toAdd) {
      const direction: Direction = "en→zh"
      const record = createInitialRecord(card.id, direction)

      sessionCards.push({
        content: card,
        progress: record,
        gameFormat: pickFormat(card.type, "new"),
        direction,
      })
    }
  }

  // 4. Shuffle and cap
  return shuffle(sessionCards).slice(0, SESSION_SIZE)
}

/**
 * Build a review session containing learning, review, and mastered cards.
 * Excludes sentences and new cards.
 */
export function buildReviewSession(
  allCards: ContentCard[],
  allProgress: Record<string, ProgressRecord>,
): SessionCard[] {
  const cardMap = new Map(
    allCards.filter((c) => c.type !== "sentence").map((c) => [c.id, c]),
  )

  const reviewRecords = Object.values(allProgress)
    .filter(
      (r) =>
        (r.state === "learning" || r.state === "review" || r.state === "mastered") &&
        cardMap.has(r.cardId),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const sessionCards: SessionCard[] = []

  for (const record of reviewRecords) {
    const content = cardMap.get(record.cardId)
    if (!content) continue

    sessionCards.push({
      content,
      progress: record,
      gameFormat: pickFormat(content.type, record.state),
      direction: pickDirection(record.state),
    })
  }

  return shuffle(sessionCards).slice(0, SESSION_SIZE)
}

/**
 * Build a sentence practice session (read-aloud, no SRS).
 */
export function buildSentencePractice(
  allCards: ContentCard[],
): SessionCard[] {
  const sentenceCards = allCards.filter((c) => c.type === "sentence")

  const sessionCards: SessionCard[] = shuffle(sentenceCards)
    .slice(0, SESSION_SIZE)
    .map((card) => ({
      content: card,
      progress: createInitialRecord(card.id, "en→zh"),
      gameFormat: "read-aloud" as SessionCard["gameFormat"],
      direction: "en→zh" as Direction,
    }))

  return sessionCards
}
