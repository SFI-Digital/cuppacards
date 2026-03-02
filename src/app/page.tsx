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
  const startSentencePractice = useSessionStore((s) => s.startSentencePractice)
  const progressData = useProgressStore((s) => s.progress)

  const { stats, dayStreak, dueCount } = useProgress()

  const handleStart = () => {
    if (cards.length === 0) return
    startSession(cards, progressData)
    router.push("/session")
  }

  const handleSentencePractice = () => {
    if (cards.length === 0) return
    startSentencePractice(cards)
    router.push("/session")
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-zinc-500">載入內容中...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-zinc-500">找不到內容，請檢查 CSV 檔案。</p>
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
          準備好練習了嗎？
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{dueCount}</p>
          <p className="text-xs text-zinc-500">待複習卡片</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-amber-500">{dayStreak}</p>
          <p className="text-xs text-zinc-500">連續天數</p>
        </Card>
      </div>

      {/* Start session */}
      <div className="space-y-2">
        <Button size="lg" className="w-full" onClick={handleStart}>
          開始練習（20 張卡片）
        </Button>
        {sentenceCount > 0 && (
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={handleSentencePractice}
          >
            句子練習
          </Button>
        )}
      </div>

      {/* Progress summary */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          學習進度
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-blue-500">
              {stats.byState.learning}
            </p>
            <p className="text-xs text-zinc-400">學習中</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-500">
              {stats.byState.review}
            </p>
            <p className="text-xs text-zinc-400">待複習</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-500">
              {stats.byState.mastered}
            </p>
            <p className="text-xs text-zinc-400">已掌握</p>
          </div>
        </div>
        {stats.accuracy > 0 && (
          <p className="mt-3 text-center text-xs text-zinc-400">
            整體正確率 {Math.round(stats.accuracy * 100)}%
          </p>
        )}
      </Card>

      {/* Content packs */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          內容
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
                {cards.filter((c) => c.pack === pack.id).length} 張卡片
              </span>
            </div>
          ))}
          <div className="mt-2 flex gap-4 border-t border-zinc-100 pt-2 text-xs text-zinc-400 dark:border-zinc-800">
            <span>{phraseCount} 個片語</span>
            <span>{vocabCount} 個詞彙</span>
            <span>{sentenceCount} 個句子</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "早安！"
  if (hour < 18) return "午安！"
  return "晚安！"
}
