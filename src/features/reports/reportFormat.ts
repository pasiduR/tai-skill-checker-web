export function scorePercentage(score: number, maxScore = 5) {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) return 0
  return Math.round(Math.min(1, Math.max(0, score / maxScore)) * 100)
}

export function scoreLabel(score: number, maxScore = 5) {
  return `${Number.isInteger(score) ? score : score.toFixed(1)} / ${maxScore}`
}
