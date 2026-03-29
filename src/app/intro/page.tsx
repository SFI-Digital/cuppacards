"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import OnboardingSlide from "@/components/onboarding/OnboardingSlide"
import OnboardingDots from "@/components/onboarding/OnboardingDots"
import storage from "@/lib/storage/store"

const SLIDES = [
  {
    emoji: "☕",
    headline: "歡迎來到 CuppaCards！",
    body: "專為在英國生活的粵語／普通話使用者設計，用最地道的方式學英式英語。",
  },
  {
    emoji: "🇬🇧",
    headline: "學真正的英式英語",
    body: "從「cuppa」到「cheers」，掌握英國人每天說的片語、俚語與文化表達方式。",
  },
  {
    emoji: "🃏",
    headline: "用卡片遊戲輕鬆記憶",
    body: "填空、選擇題、聆聽——多種遊戲形式，配合智慧複習排程，讓詞彙牢牢記住。",
  },
  {
    emoji: "🔥",
    headline: "每天一點點，進步看得見",
    body: "建立每日學習習慣，追蹤你的連續天數與掌握進度。準備好了嗎？",
  },
] as const

const ONBOARDING_KEY = "onboarding_complete"

export default function IntroPage() {
  const router = useRouter()
  const [slideIndex, setSlideIndex] = useState(0)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const touchStartX = useRef<number | null>(null)

  const isFirst = slideIndex === 0
  const isLast = slideIndex === SLIDES.length - 1

  // Redirect if already completed onboarding
  useEffect(() => {
    if (storage.has(ONBOARDING_KEY)) {
      router.replace("/")
    }
  }, [router])

  const complete = () => {
    storage.set(ONBOARDING_KEY, true)
    router.replace("/")
  }

  const goNext = () => {
    if (isLast) {
      complete()
      return
    }
    setDirection("forward")
    setSlideIndex((i) => i + 1)
  }

  const goPrev = () => {
    if (isFirst) return
    setDirection("backward")
    setSlideIndex((i) => i - 1)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (delta < -50) goNext()
    else if (delta > 50) goPrev()
  }

  const slide = SLIDES[slideIndex]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-linear-to-b from-indigo-50 to-white dark:from-indigo-950 dark:to-zinc-950">
      {/* Top bar */}
      <div className="flex h-14 items-center justify-end px-6">
        {!isLast && (
          <button
            onClick={complete}
            className="text-sm font-medium text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            略過
          </button>
        )}
      </div>

      {/* Slide area */}
      <div
        className="flex flex-1 items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label={`介紹投影片 ${slideIndex + 1} / ${SLIDES.length}`}
      >
        <OnboardingSlide
          key={slideIndex}
          emoji={slide.emoji}
          headline={slide.headline}
          body={slide.body}
          direction={direction}
        />
      </div>

      {/* Bottom controls */}
      <div className="space-y-6 px-6 pb-12">
        <OnboardingDots total={SLIDES.length} current={slideIndex} />

        <div className="flex gap-3">
          {!isFirst && (
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={goPrev}
            >
              上一步
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={goNext}
          >
            {isLast ? "開始學習" : "下一步"}
          </Button>
        </div>
      </div>
    </div>
  )
}
