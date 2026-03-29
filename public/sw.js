const CACHE_NAME = "cuppa-v1773060263612"
const AUDIO_CACHE_NAME = "cuppa-audio-v1"

const PRECACHE_URLS = [
  "/",
  "/session",
  "/session/result",
  "/progress",
  "/settings",
  "/content/core/manifest.json",
  "/content/core/phrase_part1_clean.csv",
  "/content/core/phrase_part2_clean.csv",
  "/content/core/phrase_part3_clean.csv",
  "/content/core/vocabulary_part1_clean.csv",
  "/content/core/vocabulary_part2_clean.csv",
  "/content/core/vocabulary_part3_clean.csv",
  "/content/core/sentence_part1.csv",
  "/content/core/sentence_part2.csv",
  "/content/core/sentence_part3.csv",
]

// Install — precache app shell + all CSV content
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate — clean old caches (audio cache is intentionally kept across app version bumps)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== AUDIO_CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// Listen for skip-waiting message from client
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

async function cacheFirstAudio(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(AUDIO_CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response("", { status: 408, statusText: "Offline" })
  }
}

// Fetch — network first with cache fallback for everything
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache-first for Vercel Blob audio files (cross-origin)
  if (request.method === "GET" && url.hostname.endsWith(".blob.vercel-storage.com")) {
    event.respondWith(cacheFirstAudio(request))
    return
  }

  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin) return
  if (request.method !== "GET") return

  // Skip dev-only requests (HMR websocket, hot updates)
  if (
    url.pathname.includes("webpack-hmr") ||
    url.pathname.includes("__nextjs") ||
    url.pathname.includes("_next/hot-update")
  ) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // For navigation requests, fall back to cached home page
          if (request.mode === "navigate") {
            return caches.match("/")
          }
          // Return empty response instead of 503 to avoid console errors
          return new Response("", { status: 408, statusText: "Offline" })
        })
      })
  )
})
