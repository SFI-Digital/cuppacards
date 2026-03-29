"use client"

interface OnboardingSlidePros {
  emoji: string
  headline: string
  body: string
  direction: "forward" | "backward"
}

export default function OnboardingSlide({
  emoji,
  headline,
  body,
  direction,
}: OnboardingSlidePros) {
  return (
    <div
      className={`flex flex-col items-center px-8 text-center ${
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      }`}
    >
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-white/60 text-7xl shadow-sm dark:bg-zinc-900/60">
        {emoji}
      </div>
      <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {headline}
      </h2>
      <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {body}
      </p>
    </div>
  )
}
