export type EvaluationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export type EvaluationListItem = {
  id: string
  attemptId: string
  status: EvaluationStatus
  overallScore: number | null
  employeeName: string
  employeeEmail: string
  assessmentId: string
  assessmentName: string
  versionNumber: number
  completedAt: string | null
  updatedAt: string
}

export type EvaluationFilters = { status?: EvaluationStatus; assessmentId?: string }
