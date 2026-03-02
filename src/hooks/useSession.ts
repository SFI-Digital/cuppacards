"use client"

import { useCallback } from "react"
import { useSessionStore } from "@/stores/sessionStore"
import { useProgressStore } from "@/stores/progressStore"
import { useContentStore } from "@/stores/contentStore"

export function useSession() {
  const cards = useContentStore((s) => s.cards)
  const progress = useProgressStore((s) => s.progress)
  const updateProgress = useProgressStore((s) => s.updateProgress)
  const markSessionComplete = useProgressStore((s) => s.markSessionComplete)
  const refreshStats = useProgressStore((s) => s.refreshStats)

  const queue = useSessionStore((s) => s.queue)
  const currentIndex = useSessionStore((s) => s.currentIndex)
  const answers = useSessionStore((s) => s.answers)
  const isActive = useSessionStore((s) => s.isActive)
  const startSessionAction = useSessionStore((s) => s.startSession)
  const answerCurrent = useSessionStore((s) => s.answerCurrent)
  const nextCard = useSessionStore((s) => s.nextCard)
  const endSession = useSessionStore((s) => s.endSession)
  const reset = useSessionStore((s) => s.reset)

  const currentCard = queue[currentIndex] ?? null
  const isComplete = queue.length > 0 && currentIndex >= queue.length
  const correctCount = answers.filter((a) => a.correct).length

  const startSession = useCallback(() => {
    if (cards.length === 0) return
    startSessionAction(cards, progress)
  }, [cards, progress, startSessionAction])

  const answer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return
      answerCurrent(correct)
      updateProgress(currentCard.content.id, currentCard.direction, correct)
    },
    [currentCard, answerCurrent, updateProgress],
  )

  const completeSession = useCallback(() => {
    endSession()
    markSessionComplete()
    refreshStats(cards)
  }, [endSession, markSessionComplete, refreshStats, cards])

  return {
    queue,
    currentIndex,
    currentCard,
    answers,
    isActive,
    isComplete,
    correctCount,
    totalCards: queue.length,
    startSession,
    answer,
    nextCard,
    completeSession,
    reset,
  }
}
