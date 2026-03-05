"use client"

import { useState, useMemo } from "react"
import Card from "@/components/ui/Card"
import AudioButton from "@/components/ui/AudioButton"
import type { ContentCard, SessionCard } from "@/types"

interface TrueFalseProps {
  card: SessionCard
  allCards: ContentCard[]
  onAnswer: (correct: boolean) => void
}

function pickDistractor(
  card: ContentCard,
  allCards: ContentCard[],
): string {
  const sameCategory = allCards.filter(
    (c) => c.type === card.type && c.id !== card.id && c.category === card.category,
  )
  const otherCategory = allCards.filter(
    (c) => c.type === card.type && c.id !== card.id && c.category !== card.category,
  )

  const pool = [...sameCategory, ...otherCategory]
  if (pool.length === 0) return card.back.text

  const pick = pool[Math.floor(Math.random() * pool.length)]
  return pick.back.text
}

export default function TrueFalse({
  card,
  allCards,
  onAnswer,
}: TrueFalseProps) {
  const [answered, setAnswered] = useState<boolean | null>(null)

  const { shownChinese, isPairCorrect } = useMemo(() => {
    const showCorrect = Math.random() < 0.5
    if (showCorrect) {
      return { shownChinese: card.content.back.text, isPairCorrect: true }
    }
    let distractor = pickDistractor(card.content, allCards)
    // Avoid showing the correct answer as a "wrong" pairing
    if (distractor === card.content.back.text) {
      return { shownChinese: card.content.back.text, isPairCorrect: true }
    }
    return { shownChinese: distractor, isPairCorrect: false }
  }, [card, allCards])

  const handleAnswer = (userSaysCorrect: boolean) => {
    if (answered !== null) return
    const isCorrect = userSaysCorrect === isPairCorrect
    setAnswered(isCorrect)
    setTimeout(() => onAnswer(isCorrect), 800)
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-1 text-xs font-medium text-indigo-500">
          {card.content.category}
        </p>
        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {card.content.front.text}
        </p>
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="text-center text-lg text-zinc-700 dark:text-zinc-300">
            {shownChinese}
          </p>
        </div>
      </Card>

      {answered !== null && (
        <div
          className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${
            answered
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
          }`}
        >
          {answered ? "答對了！" : `正確答案：${card.content.back.text}`}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered !== null}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
            answered !== null
              ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              : "bg-white text-red-600 shadow-sm hover:bg-red-50 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-zinc-800"
          }`}
        >
          ✗ 錯誤
        </button>
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered !== null}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
            answered !== null
              ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
              : "bg-white text-emerald-600 shadow-sm hover:bg-emerald-50 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:bg-zinc-800"
          }`}
        >
          ✓ 正確
        </button>
      </div>

      <AudioButton text={card.content.front.text} />
    </div>
  )
}
