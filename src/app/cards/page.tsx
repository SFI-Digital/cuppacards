"use client"

import { useState, useMemo } from "react"
import Card from "@/components/ui/Card"
import { useContentStore } from "@/stores/contentStore"
import { useProgressStore } from "@/stores/progressStore"
import type { CardState, ProgressRecord } from "@/types"

type FilterTab = "all" | "learning" | "review" | "mastered"

const STATE_PRIORITY: Record<CardState, number> = {
  mastered: 3,
  review: 2,
  learning: 1,
  new: 0,
}

function getBetterState(
  a: ProgressRecord | undefined,
  b: ProgressRecord | undefined,
): ProgressRecord | undefined {
  if (!a && !b) return undefined
  if (!a) return b
  if (!b) return a
  const pa = STATE_PRIORITY[a.state]
  const pb = STATE_PRIORITY[b.state]
  if (pa > pb) return a
  if (pb > pa) return b
  // tied — prefer en→zh
  return a.direction === "en→zh" ? a : b
}

function formatDueDate(dueDate: string): string {
  const today = new Date().toISOString().split("T")[0]
  if (dueDate <= today) return "今天"
  const d = new Date(dueDate)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}年${m}月${day}日`
}

const STATE_LABEL: Record<CardState, string> = {
  new: "新卡片",
  learning: "學習中",
  review: "待複習",
  mastered: "已掌握",
}

const STATE_BADGE_CLASS: Record<CardState, string> = {
  new: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  learning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  review: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  mastered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
}

export default function CardsPage() {
  const cards = useContentStore((s) => s.cards)
  const progress = useProgressStore((s) => s.progress)

  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Build resolved card list: non-sentence SRS cards that have at least one progress record
  const resolvedCards = useMemo(() => {
    const srsCards = cards.filter((c) => c.type !== "sentence")

    return srsCards
      .map((card) => {
        const enRec = progress[`${card.id}::en→zh`]
        const zhRec = progress[`${card.id}::zh→en`]
        const best = getBetterState(enRec, zhRec)
        if (!best || best.state === "new") return null
        return { card, record: best }
      })
      .filter((x): x is { card: (typeof srsCards)[number]; record: ProgressRecord } => x !== null)
  }, [cards, progress])

  // Counts per filter tab
  const counts = useMemo(() => {
    const result = { all: 0, learning: 0, review: 0, mastered: 0 }
    for (const { record } of resolvedCards) {
      result.all++
      if (record.state === "learning") result.learning++
      else if (record.state === "review") result.review++
      else if (record.state === "mastered") result.mastered++
    }
    return result
  }, [resolvedCards])

  // Filter + search + sort
  const displayCards = useMemo(() => {
    let filtered = resolvedCards

    if (activeFilter !== "all") {
      filtered = filtered.filter(({ record }) => record.state === activeFilter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        ({ card }) =>
          card.front.text.toLowerCase().includes(q) ||
          card.back.text.toLowerCase().includes(q),
      )
    }

    // Sort: mastered first → review → learning, then alphabetical within group
    return [...filtered].sort((a, b) => {
      const pa = STATE_PRIORITY[a.record.state]
      const pb = STATE_PRIORITY[b.record.state]
      if (pb !== pa) return pb - pa
      return a.card.front.text.localeCompare(b.card.front.text)
    })
  }, [resolvedCards, activeFilter, search])

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "learning", label: "學習中" },
    { key: "review", label: "待複習" },
    { key: "mastered", label: "已掌握" },
  ]

  return (
    <div className="space-y-4 py-4">
      {/* Page header */}
      <div className="px-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">我的卡片</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">學習中 · 待複習 · 已掌握</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === key
                ? "bg-indigo-600 text-white dark:bg-indigo-500"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋單字或片語…"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50"
        />
      </div>

      {/* Card list */}
      <div className="flex flex-col gap-2 px-4">
        {displayCards.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400 dark:text-zinc-500">
            找不到符合的卡片
          </div>
        ) : (
          displayCards.map(({ card, record }) => {
            const isExpanded = expandedId === card.id
            const accuracy =
              record.totalReviews > 0
                ? Math.round((record.correctReviews / record.totalReviews) * 100)
                : 0

            return (
              <Card
                key={card.id}
                className="p-4"
                onClick={() => setExpandedId(isExpanded ? null : card.id)}
              >
                {/* Card row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {card.front.text}
                      </span>
                      {card.supplement.partOfSpeech && (
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {card.supplement.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {card.back.text}
                    </p>
                    <p className="mt-1 text-xs text-indigo-400 dark:text-indigo-500">
                      {card.category}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATE_BADGE_CLASS[record.state]}`}
                  >
                    {STATE_LABEL[record.state]}
                  </span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    {/* Stats row */}
                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500">正確率 </span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {accuracy}%
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500">下次複習 </span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {formatDueDate(record.dueDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500">間隔 </span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {record.interval} 天
                        </span>
                      </div>
                    </div>

                    {/* Definition */}
                    {card.supplement.definition && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {card.supplement.definition}
                      </p>
                    )}

                    {/* Understatement actual meaning */}
                    {card.type === "understatement" && card.supplement.meant && (
                      <div className="rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950/30">
                        <span className="text-xs font-medium text-rose-500 dark:text-rose-400">
                          實際意思{" "}
                        </span>
                        <span className="text-sm text-rose-700 dark:text-rose-300">
                          {card.supplement.meant}
                          {card.supplement.meantZh && (
                            <span className="ml-1 text-rose-500 dark:text-rose-400">
                              ({card.supplement.meantZh})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Example */}
                    {card.supplement.example && (
                      <div>
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                          例句{" "}
                        </span>
                        <span className="text-sm italic text-zinc-600 dark:text-zinc-400">
                          {card.supplement.example}
                        </span>
                      </div>
                    )}

                    {/* Note */}
                    {card.supplement.note && (
                      <div>
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                          備註{" "}
                        </span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {card.supplement.note}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Bottom nav spacer */}
      <div className="h-16" />
    </div>
  )
}
