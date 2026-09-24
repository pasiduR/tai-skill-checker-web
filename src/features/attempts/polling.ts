import type { AttemptInspection } from "./types"

export function shouldPollAttemptInspection(data: AttemptInspection | undefined) {
  const evaluation = data?.evaluation
  return data?.attempt.status === "PROCESSING" && (!evaluation || evaluation.status === "PENDING" || evaluation.status === "PROCESSING")
}
