"use client"

interface OnboardingDotsProps {
  total: number
  current: number
}

export default function OnboardingDots({ total, current }: OnboardingDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="投影片進度">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`投影片 ${i + 1}`}
          className={`block rounded-full transition-all duration-300 ${
            i === current
              ? "h-2.5 w-6 bg-indigo-600 dark:bg-indigo-400"
              : "h-2.5 w-2.5 bg-zinc-300 dark:bg-zinc-600"
          }`}
        />
      ))}
    </div>
  )
}
