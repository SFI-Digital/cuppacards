"use client"

import { useState } from "react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import AudioButton from "@/components/ui/AudioButton"
import { scoreTranslation } from "@/lib/games/matchScorer"
import type { SessionCard } from "@/types"

interface TranslationProps {
  card: SessionCard
  onAnswer: (correct: boolean) => void
}

export default function Translation({ card, onAnswer }: TranslationProps) {
  const [input, setInput] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{
    correct: boolean
    similarity: number
  } | null>(null)

  // Always show Chinese, user types English
  const question = card.content.back.text
  const expected = card.content.front.text

  const handleSubmit = () => {
    if (submitted || input.trim() === "") return
    setSubmitted(true)

    const scored = scoreTranslation(input, expected)
    setResult(scored)

    setTimeout(() => onAnswer(scored.correct), 1200)
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
        <p className="mt-2 text-xs text-zinc-400">
          翻譯成英文
        </p>
      </Card>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => !submitted && setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="輸入英文翻譯…"
          disabled={submitted}
          autoFocus
          rows={2}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        {submitted && result && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              result.correct
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {result.correct ? (
              <p className="font-medium">正確！</p>
            ) : (
              <div>
                <p className="font-medium">正確答案：</p>
                <p>{expected}</p>
              </div>
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

      <AudioButton text={card.content.front.text} />
    </div>
  )
}
