"use client"

import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import type { SessionCard } from "@/types"

interface AnswerResult {
  cardId: string
  correct: boolean
}

interface SessionResultProps {
  queue: SessionCard[]
  answers: AnswerResult[]
  onBackHome: () => void
  onReplayIncorrect: () => void
}

const TYPE_LABELS: Record<string, string> = {
  phrase: "片語",
  vocabulary: "詞彙",
  sentence: "句子",
}

export default function SessionResult({
  queue,
  answers,
  onBackHome,
  onReplayIncorrect,
}: SessionResultProps) {
  const isSentenceSession = queue.every(
    (sc) => sc.gameFormat === "read-aloud",
  )

  // Sentence sessions: simple completion screen
  if (isSentenceSession) {
    return (
      <div className="space-y-6 py-8">
        <Card className="text-center">
          <p className="text-5xl font-bold text-indigo-600">
            {queue.length}
          </p>
          <p className="mt-1 text-lg text-zinc-400">句</p>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            句子練習完成！
          </p>
        </Card>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onBackHome}
        >
          返回首頁
        </Button>
      </div>
    )
  }

  const correctCount = answers.filter((a) => a.correct).length
  const total = queue.length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const incorrectAnswers = answers.filter((a) => !a.correct)

  // Category breakdown
  const byCategory = new Map<string, { correct: number; total: number }>()
  for (const ans of answers) {
    const card = queue.find((sc) => sc.content.id === ans.cardId)
    if (!card) continue
    const cat = card.content.type
    const entry = byCategory.get(cat) ?? { correct: 0, total: 0 }
    entry.total++
    if (ans.correct) entry.correct++
    byCategory.set(cat, entry)
  }

  return (
    <div className="space-y-6 py-8">
      {/* Score */}
      <Card className="text-center">
        <p className="text-5xl font-bold text-indigo-600">
          {correctCount} / {total}
        </p>
        <p className="mt-1 text-lg text-zinc-400">{percentage}%</p>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          練習完成！
        </p>
        {correctCount === total && (
          <p className="mt-1 text-sm text-emerald-500">滿分！</p>
        )}
      </Card>

      {/* Category breakdown */}
      {byCategory.size > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            分類統計
          </h3>
          <div className="space-y-2">
            {Array.from(byCategory.entries()).map(([cat, data]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {TYPE_LABELS[cat] || cat}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${data.total > 0 ? (data.correct / data.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">
                    {data.correct}/{data.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Incorrect cards */}
      {incorrectAnswers.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            需要複習的卡片
          </h3>
          <div className="space-y-2">
            {incorrectAnswers.map((a) => {
              const card = queue.find((sc) => sc.content.id === a.cardId)
              if (!card) return null
              return (
                <div
                  key={a.cardId}
                  className="flex justify-between border-b border-zinc-100 pb-2 text-sm last:border-0 dark:border-zinc-800"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {card.content.front.text}
                  </span>
                  <span className="text-zinc-400">
                    {card.content.back.text}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {incorrectAnswers.length > 0 && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onReplayIncorrect}
          >
            重練答錯的（{incorrectAnswers.length} 張）
          </Button>
        )}
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onBackHome}
        >
          返回首頁
        </Button>
      </div>
    </div>
  )
}
