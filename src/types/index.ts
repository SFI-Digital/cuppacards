// ─── Content Types ───────────────────────────────────────────────

export interface ContentCard {
  id: string // e.g. "phrase_part1_042"
  type: "phrase" | "vocabulary" | "sentence"
  category: string // e.g. "Greetings", "Daily Life"
  pack: string // e.g. "core", "british-english"

  front: {
    text: string // English text
    lang: "en-GB" | "en-US"
  }

  back: {
    text: string // Traditional Chinese translation
    lang: "zh-TW"
  }

  supplement: {
    note: string // Usage note or grammar note
    example?: string // Example sentence (vocabulary only)
    definition?: string // Definition (vocabulary only)
    partOfSpeech?: string // noun, verb, etc. (vocabulary only)
  }

  variant?: "US" | "UK" | "both" // for vocabulary swap cards
}

// ─── Progress Types ──────────────────────────────────────────────

export type Direction = "en→zh" | "zh→en"

export type CardState = "new" | "learning" | "review" | "mastered"

export interface ProgressRecord {
  cardId: string // links to ContentCard.id
  direction: Direction

  // SRS state
  state: CardState
  interval: number // days until next review
  easeFactor: number // interval multiplier, starts at 2.5
  dueDate: string // ISO date string

  // Stats
  totalReviews: number
  correctReviews: number
  lastReviewed: string // ISO date string
  streak: number // consecutive correct answers
}

// ─── Session Types ───────────────────────────────────────────────

export type GameFormat =
  | "flashcard"
  | "multiple-choice"
  | "fill-in-blank"
  | "listening"
  | "translation"
  | "read-aloud"

export interface SessionCard {
  content: ContentCard
  progress: ProgressRecord
  gameFormat: GameFormat
  direction: Direction
}

// ─── Content Pack Types ──────────────────────────────────────────

export interface ContentPack {
  id: string // e.g. "core-phrases"
  name: string // e.g. "Core Phrases"
  description: string
  type: "core" | "supplement" | "cultural"
  dialect: "en-GB" | "en-US" | "both"
  translation: "zh-TW"
  version: number
  files: string[] // CSV filenames included in this pack
  premium: boolean // reserved for future monetisation
}

// ─── Stats Types ─────────────────────────────────────────────────

export interface Stats {
  total: number
  byState: Record<CardState, number>
  accuracy: number
  streak: number
}
