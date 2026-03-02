"use client"

import { useEffect } from "react"
import { useContentStore } from "@/stores/contentStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { useProgressStore } from "@/stores/progressStore"

export default function Providers({ children }: { children: React.ReactNode }) {
  const loadContent = useContentStore((s) => s.loadContent)
  const isLoading = useContentStore((s) => s.isLoading)
  const cards = useContentStore((s) => s.cards)
  const enabledPacks = useSettingsStore((s) => s.enabledPacks)
  const loadProgress = useProgressStore((s) => s.loadProgress)

  // Load content on mount
  useEffect(() => {
    if (cards.length === 0 && !isLoading) {
      loadContent(enabledPacks)
    }
  }, [cards.length, isLoading, loadContent, enabledPacks])

  // Load progress on mount
  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err)
      })
    }
  }, [])

  return <>{children}</>
}
