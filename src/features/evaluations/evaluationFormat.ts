import type { EvaluationFilters, EvaluationStatus } from "./types"

export const evaluationStatusLabel: Record<EvaluationStatus, string> = {
  PENDING: "Queued",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
}

export function evaluationQuery(filters: EvaluationFilters) {
  const query = new URLSearchParams()
  if (filters.status) query.set("status", filters.status)
  if (filters.assessmentId) query.set("assessmentId", filters.assessmentId)
  return query.size ? `?${query.toString()}` : ""
}
