export type Accent = "en-GB" | "en-US"

export interface SpeakerOptions {
  accent?: Accent
  rate?: number
  pitch?: number
}

let voicesLoaded = false
let cachedVoices: SpeechSynthesisVoice[] = []

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

function pickVoice(
  voices: SpeechSynthesisVoice[],
  accent: Accent,
): SpeechSynthesisVoice | undefined {
  // Collect all matching voices, then pick one at random
  const exact = voices.filter((v) => v.lang === accent)
  if (exact.length > 0) return exact[Math.floor(Math.random() * exact.length)]

  const prefix = voices.filter((v) => v.lang.startsWith(accent))
  if (prefix.length > 0) return prefix[Math.floor(Math.random() * prefix.length)]

  const any = voices.filter((v) => v.lang.startsWith("en"))
  if (any.length > 0) return any[Math.floor(Math.random() * any.length)]

  return undefined
}

export function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

export function speak(
  text: string,
  options: SpeakerOptions = {},
): Promise<void> {
  if (!isSupported()) {
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

export function stop(): void {
  if (!isSupported()) return
  window.speechSynthesis.cancel()
}

export async function getAvailableVoices(accent: Accent): Promise<SpeechSynthesisVoice[]> {
  if (!isSupported()) return []
  const voices = await ensureVoices()
  return voices.filter((v) => v.lang.startsWith(accent.split("-")[0]))
}
