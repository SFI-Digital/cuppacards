import { create } from "zustand"
import { loadPack } from "@/lib/content/loader"
import type { ContentCard, ContentPack } from "@/types"

interface ContentStore {
  cards: ContentCard[]
  packs: ContentPack[]
  isLoading: boolean
  errors: string[]
  loadContent: (enabledPacks: string[]) => Promise<void>
  getCardsByType: (type: ContentCard["type"]) => ContentCard[]
  getCardById: (id: string) => ContentCard | undefined
}

export const useContentStore = create<ContentStore>((set, get) => ({
  cards: [],
  packs: [],
  isLoading: false,
  errors: [],

  loadContent: async (enabledPacks) => {
    set({ isLoading: true, errors: [] })

    const allCards: ContentCard[] = []
    const allPacks: ContentPack[] = []
    const allErrors: string[] = []

    const results = await Promise.allSettled(
      enabledPacks.map((packDir) => loadPack(packDir)),
    )

    for (const result of results) {
      if (result.status === "fulfilled") {
        allCards.push(...result.value.cards)
        allPacks.push(result.value.pack)
        allErrors.push(...result.value.errors)
      } else {
        const msg = `Failed to load pack: ${result.reason}`
        console.warn(msg)
        allErrors.push(msg)
      }
    }

    set({
      cards: allCards,
      packs: allPacks,
      isLoading: false,
      errors: allErrors,
    })
  },

  getCardsByType: (type) => {
    return get().cards.filter((c) => c.type === type)
  },

  getCardById: (id) => {
    return get().cards.find((c) => c.id === id)
  },
}))
