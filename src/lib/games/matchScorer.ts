/**
 * Score a user-typed translation against the expected answer.
 * Case-insensitive, trims whitespace, normalises punctuation.
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
  const b = normalise(expected)

  if (a === b) return { correct: true, similarity: 1 }

  // Calculate simple similarity (character overlap)
  const longer = a.length >= b.length ? a : b
  const shorter = a.length < b.length ? a : b

  if (longer.length === 0) return { correct: false, similarity: 0 }

  // Levenshtein distance
  const dist = levenshtein(shorter, longer)
  const similarity = (longer.length - dist) / longer.length

  // Accept if >= 85% similar (allows minor typos)
  return { correct: similarity >= 0.85, similarity }
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
