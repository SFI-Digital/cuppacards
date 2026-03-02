"use client"

import Providers from "./Providers"
import Navbar from "./Navbar"
import BottomNav from "./BottomNav"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-20 pt-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </Providers>
  )
}
