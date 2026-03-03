import { create } from "zustand"
import storage from "@/lib/storage/store"
import type { Accent } from "@/lib/tts/speaker"

const STORAGE_KEY = "settings"

interface Settings {
  accent: Accent
  enabledPacks: string[]
}

interface SettingsStore extends Settings {
  setAccent: (accent: Accent) => void
  togglePack: (packId: string) => void
}

const DEFAULTS: Settings = {
  accent: "en-GB",
  enabledPacks: ["core"],
}

function loadSettings(): Settings {
  const saved = storage.get<Settings>(STORAGE_KEY)
  return saved ? { ...DEFAULTS, ...saved } : DEFAULTS
}

function persist(state: Settings): void {
  storage.set(STORAGE_KEY, state)
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...loadSettings(),

  setAccent: (accent) => {
    set({ accent })
    const { enabledPacks } = get()
    persist({ accent, enabledPacks })
  },

  togglePack: (packId) => {
    const { enabledPacks } = get()
    const next = enabledPacks.includes(packId)
      ? enabledPacks.filter((id) => id !== packId)
      : [...enabledPacks, packId]
    set({ enabledPacks: next })
    const { accent } = get()
    persist({ accent, enabledPacks: next })
  },
}))
