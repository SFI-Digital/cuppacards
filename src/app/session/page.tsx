"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/stores/sessionStore"
import { useProgressStore } from "@/stores/progressStore"
import { useContentStore } from "@/stores/contentStore"
import SessionHeader from "@/components/session/SessionHeader"
import GameRouter from "@/components/session/GameRouter"

export default function SessionPage() {
  const router = useRouter()
  const queue = useSessionStore((s) => s.queue)
  const currentIndex = useSessionStore((s) => s.currentIndex)
  const answerCurrent = useSessionStore((s) => s.answerCurrent)
  const nextCard = useSessionStore((s) => s.nextCard)

  const updateProgress = useProgressStore((s) => s.updateProgress)
  const markSessionComplete = useProgressStore((s) => s.markSessionComplete)
  const refreshStats = useProgressStore((s) => s.refreshStats)
  const cards = useContentStore((s) => s.cards)

  const currentCard = queue[currentIndex] ?? null
  const isComplete = queue.length > 0 && currentIndex >= queue.length

  // Redirect to home if no session
  useEffect(() => {
    if (queue.length === 0) {
      router.replace("/")
    }
  }, [queue.length, router])

  // Navigate to result page when complete
  useEffect(() => {
    if (isComplete) {
      markSessionComplete()
      refreshStats(cards)
      router.push("/session/result")
    }
  }, [isComplete, markSessionComplete, refreshStats, cards, router])

  const handleAnswer = (correct: boolean) => {
    if (!currentCard) return
    answerCurrent(correct)
    // Only update SRS progress for non-read-aloud cards
    if (currentCard.gameFormat !== "read-aloud") {
      updateProgress(currentCard.content.id, currentCard.direction, correct)
    }

    setTimeout(() => {
      nextCard()
    }, currentCard.gameFormat === "flashcard" ? 0 : 200)
  }

  // For read-aloud cards, just advance without scoring
  const handleNext = () => {
    if (!currentCard) return
    answerCurrent(true) // mark as "done" for session tracking
    nextCard()
  }

  if (queue.length === 0 || !currentCard) return null

  return (
    <div className="space-y-4">
      <SessionHeader currentIndex={currentIndex} total={queue.length} />

      <GameRouter
        card={currentCard}
        allCards={cards}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </div>
  )
}
