"use client"

import { useEffect } from "react"
import { useProgressStore } from "@/stores/progressStore"
import { useContentStore } from "@/stores/contentStore"

export function useProgress() {
  const cards = useContentStore((s) => s.cards)
  const loadProgress = useProgressStore((s) => s.loadProgress)
  const refreshStats = useProgressStore((s) => s.refreshStats)
  const stats = useProgressStore((s) => s.stats)
  const dayStreak = useProgressStore((s) => s.dayStreak)
  const getDueCount = useProgressStore((s) => s.getDueCount)

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  useEffect(() => {
    if (cards.length > 0) {
      refreshStats(cards)
    }
  }, [cards, refreshStats])

  const dueCount = cards.length > 0 ? getDueCount(cards) : 0

  return { stats, dayStreak, dueCount }
}
