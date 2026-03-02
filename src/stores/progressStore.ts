import { create } from "zustand"
import storage from "@/lib/storage/store"
import { processAnswer, createInitialRecord } from "@/lib/srs/algorithm"
import {
  getAllProgress,
  saveProgress,
  getStats as computeStats,
  resetProgress as clearProgress,
} from "@/lib/srs/progress"
import type { ContentCard, Direction, ProgressRecord, Stats } from "@/types"

const STREAK_KEY = "lastSessionDate"

interface ProgressStore {
  progress: Record<string, ProgressRecord>
  stats: Stats
  dayStreak: number
  loadProgress: () => void
  updateProgress: (cardId: string, direction: Direction, correct: boolean) => void
  getRecord: (cardId: string, direction: Direction) => ProgressRecord
  getDueCount: (cards: ContentCard[]) => number
  refreshStats: (cards: ContentCard[]) => void
  markSessionComplete: () => void
  resetProgress: () => void
}

function makeKey(cardId: string, direction: Direction): string {
  return `${cardId}::${direction}`
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0]
}

function calcDayStreak(): number {
  const lastDate = storage.get<string>(STREAK_KEY)
  if (!lastDate) return 0

  const today = todayISO()
  if (lastDate === today) {
    // Already did a session today — check if there's a streak stored
    return storage.get<number>("dayStreakCount") || 1
  }

  // Check if last session was yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayISO = yesterday.toISOString().split("T")[0]

  if (lastDate === yesterdayISO) {
    return storage.get<number>("dayStreakCount") || 1
  }

  // Streak broken
  return 0
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: {},
  stats: { total: 0, byState: { new: 0, learning: 0, review: 0, mastered: 0 }, accuracy: 0, streak: 0 },
  dayStreak: 0,

  loadProgress: () => {
    const progress = getAllProgress()
    const dayStreak = calcDayStreak()
    set({ progress, dayStreak })
  },

  updateProgress: (cardId, direction, correct) => {
    const key = makeKey(cardId, direction)
    const { progress } = get()
    const existing = progress[key] || createInitialRecord(cardId, direction)
    const updated = processAnswer(existing, correct)

    saveProgress(updated)
    set({ progress: { ...progress, [key]: updated } })
  },

  getRecord: (cardId, direction) => {
    const key = makeKey(cardId, direction)
    const { progress } = get()
    return progress[key] || createInitialRecord(cardId, direction)
  },

  getDueCount: (cards) => {
    const { progress } = get()
    const today = todayISO()

    // Count due cards (existing progress with dueDate <= today)
    const dueFromProgress = Object.values(progress).filter(
      (r) => r.state !== "new" && r.dueDate <= today,
    ).length

    // Count new cards (no progress record at all)
    const trackedIds = new Set(Object.values(progress).map((r) => r.cardId))
    const newCards = cards.filter((c) => !trackedIds.has(c.id)).length

    return dueFromProgress + newCards
  },

  refreshStats: (cards) => {
    const stats = computeStats(cards)
    set({ stats })
  },

  markSessionComplete: () => {
    const today = todayISO()
    const prevStreak = calcDayStreak()
    const lastDate = storage.get<string>(STREAK_KEY)

    let newStreak: number
    if (lastDate === today) {
      newStreak = prevStreak // Already counted today
    } else {
      newStreak = prevStreak + 1
    }

    storage.set(STREAK_KEY, today)
    storage.set("dayStreakCount", newStreak)
    set({ dayStreak: newStreak })
  },

  resetProgress: () => {
    clearProgress()
    storage.remove(STREAK_KEY)
    storage.remove("dayStreakCount")
    set({
      progress: {},
      stats: { total: 0, byState: { new: 0, learning: 0, review: 0, mastered: 0 }, accuracy: 0, streak: 0 },
      dayStreak: 0,
    })
  },
}))
