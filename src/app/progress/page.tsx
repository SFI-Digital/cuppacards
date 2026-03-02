"use client"

import { useContentStore } from "@/stores/contentStore"
import { useProgressStore } from "@/stores/progressStore"
import Card from "@/components/ui/Card"

const STATE_COLORS = {
  new: { bg: "bg-zinc-200 dark:bg-zinc-700", text: "text-zinc-600 dark:text-zinc-300" },
  learning: { bg: "bg-amber-200 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  review: { bg: "bg-blue-200 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  mastered: { bg: "bg-emerald-200 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
} as const

const STATE_LABELS: Record<string, string> = {
  new: "未學習",
  learning: "學習中",
  review: "待複習",
  mastered: "已掌握",
}

const TYPE_LABELS: Record<string, string> = {
  phrase: "片語",
  vocabulary: "詞彙",
  sentence: "句子",
}

export default function ProgressPage() {
  const cards = useContentStore((s) => s.cards)
  const stats = useProgressStore((s) => s.stats)
  const dayStreak = useProgressStore((s) => s.dayStreak)
  const progress = useProgressStore((s) => s.progress)

  // Exclude sentences from stats — they use read-aloud, not SRS
  const srsCardIds = new Set(
    cards.filter((c) => c.type !== "sentence").map((c) => c.id),
  )
  const records = Object.values(progress).filter((r) =>
    srsCardIds.has(r.cardId),
  )
  const totalReviews = records.reduce((sum, r) => sum + r.totalReviews, 0)
  const correctReviews = records.reduce((sum, r) => sum + r.correctReviews, 0)

  // Per-category accuracy
  const cardMap = new Map(cards.map((c) => [c.id, c]))
  const byCategory = new Map<string, { total: number; correct: number }>()

  for (const r of records) {
    const card = cardMap.get(r.cardId)
    if (!card || r.totalReviews === 0) continue
    const cat = card.type
    const entry = byCategory.get(cat) ?? { total: 0, correct: 0 }
    entry.total += r.totalReviews
    entry.correct += r.correctReviews
    byCategory.set(cat, entry)
  }

  // Mastery bar data — percentage of cards in each state
  const total = stats?.total || 1
  const stateEntries = stats
    ? ([
        { state: "mastered" as const, count: stats.byState.mastered },
        { state: "review" as const, count: stats.byState.review },
        { state: "learning" as const, count: stats.byState.learning },
      ])
    : []

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          學習進度
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          你的學習統計資料
        </p>
      </div>

      {/* Streak */}
      <Card className="text-center">
        <p className="text-4xl font-bold text-indigo-600">{dayStreak}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          連續天數
        </p>
      </Card>

      {/* Cards by state */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          卡片狀態
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {stateEntries.map(({ state, count }) => (
            <div
              key={state}
              className={`rounded-lg px-3 py-2 ${STATE_COLORS[state].bg}`}
            >
              <p className={`text-2xl font-bold ${STATE_COLORS[state].text}`}>
                {count}
              </p>
              <p className={`text-xs ${STATE_COLORS[state].text}`}>
                {STATE_LABELS[state]}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Mastery bar */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          掌握程度
        </h3>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          {stateEntries
            .filter((e) => e.count > 0)
            .map(({ state, count }) => {
              const pct = (count / total) * 100
              const barColors = {
                mastered: "bg-emerald-500",
                review: "bg-blue-500",
                learning: "bg-amber-500",
                new: "bg-zinc-400 dark:bg-zinc-500",
              }
              return (
                <div
                  key={state}
                  className={`${barColors[state]} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${STATE_LABELS[state]}: ${count} (${Math.round(pct)}%)`}
                />
              )
            })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            已掌握
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            待複習
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            學習中
          </span>
        </div>
      </Card>

      {/* Overall accuracy */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          正確率
        </h3>

        <div className="mb-4 text-center">
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0}%
          </p>
          <p className="text-xs text-zinc-400">
            {correctReviews} / {totalReviews} 次答對
          </p>
        </div>

        {/* Per-category accuracy */}
        {byCategory.size > 0 && (
          <div className="space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            {Array.from(byCategory.entries()).map(([cat, data]) => {
              const pct = Math.round((data.correct / data.total) * 100)
              return (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {TYPE_LABELS[cat] || cat}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-zinc-500">
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
