import Papa from "papaparse"
import type { ContentCard } from "@/types"

type ContentType = ContentCard["type"]

// Identifies which parser function to use based on filename prefix
type ParserKey =
  | "phrase"
  | "vocabulary"
  | "sentence"
  | "brit_slang"
  | "brit_cultural"
  | "brit_vocabulary_swaps"
  | "brit_understatement"

function detectParserKey(filename: string): ParserKey {
  if (filename.startsWith("brit_slang")) return "brit_slang"
  if (filename.startsWith("brit_cultural")) return "brit_cultural"
  if (filename.startsWith("brit_vocabulary_swaps")) return "brit_vocabulary_swaps"
  if (filename.startsWith("brit_understatement")) return "brit_understatement"
  if (filename.startsWith("phrase")) return "phrase"
  if (filename.startsWith("vocab")) return "vocabulary"
  if (filename.startsWith("sentence")) return "sentence"
  throw new Error(`Unknown content type for file: ${filename}`)
}

function filenameStem(filename: string): string {
  return filename.replace(/\.csv$/, "")
}

// ─── Row Interfaces ──────────────────────────────────────────────

interface PhraseRow {
  Category: string
  "English Phrase": string
  "Traditional Chinese": string
  "Usage Note": string
  Difficulty?: string
}

interface VocabularyRow {
  Category: string
  Word: string
  "Part of Speech": string
  "Traditional Chinese": string
  Definition: string
  "Example Sentence": string
  Difficulty?: string
}

interface SentenceRow {
  Category: string
  "English Sentence": string
  "Traditional Chinese Translation": string
  "Grammar / Usage Note": string
}

interface BritSlangRow {
  Category: string
  "English Expression": string
  "Traditional Chinese": string
  "Usage Note": string
}

interface BritCulturalRow {
  Category: string
  "English Phrase": string
  "Traditional Chinese": string
  "Cultural Context": string
}

interface BritVocabSwapRow {
  Category: string
  "American English": string
  "British English": string
  "Traditional Chinese": string
  Notes: string
}

interface BritUnderstatementRow {
  Category: string
  "What They Said": string
  "What They Meant": string
  "Traditional Chinese (Said)": string
  "Traditional Chinese (Meant)": string
  "Cultural Note": string
}

// ─── Row Parsers ─────────────────────────────────────────────────

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
    difficulty: row.Difficulty?.trim().toLowerCase() || "intermediate",
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
    difficulty: row.Difficulty?.trim().toLowerCase() || "intermediate",
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

function parseBritSlangRow(
  row: BritSlangRow,
  index: number,
  stem: string,
  packId: string,
): ContentCard | null {
  const text = row["English Expression"]?.trim()
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

function parseBritCulturalRow(
  row: BritCulturalRow,
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
    supplement: { note: row["Cultural Context"]?.trim() || "" },
  }
}

function parseBritVocabSwapRow(
  row: BritVocabSwapRow,
  index: number,
  stem: string,
  packId: string,
): ContentCard | null {
  const text = row["British English"]?.trim()
  if (!text) return null

  const americanTerm = row["American English"]?.trim() || ""

  return {
    id: `${stem}_${String(index).padStart(3, "0")}`,
    type: "vocabulary",
    category: row.Category?.trim() || "Uncategorised",
    pack: packId,
    front: { text, lang: "en-GB" },
    back: { text: row["Traditional Chinese"]?.trim() || "", lang: "zh-TW" },
    supplement: {
      note: row.Notes?.trim() || "",
      definition: americanTerm ? `American English: ${americanTerm}` : undefined,
    },
    variant: "UK",
  }
}

function parseBritUnderstatementRow(
  row: BritUnderstatementRow,
  index: number,
  stem: string,
  packId: string,
): ContentCard | null {
  const text = row["What They Said"]?.trim()
  if (!text) return null

  return {
    id: `${stem}_${String(index).padStart(3, "0")}`,
    type: "understatement",
    category: row.Category?.trim() || "Uncategorised",
    pack: packId,
    front: { text, lang: "en-GB" },
    back: {
      text: row["Traditional Chinese (Said)"]?.trim() || "",
      lang: "zh-TW",
    },
    supplement: {
      note: row["Cultural Note"]?.trim() || "",
      meant: row["What They Meant"]?.trim() || undefined,
      meantZh: row["Traditional Chinese (Meant)"]?.trim() || undefined,
    },
  }
}

// ─── Main Parser ─────────────────────────────────────────────────

export function parseCSV(
  csvText: string,
  filename: string,
  packId: string,
): ContentCard[] {
  const parserKey = detectParserKey(filename)
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

    switch (parserKey) {
      case "phrase":
        card = parsePhraseRow(row as PhraseRow, i, stem, packId)
        break
      case "vocabulary":
        card = parseVocabularyRow(row as VocabularyRow, i, stem, packId)
        break
      case "sentence":
        card = parseSentenceRow(row as SentenceRow, i, stem, packId)
        break
      case "brit_slang":
        card = parseBritSlangRow(row as BritSlangRow, i, stem, packId)
        break
      case "brit_cultural":
        card = parseBritCulturalRow(row as BritCulturalRow, i, stem, packId)
        break
      case "brit_vocabulary_swaps":
        card = parseBritVocabSwapRow(row as BritVocabSwapRow, i, stem, packId)
        break
      case "brit_understatement":
        card = parseBritUnderstatementRow(
          row as BritUnderstatementRow,
          i,
          stem,
          packId,
        )
        break
    }

    if (card) cards.push(card)
  }

  return cards
}
