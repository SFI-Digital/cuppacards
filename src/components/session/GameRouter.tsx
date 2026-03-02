"use client"

import { useMemo } from "react"
import Flashcard from "@/components/games/Flashcard"
import MultipleChoice from "@/components/games/MultipleChoice"
import FillInBlank from "@/components/games/FillInBlank"
import Listening from "@/components/games/Listening"
import Translation from "@/components/games/Translation"
import ReadAloud from "@/components/games/ReadAloud"
import { generateOptions } from "@/lib/games/optionGenerator"
import type { ContentCard, SessionCard } from "@/types"

interface GameRouterProps {
  card: SessionCard
  allCards: ContentCard[]
  onAnswer: (correct: boolean) => void
  onNext?: () => void
}

export default function GameRouter({
  card,
  allCards,
  onAnswer,
  onNext,
}: GameRouterProps) {
  const mcOptions = useMemo(() => {
    if (
      card.gameFormat === "multiple-choice" ||
      card.gameFormat === "listening"
    ) {
      return generateOptions(card.content, allCards, card.direction)
    }
    return []
  }, [card, allCards])

  const directionLabel =
    card.direction === "en→zh" ? "英文 → 中文" : "中文 → 英文"

  const FORMAT_LABELS: Record<string, string> = {
    flashcard: "閃卡",
    "multiple-choice": "選擇題",
    "fill-in-blank": "填空",
    listening: "聽力",
    translation: "翻譯",
    "read-aloud": "跟讀",
  }

  // Unique key per card so React fully remounts each game component,
  // resetting all internal state (flipped, selected, input, etc.)
  const cardKey = `${card.content.id}::${card.direction}::${card.gameFormat}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{directionLabel}</span>
        <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {FORMAT_LABELS[card.gameFormat] || card.gameFormat}
        </span>
      </div>

      {card.gameFormat === "flashcard" && (
        <Flashcard key={cardKey} card={card} onAnswer={onAnswer} />
      )}

      {card.gameFormat === "multiple-choice" && (
        <MultipleChoice
          key={cardKey}
          card={card}
          options={mcOptions}
          onAnswer={onAnswer}
        />
      )}

      {card.gameFormat === "fill-in-blank" && (
        <FillInBlank key={cardKey} card={card} onAnswer={onAnswer} />
      )}

      {card.gameFormat === "listening" && (
        <Listening key={cardKey} card={card} allCards={allCards} onAnswer={onAnswer} />
      )}

      {card.gameFormat === "translation" && (
        <Translation key={cardKey} card={card} onAnswer={onAnswer} />
      )}

      {card.gameFormat === "read-aloud" && onNext && (
        <ReadAloud key={cardKey} card={card} onNext={onNext} />
      )}
    </div>
  )
}
