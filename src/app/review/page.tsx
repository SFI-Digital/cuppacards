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

  // Find all learning-state cards sorted by due date
  const learningRecords = Object.values(progress)
    .filter((r) => r.state === "learning")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const cardMap = new Map(cards.map((c) => [c.id, c]))

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
          目前正在學習的卡片
        </p>
      </div>

      {learningRecords.length === 0 ? (
        <Card className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            目前還沒有學習中的卡片。
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            開始練習來學習新卡片吧！
          </p>
        </Card>
      ) : (
        <>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleStart}
          >
            開始複習（{learningRecords.length} 張卡片）
          </Button>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              學習中的卡片
            </h3>
            <div className="space-y-2">
              {learningRecords.map((record) => {
                const card = cardMap.get(record.cardId)
                if (!card) return null
                return (
                  <div
                    key={`${record.cardId}::${record.direction}`}
                    className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                        {card.front.text}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        {card.back.text}
                      </p>
                    </div>
                    <div className="ml-3 text-right">
                      <span className="text-xs text-zinc-400">
                        {record.direction === "en→zh" ? "英→中" : "中→英"}
                      </span>
                      <p className="text-xs text-zinc-400">
                        到期：{record.dueDate}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
