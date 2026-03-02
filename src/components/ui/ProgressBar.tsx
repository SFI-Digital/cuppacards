"use client"

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export default function ProgressBar({
  current,
  total,
  className = "",
}: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
    >
      <div
        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
