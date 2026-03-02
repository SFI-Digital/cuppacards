const isClient = typeof window !== "undefined"

const storage = {
  get<T>(key: string): T | null {
    if (!isClient) return null
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): boolean {
    if (!isClient) return false
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      console.warn(`[storage] Failed to write key "${key}" — quota may be exceeded`)
      return false
    }
  },

  remove(key: string): void {
    if (!isClient) return
    localStorage.removeItem(key)
  },

  clear(): void {
    if (!isClient) return
    localStorage.clear()
  },

  has(key: string): boolean {
    if (!isClient) return false
    return localStorage.getItem(key) !== null
  },

  keys(): string[] {
    if (!isClient) return []
    return Object.keys(localStorage)
  },
}

export default storage
