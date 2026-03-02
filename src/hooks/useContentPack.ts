"use client"

import { useEffect } from "react"
import { useContentStore } from "@/stores/contentStore"
import { useSettingsStore } from "@/stores/settingsStore"

export function useContentPack() {
  const { cards, packs, isLoading, errors, loadContent } = useContentStore()
  const enabledPacks = useSettingsStore((s) => s.enabledPacks)

  useEffect(() => {
    if (cards.length === 0 && !isLoading) {
      loadContent(enabledPacks)
    }
  }, [cards.length, isLoading, loadContent, enabledPacks])

  return { cards, packs, isLoading, errors }
}
