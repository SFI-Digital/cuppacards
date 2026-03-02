"use client"

import { useState } from "react"
import { useTTS } from "@/hooks/useTTS"
import type { Accent } from "@/lib/tts/speaker"

interface AudioButtonProps {
  text: string
  accent?: Accent
  className?: string
}

export default function AudioButton({
  text,
  accent,
  className = "",
}: AudioButtonProps) {
  const { speak, isSupported } = useTTS()
  const [playing, setPlaying] = useState(false)

  if (!isSupported) return null

  const handleClick = async () => {
    setPlaying(true)
    try {
      await speak(text, accent)
    } catch {
      // speech cancelled or error — ignore
    } finally {
      setPlaying(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={playing}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-zinc-200 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${className}`}
    >
      <span>{playing ? "\u23F3" : "\uD83D\uDD0A"}</span>
      聆聽
    </button>
  )
}
