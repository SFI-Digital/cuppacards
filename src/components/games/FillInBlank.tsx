"use client"

import { useState, useMemo } from "react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import AudioButton from "@/components/ui/AudioButton"
import { generateBlank } from "@/lib/games/blankGenerator"
import type { SessionCard } from "@/types"

interface FillInBlankProps {
  card: SessionCard
  onAnswer: (correct: boolean) => void
}

export default function FillInBlank({ card, onAnswer }: FillInBlankProps) {
  const [input, setInput] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const blank = useMemo(() => generateBlank(card.content), [card.content])

  // Support multiple acceptable answers separated by "/" (e.g. "Tube/Underground")
  const isCorrect = blank.answer
    .split("/")
    .some((v) => input.trim().toLowerCase() === v.trim().toLowerCase())

  const handleSubmit = () => {
    if (submitted || input.trim() === "") return
    setSubmitted(true)
    setTimeout(() => onAnswer(isCorrect), 1000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-1 text-xs font-medium text-indigo-500">
          {card.content.category}
        </p>

        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {blank.display}
        </p>

        {card.direction === "en→zh" && (
          <p className="mt-2 text-sm text-zinc-400">
            {card.content.back.text}
          </p>
        )}
      </Card>

      <div className="space-y-3">
        <input
          type="text"
          value={input}
          onChange={(e) => !submitted && setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="輸入缺少的單字…"
          disabled={submitted}
          autoFocus
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        {submitted && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              isCorrect
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {isCorrect ? (
              "正確！"
            ) : (
              <>
                正確答案：<strong>{blank.answer}</strong>
              </>
            )}
          </div>
        )}

        {!submitted && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={input.trim() === ""}
          >
            確認
          </Button>
        )}
      </div>

      <AudioButton text={card.content.front.text} cardId={card.content.id} accent={card.content.front.lang as "en-GB" | "en-US"} />
    </div>
  )
}
