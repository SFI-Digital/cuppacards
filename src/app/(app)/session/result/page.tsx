"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/stores/sessionStore"
import SessionResult from "@/components/session/SessionResult"

export default function ResultPage() {
  const router = useRouter()
  const queue = useSessionStore((s) => s.queue)
  const answers = useSessionStore((s) => s.answers)
  const replayIncorrect = useSessionStore((s) => s.replayIncorrect)
  const reset = useSessionStore((s) => s.reset)

  // Redirect if no session data
  useEffect(() => {
    if (queue.length === 0) {
      router.replace("/")
    }
  }, [queue.length, router])

  const handleBackHome = () => {
    reset()
    router.push("/")
  }

  const handleReplay = () => {
    replayIncorrect()
    router.push("/session")
  }

  if (queue.length === 0) return null

  return (
    <SessionResult
      queue={queue}
      answers={answers}
      onBackHome={handleBackHome}
      onReplayIncorrect={handleReplay}
    />
  )
}
