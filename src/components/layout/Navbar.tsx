"use client"

import { useSettingsStore } from "@/stores/settingsStore"

export default function Navbar() {
  const accent = useSettingsStore((s) => s.accent)
  const setAccent = useSettingsStore((s) => s.setAccent)

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
          English Learning
        </h1>

        <div className="flex gap-1">
          {(["en-GB", "en-US"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                accent === a
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {a === "en-GB" ? "UK" : "US"}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
