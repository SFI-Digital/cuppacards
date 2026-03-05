"use client"

import { useEffect, useMemo } from "react"
import { useProgressStore } from "@/stores/progressStore"
import { useContentStore } from "@/stores/contentStore"
import { useSettingsStore } from "@/stores/settingsStore"
import type { ContentCard } from "@/types"

/**
 * Filter cards by enabled difficulty levels.
 * Cards without a difficulty field (brit pack, sentences) always pass.
 */
function filterByLevels(
  cards: ContentCard[],
  enabledLevels: string[],
): ContentCard[] {
  return cards.filter((c) => !c.difficulty || enabledLevels.includes(c.difficulty))
}

export function useProgress() {
  const cards = useContentStore((s) => s.cards)
  const enabledLevels = useSettingsStore((s) => s.enabledLevels)
  const loadProgress = useProgressStore((s) => s.loadProgress)
  const refreshStats = useProgressStore((s) => s.refreshStats)
  const stats = useProgressStore((s) => s.stats)
  const dayStreak = useProgressStore((s) => s.dayStreak)
  const getDueCount = useProgressStore((s) => s.getDueCount)

  const filteredCards = useMemo(
    () => filterByLevels(cards, enabledLevels),
    [cards, enabledLevels],
  )

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  useEffect(() => {
    if (filteredCards.length > 0) {
      refreshStats(filteredCards)
    }
  }, [filteredCards, refreshStats])

  const dueCount = filteredCards.length > 0 ? getDueCount(filteredCards) : 0

  return { stats, dayStreak, dueCount }
}
