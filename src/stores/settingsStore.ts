import { create } from "zustand"
import storage from "@/lib/storage/store"
import type { Accent } from "@/lib/tts/speaker"

const STORAGE_KEY = "settings"

interface Settings {
  accent: Accent
  enabledPacks: string[]
  enabledLevels: string[]
}

interface SettingsStore extends Settings {
  _hydrated: boolean
  hydrate: () => void
  setAccent: (accent: Accent) => void
  togglePack: (packId: string) => void
  toggleLevel: (level: string) => void
}

const DEFAULTS: Settings = {
  accent: "en-GB",
  enabledPacks: ["core", "british-english"],
  enabledLevels: ["intermediate"],
}

function loadSettings(): Settings {
  const saved = storage.get<Settings>(STORAGE_KEY)
  return saved ? { ...DEFAULTS, ...saved } : DEFAULTS
}

function persistAll(state: Settings): void {
  storage.set(STORAGE_KEY, state)
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULTS,
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return
    const saved = loadSettings()
    set({ ...saved, _hydrated: true })
  },

  setAccent: (accent) => {
    set({ accent })
    const { enabledPacks, enabledLevels } = get()
    persistAll({ accent, enabledPacks, enabledLevels })
  },

  togglePack: (packId) => {
    const { enabledPacks } = get()
    // Prevent deselecting the last pack
    if (enabledPacks.length === 1 && enabledPacks.includes(packId)) return
    const next = enabledPacks.includes(packId)
      ? enabledPacks.filter((id) => id !== packId)
      : [...enabledPacks, packId]
    set({ enabledPacks: next })
    const { accent, enabledLevels } = get()
    persistAll({ accent, enabledPacks: next, enabledLevels })
  },

  toggleLevel: (level) => {
    const { enabledLevels } = get()
    // Prevent deselecting the last level
    if (enabledLevels.length === 1 && enabledLevels.includes(level)) return
    const next = enabledLevels.includes(level)
      ? enabledLevels.filter((l) => l !== level)
      : [...enabledLevels, level]
    set({ enabledLevels: next })
    const { accent, enabledPacks } = get()
    persistAll({ accent, enabledPacks, enabledLevels: next })
  },
}))
