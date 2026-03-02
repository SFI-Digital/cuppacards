"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  href: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "\u9996\u9801", icon: "\uD83C\uDFE0" },
  { href: "/session", label: "\u7DF4\u7FD2", icon: "\uD83C\uDCCF" },
  { href: "/review", label: "\u8907\u7FD2", icon: "\uD83D\uDCD6" },
  { href: "/progress", label: "\u9032\u5EA6", icon: "\uD83D\uDCCA" },
  { href: "/settings", label: "\u8A2D\u5B9A", icon: "\u2699\uFE0F" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
