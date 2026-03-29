"use client"

import { useState, useEffect, useRef } from "react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { useTTS } from "@/hooks/useTTS"
import type { SessionCard } from "@/types"

interface ReadAloudProps {
  card: SessionCard
  onNext: () => void
}

export default function ReadAloud({ card, onNext }: ReadAloudProps) {
  const [revealed, setRevealed] = useState(false)
  const { speak } = useTTS()

  // Auto-play TTS on mount — use ref to prevent double-fire in strict mode
  const hasPlayed = useRef(false)
  useEffect(() => {
    if (!hasPlayed.current) {
      hasPlayed.current = true
      speak(card.content.front.text, undefined, card.content.id)
    }
  }, [card.content.front.text, speak])

  const handleReplay = () => {
    speak(card.content.front.text, undefined, card.content.id)
  }

  return (
    <div className="space-y-4">
      <Card onClick={() => setRevealed((r) => !r)}>
        <p className="mb-1 text-xs font-medium text-indigo-500">
          {card.content.category}
        </p>

        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {card.content.front.text}
        </p>

        {revealed ? (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-lg text-zinc-700 dark:text-zinc-300">
              {card.content.back.text}
            </p>

            {card.content.supplement.note && (
              <p className="mt-2 text-sm italic text-zinc-400">
                {card.content.supplement.note}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-zinc-400">點擊顯示翻譯</p>
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
        再播放一次
      </button>

      <p className="text-center text-xs text-zinc-400">
        跟著唸一遍，然後按下一句
      </p>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onNext}
      >
        下一句
      </Button>
    </div>
  )
}
