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
  // Exact match first (e.g. en-GB)
  const exact = voices.find((v) => v.lang === accent)
  if (exact) return exact

  // Prefix match (e.g. en-GB-*)
  const prefix = voices.find((v) => v.lang.startsWith(accent))
  if (prefix) return prefix

  // Any English voice as fallback
  return voices.find((v) => v.lang.startsWith("en"))
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
        utterance.onerror = (e) => reject(e)

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
