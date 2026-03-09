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
  const hydrateSettings = useSettingsStore((s) => s.hydrate)
  const loadProgress = useProgressStore((s) => s.loadProgress)

  // Hydrate settings from localStorage before anything else
  useEffect(() => {
    hydrateSettings()
  }, [hydrateSettings])

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

  // Register service worker for PWA + handle updates
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      // Check for waiting worker on load
      if (reg.waiting) {
        reg.waiting.postMessage("SKIP_WAITING")
      }

      // Listen for new updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing
        if (!newWorker) return

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            newWorker.postMessage("SKIP_WAITING")
          }
        })
      })
    }).catch((err) => {
      console.warn("[PWA] Service worker registration failed:", err)
    })

    // Reload when new SW takes control
    let refreshing = false
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }, [])

  return <>{children}</>
}
