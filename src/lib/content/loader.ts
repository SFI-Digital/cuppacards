import type { ContentCard, ContentPack } from "@/types"
import { parseCSV } from "./parser"
import { validateCards } from "./validator"

export interface LoadResult {
  pack: ContentPack
  cards: ContentCard[]
  errors: string[]
}

export async function loadManifest(packDir: string): Promise<ContentPack> {
  const res = await fetch(`/content/${packDir}/manifest.json`)
  if (!res.ok) {
    throw new Error(`Failed to load manifest for pack "${packDir}": ${res.status}`)
  }
  return res.json()
}

export async function loadPack(packDir: string): Promise<LoadResult> {
  const pack = await loadManifest(packDir)
  const errors: string[] = []
  const allCards: ContentCard[] = []

  const results = await Promise.allSettled(
    pack.files.map(async (file) => {
      const res = await fetch(`/content/${packDir}/${file}`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const csvText = await res.text()
      return { file, csvText }
    }),
  )

  for (const result of results) {
    if (result.status === "rejected") {
      const msg = `[loader] Failed to fetch CSV: ${result.reason}`
      console.warn(msg)
      errors.push(msg)
      continue
    }

    const { file, csvText } = result.value

    try {
      const parsed = parseCSV(csvText, file, pack.id)
      const { valid, errors: validationErrors } = validateCards(parsed)

      if (validationErrors.length > 0) {
        errors.push(
          `[loader] ${file}: ${validationErrors.length} invalid card(s) skipped`,
        )
      }

      allCards.push(...valid)
    } catch (err) {
      const msg = `[loader] Failed to parse ${file}: ${err}`
      console.warn(msg)
      errors.push(msg)
    }
  }

  return { pack, cards: allCards, errors }
}
