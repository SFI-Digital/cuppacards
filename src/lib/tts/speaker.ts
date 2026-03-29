export type Accent = "en-GB" | "en-US"

export interface SpeakerOptions {
  accent?: Accent
  rate?: number
  pitch?: number
  cardId?: string
}

let voicesLoaded = false
let cachedVoices: SpeechSynthesisVoice[] = []
let currentAudio: HTMLAudioElement | null = null

function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesLoaded) return Promise.resolve(cachedVoices)

  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    cachedVoices = voices
    voicesLoaded = true
    return Promise.resolve(cachedVoices)
  }

  // Chrome loads voices asynchronously
  return new Promise((resolve) => {
    const onVoicesChanged = () => {
      cachedVoices = window.speechSynthesis.getVoices()
      voicesLoaded = true
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged)
      resolve(cachedVoices)
    }
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged)
  })
}

// Known good voices across platforms (macOS, iOS, Windows, Android, Chrome, Firefox)
const ALLOWED_VOICES = new Set([
  // macOS / iOS native
  "Daniel", "Arthur", "Martha", "Samantha", "Aaron", "Nicky",
  "Catherine", "Gordon", "Karen", "Moira", "Rishi", "Tessa",
  // Google (Chrome on all platforms)
  "Google US English", "Google UK English Female", "Google UK English Male",
  // Windows
  "Microsoft David", "Microsoft Zira", "Microsoft Mark",
  "Microsoft Hazel", "Microsoft Susan", "Microsoft George",
  // Android
  "English United States", "English United Kingdom",
])

function isAllowedVoice(voice: SpeechSynthesisVoice): boolean {
  // Check exact name match
  if (ALLOWED_VOICES.has(voice.name)) return true
  // Check if voice name starts with any allowed name (handles variants like "Daniel (English (United Kingdom))")
  for (const allowed of ALLOWED_VOICES) {
    if (voice.name.startsWith(allowed)) return true
  }
  return false
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  accent: Accent,
): SpeechSynthesisVoice | undefined {
  // 1. Try allowlisted voices matching the exact accent
  const exactAllowed = voices.filter((v) => v.lang === accent && isAllowedVoice(v))
  if (exactAllowed.length > 0) return pickRandom(exactAllowed)

  // 2. Try allowlisted voices with accent prefix (e.g. en-GB-*)
  const prefixAllowed = voices.filter((v) => v.lang.startsWith(accent) && isAllowedVoice(v))
  if (prefixAllowed.length > 0) return pickRandom(prefixAllowed)

  // 3. Try allowlisted voices for any English
  const anyAllowed = voices.filter((v) => v.lang.startsWith("en") && isAllowedVoice(v))
  if (anyAllowed.length > 0) return pickRandom(anyAllowed)

  // 4. Fallback: any voice matching the accent (for unknown platforms)
  const exactAny = voices.filter((v) => v.lang === accent)
  if (exactAny.length > 0) return pickRandom(exactAny)

  const prefixAny = voices.filter((v) => v.lang.startsWith(accent))
  if (prefixAny.length > 0) return pickRandom(prefixAny)

  return voices.find((v) => v.lang.startsWith("en"))
}

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error(`Audio load failed: ${url}`))
    audio.play().catch(reject)
  })
}

function speakWithSynthesis(text: string, options: SpeakerOptions): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.reject(new Error("Speech synthesis not supported"))
  }

  // Cancel any current speech
  window.speechSynthesis.cancel()

  return ensureVoices().then(
    (voices) =>
      new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = options.accent || "en-GB"
        utterance.rate = options.rate ?? 0.9
        utterance.pitch = options.pitch ?? 1.0

        const voice = pickVoice(voices, options.accent || "en-GB")
        if (voice) utterance.voice = voice

        utterance.onend = () => resolve()
        utterance.onerror = (e) => {
          // Ignore "canceled" errors — these are expected when we call cancel()
          // before starting a new utterance
          if (e.error === "canceled") {
            resolve()
            return
          }
          reject(e)
        }

        window.speechSynthesis.speak(utterance)
      }),
  )
}

export function isSupported(): boolean {
  if (typeof window === "undefined") return false
  const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL
  if (blobBase) return true
  return "speechSynthesis" in window
}

export function speak(
  text: string,
  options: SpeakerOptions = {},
): Promise<void> {
  const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL
  const { cardId, accent = "en-GB" } = options

  if (blobBase && cardId) {
    return playAudioUrl(`${blobBase}/audio/${accent}/${cardId}.mp3`).catch(() =>
      speakWithSynthesis(text, options),
    )
  }

  return speakWithSynthesis(text, options)
}

export function stop(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel()
  }
}

export async function getAvailableVoices(accent: Accent): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return []
  const voices = await ensureVoices()
  return voices.filter((v) => v.lang.startsWith(accent.split("-")[0]))
}
