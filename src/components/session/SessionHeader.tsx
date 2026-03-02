"use client"

import ProgressBar from "@/components/ui/ProgressBar"

interface SessionHeaderProps {
  currentIndex: number
  total: number
}

export default function SessionHeader({
  currentIndex,
  total,
}: SessionHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          第 {currentIndex + 1} / {total} 張
        </span>
        <span className="text-xs">
          {Math.round(((currentIndex + 1) / total) * 100)}%
        </span>
      </div>
      <ProgressBar current={currentIndex + 1} total={total} />
    </div>
  )
}
