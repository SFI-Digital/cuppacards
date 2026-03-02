"use client"

import { useState } from "react"
import { useSettingsStore } from "@/stores/settingsStore"
import { useProgressStore } from "@/stores/progressStore"
import { useContentStore } from "@/stores/contentStore"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

export default function SettingsPage() {
  const accent = useSettingsStore((s) => s.accent)
  const region = useSettingsStore((s) => s.region)
  const enabledPacks = useSettingsStore((s) => s.enabledPacks)
  const setAccent = useSettingsStore((s) => s.setAccent)
  const setRegion = useSettingsStore((s) => s.setRegion)
  const togglePack = useSettingsStore((s) => s.togglePack)

  const resetProgress = useProgressStore((s) => s.resetProgress)
  const refreshStats = useProgressStore((s) => s.refreshStats)
  const cards = useContentStore((s) => s.cards)
  const packs = useContentStore((s) => s.packs)

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleReset = () => {
    resetProgress()
    refreshStats(cards)
    setShowResetConfirm(false)
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          設定
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          自訂你的學習體驗
        </p>
      </div>

      {/* Accent */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          口音
        </h3>
        <div className="flex gap-2">
          {(["en-GB", "en-US"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                accent === a
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {a === "en-GB" ? "英式" : "美式"}
            </button>
          ))}
        </div>
      </Card>

      {/* Region */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          地區
        </h3>
        <div className="flex gap-2">
          {([
            { value: "HK", label: "香港" },
            { value: "TW", label: "台灣" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRegion(opt.value)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                region === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Content Packs */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          內容包
        </h3>
        <div className="space-y-2">
          {packs.map((pack) => {
            const isEnabled = enabledPacks.includes(pack.id)
            return (
              <button
                key={pack.id}
                onClick={() => togglePack(pack.id)}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {pack.name}
                  </p>
                  <p className="text-xs text-zinc-400">{pack.description}</p>
                </div>
                <div
                  className={`h-5 w-9 rounded-full transition-colors ${
                    isEnabled ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      isEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            )
          })}
          {packs.length === 0 && (
            <p className="text-sm text-zinc-400">沒有可用的內容包</p>
          )}
        </div>
      </Card>

      {/* Reset */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          資料
        </h3>
        {showResetConfirm ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600 dark:text-red-400">
              這將刪除所有學習進度，此操作無法復原。
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={handleReset}
              >
                確認重置
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowResetConfirm(false)}
              >
                取消
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            size="md"
            className="w-full"
            onClick={() => setShowResetConfirm(true)}
          >
            重置所有進度
          </Button>
        )}
      </Card>
    </div>
  )
}
