"use client"

import { useMemo } from "react"
import Flashcard from "@/components/games/Flashcard"
import MultipleChoice from "@/components/games/MultipleChoice"
import FillInBlank from "@/components/games/FillInBlank"
import Listening from "@/components/games/Listening"
import Translation from "@/components/games/Translation"
import ReadAloud from "@/components/games/ReadAloud"
import TrueFalse from "@/components/games/TrueFalse"
import Understatement from "@/components/games/Understatement"
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

  const isNew = card.progress.state === "new"

  // Unique key per card so React fully remounts each game component,
  // resetting all internal state (flipped, selected, input, etc.)
  const cardKey = `${card.content.id}::${card.direction}::${card.gameFormat}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            isNew
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {isNew ? "新卡片" : "複習"}
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

      {card.gameFormat === "true-false" && (
        <TrueFalse key={cardKey} card={card} allCards={allCards} onAnswer={onAnswer} />
      )}

      {card.gameFormat === "understatement" && (
        <Understatement key={cardKey} card={card} allCards={allCards} onAnswer={onAnswer} />
      )}

      {card.gameFormat === "read-aloud" && onNext && (
        <ReadAloud key={cardKey} card={card} onNext={onNext} />
      )}
    </div>
  )
}
