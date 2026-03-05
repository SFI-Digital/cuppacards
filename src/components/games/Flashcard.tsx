"use client"

import { useState, useMemo } from "react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import AudioButton from "@/components/ui/AudioButton"
import { lookupVocab } from "@/lib/content/vocabLookup"
import { useContentStore } from "@/stores/contentStore"
import type { SessionCard } from "@/types"

interface FlashcardProps {
  card: SessionCard
  onAnswer: (correct: boolean) => void
}

export default function Flashcard({ card, onAnswer }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false)
  const allCards = useContentStore((s) => s.cards)

  // Vocab lookup for phrases and sentences
  const vocabMatches = useMemo(() => {
    if (card.content.type === "vocabulary") return []
    return lookupVocab(card.content.front.text, allCards)
  }, [card.content, allCards])

  const question =
    card.direction === "en→zh"
      ? card.content.front.text
      : card.content.back.text

  const answer =
    card.direction === "en→zh"
      ? card.content.back.text
      : card.content.front.text

  return (
    <div className="space-y-4">
      <Card onClick={() => setFlipped((f) => !f)}>
        <p className="mb-1 text-xs font-medium text-indigo-500">
          {card.content.category}
        </p>

        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {question}
        </p>

        {flipped ? (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-lg text-zinc-700 dark:text-zinc-300">
              {answer}
            </p>

            {card.content.supplement.meant && (
              <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="mb-1 text-xs font-medium text-amber-500">
                  實際意思
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {card.content.supplement.meant}
                </p>
                {card.content.supplement.meantZh && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {card.content.supplement.meantZh}
                  </p>
                )}
              </div>
            )}

            {card.content.supplement.note && (
              <p className="mt-2 text-sm italic text-zinc-400">
                {card.content.supplement.note}
              </p>
            )}

            {card.content.supplement.definition && (
              <p className="mt-1 text-sm text-zinc-500">
                {card.content.supplement.definition}
              </p>
            )}

            {card.content.supplement.example && (
              <p className="mt-1 text-sm text-zinc-400">
                例：{card.content.supplement.example}
              </p>
            )}

            {vocabMatches.length > 0 && (
              <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="mb-1 text-xs font-medium text-indigo-400">
                  相關詞彙
                </p>
                {vocabMatches.map((m) => (
                  <div key={m.word} className="mt-1 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-600 dark:text-zinc-300">
                      {m.card.front.text}
                    </span>
                    {" — "}
                    {m.card.back.text}
                    {m.card.supplement.partOfSpeech && (
                      <span className="ml-1 text-zinc-300 dark:text-zinc-600">
                        ({m.card.supplement.partOfSpeech})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-zinc-400">點擊顯示答案</p>
        )}
      </Card>

      <AudioButton text={card.content.front.text} />

      {flipped && (
        <div className="flex gap-3">
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => onAnswer(false)}
          >
            不會
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => onAnswer(true)}
          >
            記住了
          </Button>
        </div>
      )}
    </div>
  )
}
