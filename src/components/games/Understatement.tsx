"use client"

import { useState, useMemo } from "react"
import Card from "@/components/ui/Card"
import AudioButton from "@/components/ui/AudioButton"
import type { ContentCard, SessionCard } from "@/types"
import type { MCOption } from "@/lib/games/optionGenerator"

interface UnderstatementProps {
  card: SessionCard
  allCards: ContentCard[]
  onAnswer: (correct: boolean) => void
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildOptions(
  card: ContentCard,
  allCards: ContentCard[],
): MCOption[] {
  const correctText = card.supplement.meantZh || ""

  // Build distractor pool from other understatement cards
  const sameCategory = allCards.filter(
    (c) =>
      c.type === "understatement" &&
      c.id !== card.id &&
      c.category === card.category &&
      c.supplement.meantZh &&
      c.supplement.meantZh !== correctText,
  )
  const otherCategory = allCards.filter(
    (c) =>
      c.type === "understatement" &&
      c.id !== card.id &&
      c.category !== card.category &&
      c.supplement.meantZh &&
      c.supplement.meantZh !== correctText,
  )

  const pool = [...shuffle(sameCategory), ...shuffle(otherCategory)]

  const distractorTexts = new Set<string>()
  const distractors: MCOption[] = []

  for (const c of pool) {
    if (distractors.length >= 3) break
    const text = c.supplement.meantZh!
    if (distractorTexts.has(text)) continue
    distractorTexts.add(text)
    distractors.push({ text, isCorrect: false })
  }

  return shuffle([{ text: correctText, isCorrect: true }, ...distractors])
}

export default function Understatement({
  card,
  allCards,
  onAnswer,
}: UnderstatementProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const options = useMemo(
    () => buildOptions(card.content, allCards),
    [card, allCards],
  )

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    const isCorrect = options[index].isCorrect
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
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {card.content.back.text}
        </p>
        <p className="mt-3 text-xs font-medium text-amber-500">
          佢實際上想表達咩？
        </p>
      </Card>

      <div className="space-y-2">
        {options.map((opt, i) => {
          let style: string

          if (selected === null) {
            style =
              "bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          } else if (opt.isCorrect) {
            style =
              "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
          } else if (selected === i) {
            style =
              "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
          } else {
            style =
              "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
            >
              {opt.text}
            </button>
          )
        })}
      </div>

      {selected !== null && card.content.supplement.note && (
        <Card>
          <p className="text-xs font-medium text-indigo-400">文化小知識</p>
          <p className="mt-1 text-sm italic text-zinc-500 dark:text-zinc-400">
            {card.content.supplement.note}
          </p>
        </Card>
      )}

      <AudioButton text={card.content.front.text} />
    </div>
  )
}
