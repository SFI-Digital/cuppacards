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

export function buildSession(
  allCards: ContentCard[],
  allProgress: Record<string, ProgressRecord>,
): SessionCard[] {
  const today = todayISO()

  // 1. Find due cards
  const dueRecords = Object.values(allProgress).filter(
    (r) => r.state !== "new" && r.dueDate <= today,
  )

  // 2. Split by direction for balance
  const dueEnZh = dueRecords.filter((r) => r.direction === "en→zh")
  const dueZhEn = dueRecords.filter((r) => r.direction === "zh→en")

  // Take roughly equal from each direction
  const halfSize = Math.floor(SESSION_SIZE / 2)
  const selectedDue: ProgressRecord[] = []

  const fromEnZh = shuffle(dueEnZh).slice(0, halfSize)
  const fromZhEn = shuffle(dueZhEn).slice(0, halfSize)
  selectedDue.push(...fromEnZh, ...fromZhEn)

  // If one direction had fewer, fill from the other
  if (selectedDue.length < SESSION_SIZE) {
    const remaining = SESSION_SIZE - selectedDue.length
    const usedKeys = new Set(selectedDue.map((r) => makeKey(r.cardId, r.direction)))

    const leftover = [...dueEnZh, ...dueZhEn].filter(
      (r) => !usedKeys.has(makeKey(r.cardId, r.direction)),
    )
    selectedDue.push(...shuffle(leftover).slice(0, remaining))
  }

  // 3. Build SessionCards from due records
  const cardMap = new Map(allCards.map((c) => [c.id, c]))
  const sessionCards: SessionCard[] = []

  for (const record of selectedDue) {
    const content = cardMap.get(record.cardId)
    if (!content) continue

    sessionCards.push({
      content,
      progress: record,
      gameFormat: pickFormat(content.type, record.state),
      direction: record.direction,
    })
  }

  // 4. Top up with new cards if needed (phrases first, then vocabulary, then sentences)
  if (sessionCards.length < SESSION_SIZE) {
    const usedCardIds = new Set(sessionCards.map((sc) => sc.content.id))
    const typePriority: ContentCard["type"][] = ["phrase", "vocabulary", "sentence"]

    const newCards: ContentCard[] = []
    for (const type of typePriority) {
      const cardsOfType = allCards.filter(
        (c) =>
          c.type === type &&
          !usedCardIds.has(c.id) &&
          !allProgress[makeKey(c.id, "en→zh")] &&
          !allProgress[makeKey(c.id, "zh→en")],
      )
      newCards.push(...cardsOfType)
    }

    const needed = SESSION_SIZE - sessionCards.length
    const toAdd = shuffle(newCards).slice(0, needed)

    // Alternate directions for new cards
    for (let i = 0; i < toAdd.length; i++) {
      const card = toAdd[i]
      const direction: Direction = i % 2 === 0 ? "en→zh" : "zh→en"
      const record = createInitialRecord(card.id, direction)

      sessionCards.push({
        content: card,
        progress: record,
        gameFormat: pickFormat(card.type, "new"),
        direction,
      })
    }
  }

  // 5. Shuffle and cap
  return shuffle(sessionCards).slice(0, SESSION_SIZE)
}

/**
 * Build a review session containing only "learning" state cards.
 */
export function buildReviewSession(
  allCards: ContentCard[],
  allProgress: Record<string, ProgressRecord>,
): SessionCard[] {
  const cardMap = new Map(allCards.map((c) => [c.id, c]))

  const learningRecords = Object.values(allProgress)
    .filter((r) => r.state === "learning")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const sessionCards: SessionCard[] = []

  for (const record of learningRecords) {
    const content = cardMap.get(record.cardId)
    if (!content) continue

    sessionCards.push({
      content,
      progress: record,
      gameFormat: pickFormat(content.type, record.state),
      direction: record.direction,
    })
  }

  return shuffle(sessionCards).slice(0, SESSION_SIZE)
}

/**
 * Build a session containing only sentence cards.
 */
export function buildSentenceChallenge(
  allCards: ContentCard[],
  allProgress: Record<string, ProgressRecord>,
): SessionCard[] {
  const sentenceCards = allCards.filter((c) => c.type === "sentence")
  const cardMap = new Map(sentenceCards.map((c) => [c.id, c]))
  const sessionCards: SessionCard[] = []

  const today = todayISO()
  const dueRecords = Object.values(allProgress).filter((r) => {
    const card = cardMap.get(r.cardId)
    return card && r.state !== "new" && r.dueDate <= today
  })

  for (const record of dueRecords) {
    const content = cardMap.get(record.cardId)
    if (!content) continue
    sessionCards.push({
      content,
      progress: record,
      gameFormat: pickFormat("sentence", record.state),
      direction: record.direction,
    })
  }

  if (sessionCards.length < SESSION_SIZE) {
    const usedIds = new Set(sessionCards.map((sc) => sc.content.id))
    const newSentences = sentenceCards.filter(
      (c) =>
        !usedIds.has(c.id) &&
        !allProgress[makeKey(c.id, "en→zh")] &&
        !allProgress[makeKey(c.id, "zh→en")],
    )

    const needed = SESSION_SIZE - sessionCards.length
    const toAdd = shuffle(newSentences).slice(0, needed)

    for (let i = 0; i < toAdd.length; i++) {
      const card = toAdd[i]
      const direction: Direction = i % 2 === 0 ? "en→zh" : "zh→en"
      sessionCards.push({
        content: card,
        progress: createInitialRecord(card.id, direction),
        gameFormat: pickFormat("sentence", "new"),
        direction,
      })
    }
  }

  return shuffle(sessionCards).slice(0, SESSION_SIZE)
}
