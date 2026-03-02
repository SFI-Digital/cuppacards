"use client"

import { useRouter } from "next/navigation"
import { useContentStore } from "@/stores/contentStore"
import { useSessionStore } from "@/stores/sessionStore"
import { useProgressStore } from "@/stores/progressStore"
import { useProgress } from "@/hooks/useProgress"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

export default function Home() {
  const router = useRouter()
  const cards = useContentStore((s) => s.cards)
  const packs = useContentStore((s) => s.packs)
  const isLoading = useContentStore((s) => s.isLoading)
  const startSession = useSessionStore((s) => s.startSession)
  const startSentenceChallenge = useSessionStore((s) => s.startSentenceChallenge)
  const progressData = useProgressStore((s) => s.progress)

  const { stats, dayStreak, dueCount } = useProgress()

  const handleStart = () => {
    if (cards.length === 0) return
    startSession(cards, progressData)
    router.push("/session")
  }

  const handleSentenceChallenge = () => {
    if (cards.length === 0) return
    startSentenceChallenge(cards, progressData)
    router.push("/session")
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-zinc-500">Loading content...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-zinc-500">No content found. Check your CSV files.</p>
      </div>
    )
  }

  const phraseCount = cards.filter((c) => c.type === "phrase").length
  const vocabCount = cards.filter((c) => c.type === "vocabulary").length
  const sentenceCount = cards.filter((c) => c.type === "sentence").length

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {getGreeting()}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ready to practise?
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{dueCount}</p>
          <p className="text-xs text-zinc-500">Cards due</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-amber-500">{dayStreak}</p>
          <p className="text-xs text-zinc-500">Day streak</p>
        </Card>
      </div>

      {/* Start session */}
      <div className="space-y-2">
        <Button size="lg" className="w-full" onClick={handleStart}>
          Start Session (20 cards)
        </Button>
        {sentenceCount > 0 && (
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={handleSentenceChallenge}
          >
            Sentence Challenge
          </Button>
        )}
      </div>

      {/* Progress summary */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Progress
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-zinc-400">
              {stats.byState.new}
            </p>
            <p className="text-xs text-zinc-400">New</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-500">
              {stats.byState.learning}
            </p>
            <p className="text-xs text-zinc-400">Learning</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-500">
              {stats.byState.review}
            </p>
            <p className="text-xs text-zinc-400">Review</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-500">
              {stats.byState.mastered}
            </p>
            <p className="text-xs text-zinc-400">Mastered</p>
          </div>
        </div>
        {stats.accuracy > 0 && (
          <p className="mt-3 text-center text-xs text-zinc-400">
            {Math.round(stats.accuracy * 100)}% accuracy overall
          </p>
        )}
      </Card>

      {/* Content packs */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Content
        </h3>
        <div className="space-y-2 text-sm">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="flex items-center justify-between"
            >
              <span className="text-zinc-700 dark:text-zinc-300">
                {pack.name}
              </span>
              <span className="text-xs text-zinc-400">
                {cards.filter((c) => c.pack === pack.id).length} cards
              </span>
            </div>
          ))}
          <div className="mt-2 flex gap-4 border-t border-zinc-100 pt-2 text-xs text-zinc-400 dark:border-zinc-800">
            <span>{phraseCount} phrases</span>
            <span>{vocabCount} vocabulary</span>
            <span>{sentenceCount} sentences</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning!"
  if (hour < 18) return "Good afternoon!"
  return "Good evening!"
}
