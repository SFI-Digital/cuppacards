import { create } from "zustand"
import storage from "@/lib/storage/store"
import type { Direction } from "@/types"
import type { Accent } from "@/lib/tts/speaker"

const STORAGE_KEY = "settings"

interface Settings {
  accent: Accent
  direction: Direction | "both"
  enabledPacks: string[]
  region: "HK" | "TW"
}

interface SettingsStore extends Settings {
  setAccent: (accent: Accent) => void
  setDirection: (direction: Direction | "both") => void
  togglePack: (packId: string) => void
  setRegion: (region: "HK" | "TW") => void
}

const DEFAULTS: Settings = {
  accent: "en-GB",
  direction: "both",
  enabledPacks: ["core"],
  region: "HK",
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
    const { direction, enabledPacks, region } = get()
    persist({ accent, direction, enabledPacks, region })
  },

  setDirection: (direction) => {
    set({ direction })
    const { accent, enabledPacks, region } = get()
    persist({ accent, direction, enabledPacks, region })
  },

  togglePack: (packId) => {
    const { enabledPacks } = get()
    const next = enabledPacks.includes(packId)
      ? enabledPacks.filter((id) => id !== packId)
      : [...enabledPacks, packId]
    set({ enabledPacks: next })
    const { accent, direction, region } = get()
    persist({ accent, direction, enabledPacks: next, region })
  },

  setRegion: (region) => {
    set({ region })
    const { accent, direction, enabledPacks } = get()
    persist({ accent, direction, enabledPacks, region })
  },
}))
