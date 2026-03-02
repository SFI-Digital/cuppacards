"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Card from "@/components/ui/Card"
import { useTTS } from "@/hooks/useTTS"
import { generateOptions } from "@/lib/games/optionGenerator"
import type { SessionCard, ContentCard } from "@/types"
import type { MCOption } from "@/lib/games/optionGenerator"

interface ListeningProps {
  card: SessionCard
  allCards: ContentCard[]
  onAnswer: (correct: boolean) => void
}

export default function Listening({ card, allCards, onAnswer }: ListeningProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const { speak } = useTTS()

  const options: MCOption[] = useMemo(
    () => generateOptions(card.content, allCards, card.direction),
    [card, allCards],
  )

  // Auto-play TTS on mount — use ref to prevent double-fire in strict mode
  const hasPlayed = useRef(false)
  useEffect(() => {
    if (!hasPlayed.current) {
      hasPlayed.current = true
      speak(card.content.front.text)
    }
  }, [card.content.front.text, speak])

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    setRevealed(true)

    const isCorrect = options[index].isCorrect
    setTimeout(() => onAnswer(isCorrect), 1000)
  }

  const handleReplay = () => {
    speak(card.content.front.text)
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-1 text-xs font-medium text-indigo-500">
          {card.content.category}
        </p>

        {revealed ? (
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {card.content.front.text}
          </p>
        ) : (
          <p className="text-lg text-zinc-400 italic">
            Listen and choose the correct answer
          </p>
        )}
      </Card>

      <button
        onClick={handleReplay}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-100 px-4 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
        </svg>
        Play again
      </button>

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
    </div>
  )
}
