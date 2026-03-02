"use client"

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 ${onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""} ${className}`}
    >
      {children}
    </div>
  )
}
