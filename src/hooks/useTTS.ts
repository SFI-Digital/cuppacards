"use client"

import { useCallback } from "react"
import { speak as ttsSpeak, stop as ttsStop, isSupported } from "@/lib/tts/speaker"
import { useSettingsStore } from "@/stores/settingsStore"
import type { Accent } from "@/lib/tts/speaker"

export function useTTS() {
  const accent = useSettingsStore((s) => s.accent)

  const speak = useCallback(
    (text: string, overrideAccent?: Accent) => {
      return ttsSpeak(text, { accent: overrideAccent || accent })
    },
    [accent],
  )

  const stop = useCallback(() => {
    ttsStop()
  }, [])

  return {
    speak,
    stop,
    accent,
    isSupported: isSupported(),
  }
}
