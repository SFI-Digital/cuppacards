"use client"

import { useRouter } from "next/navigation"
import { useContentStore } from "@/stores/contentStore"
import { useProgressStore } from "@/stores/progressStore"
import { useSessionStore } from "@/stores/sessionStore"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

export default function ReviewPage() {
  const router = useRouter()
  const cards = useContentStore((s) => s.cards)
  const progress = useProgressStore((s) => s.progress)
  const startReviewSession = useSessionStore((s) => s.startReviewSession)

  const srsCardIds = new Set(
    cards.filter((c) => c.type !== "sentence").map((c) => c.id),
  )
  const reviewCount = Object.values(progress).filter(
    (r) =>
      (r.state === "learning" || r.state === "review" || r.state === "mastered") &&
      srsCardIds.has(r.cardId),
  ).length

  const handleStart = () => {
    startReviewSession(cards, progress)
    router.push("/session")
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          複習
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          複習已學過的卡片
        </p>
      </div>

      {reviewCount === 0 ? (
        <Card className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            目前還沒有可複習的卡片。
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            開始練習來學習新卡片吧！
          </p>
        </Card>
      ) : (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStart}
        >
          開始複習（{reviewCount} 張卡片）
        </Button>
      )}
    </div>
  )
}
