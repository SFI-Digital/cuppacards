"use client"

import { useState } from "react"
import Card from "@/components/ui/Card"
import AudioButton from "@/components/ui/AudioButton"
import type { SessionCard } from "@/types"
import type { MCOption } from "@/lib/games/optionGenerator"

interface MultipleChoiceProps {
  card: SessionCard
  options: MCOption[]
  onAnswer: (correct: boolean) => void
}

export default function MultipleChoice({
  card,
  options,
  onAnswer,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const question =
    card.direction === "en→zh"
      ? card.content.front.text
      : card.content.back.text

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)

    const isCorrect = options[index].isCorrect
    // Brief delay before advancing so user can see the feedback
    setTimeout(() => onAnswer(isCorrect), 800)
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-1 text-xs font-medium text-indigo-500">
          {card.content.category}
        </p>
        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {question}
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

      <AudioButton text={card.content.front.text} />
    </div>
  )
}
