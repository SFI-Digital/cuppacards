/**
 * generate-audio.ts
 *
 * Pre-generates ElevenLabs TTS audio for every content card and uploads to
 * Vercel Blob. Safe to re-run — existing blobs are skipped by pathname check.
 *
 * Usage:
 *   pnpm generate-audio
 *
 * Required env vars (set in .env.local):
 *   ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID_GB, ELEVENLABS_VOICE_ID_US,
 *   BLOB_READ_WRITE_TOKEN
 */

import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"
import Papa from "papaparse"
import { put, list } from "@vercel/blob"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

// ─── Config ──────────────────────────────────────────────────────

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
const VOICE_IDS: Record<string, string> = {
  "en-GB": process.env.ELEVENLABS_VOICE_ID_GB!,
  "en-US": process.env.ELEVENLABS_VOICE_ID_US!,
}

const ACCENTS = ["en-GB", "en-US"] as const
const PUBLIC_DIR = path.resolve(process.cwd(), "public/content")

// ─── Types ───────────────────────────────────────────────────────

interface CardEntry {
  id: string
  text: string
  lang: string
}

// ─── Helpers ─────────────────────────────────────────────────────

function filenameStem(filename: string): string {
  return filename.replace(/\.csv$/, "")
}

function extractCards(csvText: string, filename: string, packId: string): CardEntry[] {
  const stem = filenameStem(filename)

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  const cards: CardEntry[] = []

  result.data.forEach((row, i) => {
    const padded = String(i).padStart(3, "0")
    let text: string | undefined
    const id = `${stem}_${padded}`

    if (filename.startsWith("vocab")) {
      text = row["Word"]?.trim()
    } else if (filename.startsWith("phrase") || filename.startsWith("brit_slang") || filename.startsWith("brit_cultural")) {
      text = (row["English Phrase"] || row["English Expression"])?.trim()
    } else if (filename.startsWith("sentence")) {
      text = row["English Sentence"]?.trim()
    } else if (filename.startsWith("brit_vocabulary_swaps")) {
      text = row["British English"]?.trim()
    } else if (filename.startsWith("brit_understatement")) {
      text = row["What They Said"]?.trim()
    } else {
      text = (row["English Phrase"] || row["Word"] || row["English Sentence"])?.trim()
    }

    if (text) {
      cards.push({ id, text, lang: "en-GB" })
    }
  })

  return cards
}

async function generateSpeech(text: string, voiceId: string): Promise<Buffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs API error ${response.status}: ${await response.text()}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) throw err
      console.warn(`  Retry ${attempt}/${retries - 1}...`)
      await new Promise((r) => setTimeout(r, delayMs * attempt))
    }
  }
  throw new Error("unreachable")
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  // Validate env
  const missing = [
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_VOICE_ID_GB",
    "ELEVENLABS_VOICE_ID_US",
    "BLOB_READ_WRITE_TOKEN",
  ].filter((k) => !process.env[k])

  if (missing.length > 0) {
    console.error(`Missing env vars: ${missing.join(", ")}`)
    process.exit(1)
  }

  // Build set of already-uploaded pathnames for fast skip check
  console.log("Fetching existing blobs...")
  const existingPaths = new Set<string>()
  let cursor: string | undefined
  do {
    const result = await list({ cursor, limit: 1000 })
    for (const blob of result.blobs) {
      // pathname is the path after the store prefix, e.g. "audio/en-GB/phrase_part1_clean_000.mp3"
      existingPaths.add(blob.pathname)
    }
    cursor = result.cursor
  } while (cursor)
  console.log(`${existingPaths.size} blobs already uploaded`)

  // Discover all packs
  const packDirs = fs
    .readdirSync(PUBLIC_DIR)
    .filter((d) => fs.statSync(path.join(PUBLIC_DIR, d)).isDirectory())

  const allCards: CardEntry[] = []

  for (const packId of packDirs) {
    const manifestPath = path.join(PUBLIC_DIR, packId, "manifest.json")
    if (!fs.existsSync(manifestPath)) continue

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
    const files: string[] = manifest.files || []

    for (const file of files) {
      const csvPath = path.join(PUBLIC_DIR, packId, file)
      if (!fs.existsSync(csvPath)) continue

      const csvText = fs.readFileSync(csvPath, "utf-8")
      const cards = extractCards(csvText, file, packId)
      allCards.push(...cards)
    }
  }

  // Deduplicate by id
  const uniqueCards = Array.from(new Map(allCards.map((c) => [c.id, c])).values())
  console.log(`Found ${uniqueCards.length} unique cards\n`)

  let skipped = 0
  let generated = 0
  let failed = 0

  for (const card of uniqueCards) {
    for (const accent of ACCENTS) {
      const voiceId = VOICE_IDS[accent]
      const pathname = `audio/${accent}/${card.id}.mp3`

      if (existingPaths.has(pathname)) {
        skipped++
        continue
      }

      try {
        const mp3 = await withRetry(() => generateSpeech(card.text, voiceId))
        await put(pathname, mp3, {
          access: "public",
          contentType: "audio/mpeg",
          addRandomSuffix: false,
        })
        console.log(`✓ ${pathname}`)
        generated++
        await sleep(200)
      } catch (err) {
        console.error(`✗ ${pathname}: ${err}`)
        failed++
      }
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped, ${failed} failed`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
