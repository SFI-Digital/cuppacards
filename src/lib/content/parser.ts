import Papa from "papaparse"
import type { ContentCard } from "@/types"

type ContentType = ContentCard["type"]

function detectType(filename: string): ContentType {
  if (filename.startsWith("phrase")) return "phrase"
  if (filename.startsWith("vocab")) return "vocabulary"
  if (filename.startsWith("sentence")) return "sentence"
  throw new Error(`Unknown content type for file: ${filename}`)
}

function filenameStem(filename: string): string {
  return filename.replace(/\.csv$/, "")
}

interface PhraseRow {
  Category: string
  "English Phrase": string
  "Traditional Chinese": string
  "Usage Note": string
}

interface VocabularyRow {
  Category: string
  Word: string
  "Part of Speech": string
  "Traditional Chinese": string
  Definition: string
  "Example Sentence": string
}

interface SentenceRow {
  Category: string
  "English Sentence": string
  "Traditional Chinese Translation": string
  "Grammar / Usage Note": string
}

function parsePhraseRow(
  row: PhraseRow,
  index: number,
  stem: string,
  packId: string,
): ContentCard | null {
  const text = row["English Phrase"]?.trim()
  if (!text) return null

  return {
    id: `${stem}_${String(index).padStart(3, "0")}`,
    type: "phrase",
    category: row.Category?.trim() || "Uncategorised",
    pack: packId,
    front: { text, lang: "en-GB" },
    back: { text: row["Traditional Chinese"]?.trim() || "", lang: "zh-TW" },
    supplement: { note: row["Usage Note"]?.trim() || "" },
  }
}

function parseVocabularyRow(
  row: VocabularyRow,
  index: number,
  stem: string,
  packId: string,
): ContentCard | null {
  const text = row.Word?.trim()
  if (!text) return null

  return {
    id: `${stem}_${String(index).padStart(3, "0")}`,
    type: "vocabulary",
    category: row.Category?.trim() || "Uncategorised",
    pack: packId,
    front: { text, lang: "en-GB" },
    back: { text: row["Traditional Chinese"]?.trim() || "", lang: "zh-TW" },
    supplement: {
      note: "",
      partOfSpeech: row["Part of Speech"]?.trim() || undefined,
      definition: row.Definition?.trim() || undefined,
      example: row["Example Sentence"]?.trim() || undefined,
    },
  }
}

function parseSentenceRow(
  row: SentenceRow,
  index: number,
  stem: string,
  packId: string,
): ContentCard | null {
  const text = row["English Sentence"]?.trim()
  if (!text) return null

  return {
    id: `${stem}_${String(index).padStart(3, "0")}`,
    type: "sentence",
    category: row.Category?.trim() || "Uncategorised",
    pack: packId,
    front: { text, lang: "en-GB" },
    back: {
      text: row["Traditional Chinese Translation"]?.trim() || "",
      lang: "zh-TW",
    },
    supplement: { note: row["Grammar / Usage Note"]?.trim() || "" },
  }
}

export function parseCSV(
  csvText: string,
  filename: string,
  packId: string,
): ContentCard[] {
  const type = detectType(filename)
  const stem = filenameStem(filename)

  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (result.errors.length > 0) {
    console.warn(
      `[parser] ${filename}: ${result.errors.length} parse error(s)`,
      result.errors,
    )
  }

  const cards: ContentCard[] = []

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i]
    let card: ContentCard | null = null

    switch (type) {
      case "phrase":
        card = parsePhraseRow(row as PhraseRow, i, stem, packId)
        break
      case "vocabulary":
        card = parseVocabularyRow(row as VocabularyRow, i, stem, packId)
        break
      case "sentence":
        card = parseSentenceRow(row as SentenceRow, i, stem, packId)
        break
    }

    if (card) cards.push(card)
  }

  return cards
}
