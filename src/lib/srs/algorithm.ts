import type { ProgressRecord, CardState, Direction } from "@/types"

function todayISO(): string {
  return new Date().toISOString().split("T")[0]
}

function addDays(dateISO: string, days: number): string {
  const date = new Date(dateISO)
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

export function createInitialRecord(
  cardId: string,
  direction: Direction,
): ProgressRecord {
  return {
    cardId,
    direction,
    state: "new",
    interval: 0,
    easeFactor: 2.5,
    dueDate: todayISO(),
    totalReviews: 0,
    correctReviews: 0,
    lastReviewed: "",
    streak: 0,
  }
}

export function processAnswer(
  record: ProgressRecord,
  correct: boolean,
): ProgressRecord {
  const today = todayISO()

  if (correct) {
    return processCorrect(record, today)
  }
  return processWrong(record, today)
}

function processCorrect(
  record: ProgressRecord,
  today: string,
): ProgressRecord {
  let nextState: CardState
  let nextInterval: number

  switch (record.state) {
    case "new":
      nextState = "learning"
      nextInterval = 1
      break
    case "learning":
      nextState = "review"
      nextInterval = 3
      break
    case "review":
    case "mastered":
      nextState = "mastered"
      nextInterval = Math.round(record.interval * record.easeFactor)
      break
    default:
      nextState = "learning"
      nextInterval = 1
  }

  return {
    ...record,
    state: nextState,
    interval: nextInterval,
    easeFactor: Math.min(record.easeFactor + 0.1, 4.0),
    dueDate: addDays(today, nextInterval),
    totalReviews: record.totalReviews + 1,
    correctReviews: record.correctReviews + 1,
    lastReviewed: today,
    streak: record.streak + 1,
  }
}

function processWrong(
  record: ProgressRecord,
  today: string,
): ProgressRecord {
  return {
    ...record,
    state: "learning",
    interval: 1,
    easeFactor: Math.max(record.easeFactor - 0.2, 1.3),
    dueDate: addDays(today, 1),
    totalReviews: record.totalReviews + 1,
    lastReviewed: today,
    streak: 0,
  }
}
