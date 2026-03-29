/**
 * Score a user-typed translation against the expected answer.
 * Case-insensitive, trims whitespace, normalises punctuation.
 * If `expected` contains "/" (e.g. "Tube/Underground"), any variant is accepted.
 */
export function scoreTranslation(
  userAnswer: string,
  expected: string,
): { correct: boolean; similarity: number } {
  const normalise = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:'"()[\]{}]/g, "")
      .replace(/\s+/g, " ")

  const a = normalise(userAnswer)

  // Split on "/" to support multiple acceptable answers (e.g. "Tube/Underground")
  const variants = expected.split("/").map((v) => normalise(v.trim()))

  let bestSimilarity = 0

  for (const b of variants) {
    if (a === b) return { correct: true, similarity: 1 }

    const longer = a.length >= b.length ? a : b
    const shorter = a.length < b.length ? a : b

    if (longer.length === 0) continue

    const dist = levenshtein(shorter, longer)
    const similarity = (longer.length - dist) / longer.length

    if (similarity > bestSimilarity) bestSimilarity = similarity
  }

  // Accept if >= 85% similar to any variant (allows minor typos)
  return { correct: bestSimilarity >= 0.85, similarity: bestSimilarity }
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  )

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[m][n]
}
