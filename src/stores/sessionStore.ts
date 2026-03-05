import { create } from "zustand"
import { buildSession, buildReviewSession, buildSentencePractice } from "@/lib/srs/scheduler"
import { pickFormat } from "@/lib/games/formatPicker"
import type { ContentCard, ProgressRecord, SessionCard } from "@/types"

export interface AnswerResult {
  cardId: string
  correct: boolean
}

interface SessionStore {
  queue: SessionCard[]
  currentIndex: number
  answers: AnswerResult[]
  isActive: boolean
  startSession: (cards: ContentCard[], progress: Record<string, ProgressRecord>, enabledLevels?: string[]) => void
  startReviewSession: (cards: ContentCard[], progress: Record<string, ProgressRecord>) => void
  startSentencePractice: (cards: ContentCard[]) => void
  answerCurrent: (correct: boolean) => void
  nextCard: () => void
  endSession: () => void
  getCurrentCard: () => SessionCard | null
  replayIncorrect: () => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  answers: [],
  isActive: false,

  startSession: (cards, progress, enabledLevels) => {
    const queue = buildSession(cards, progress, enabledLevels)
    set({
      queue,
      currentIndex: 0,
      answers: [],
      isActive: true,
    })
  },

  startReviewSession: (cards, progress) => {
    const queue = buildReviewSession(cards, progress)
    set({
      queue,
      currentIndex: 0,
      answers: [],
      isActive: true,
    })
  },

  startSentencePractice: (cards) => {
    const queue = buildSentencePractice(cards)
    set({
      queue,
      currentIndex: 0,
      answers: [],
      isActive: true,
    })
  },

  answerCurrent: (correct) => {
    const { queue, currentIndex, answers } = get()
    const card = queue[currentIndex]
    if (!card) return

    set({
      answers: [...answers, { cardId: card.content.id, correct }],
    })
  },

  nextCard: () => {
    const { currentIndex, queue } = get()
    const nextIndex = currentIndex + 1

    if (nextIndex >= queue.length) {
      set({ currentIndex: nextIndex, isActive: false })
    } else {
      set({ currentIndex: nextIndex })
    }
  },

  endSession: () => {
    set({ isActive: false })
  },

  getCurrentCard: () => {
    const { queue, currentIndex } = get()
    return queue[currentIndex] ?? null
  },

  replayIncorrect: () => {
    const { queue, answers } = get()
    const incorrectIds = new Set(
      answers.filter((a) => !a.correct).map((a) => a.cardId),
    )

    const replayQueue: SessionCard[] = queue
      .filter((sc) => incorrectIds.has(sc.content.id))
      .map((sc) => ({
        ...sc,
        gameFormat: pickFormat(sc.content.type, sc.progress.state),
      }))

    if (replayQueue.length === 0) return

    set({
      queue: replayQueue,
      currentIndex: 0,
      answers: [],
      isActive: true,
    })
  },

  reset: () => {
    set({
      queue: [],
      currentIndex: 0,
      answers: [],
      isActive: false,
    })
  },
}))
