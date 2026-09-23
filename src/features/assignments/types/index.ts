export type CompetencyPreview = { name: string; description: string }

export type AssignmentStatus = "PENDING" | "READY" | "COMPLETED" | "EXPIRED" | "CANCELLED"

export type AssignmentPreparation = {
  assignmentId: string
  status: AssignmentStatus
  assessmentId: string
  assessmentVersionId: string
  name: string
  description: string
  preparationInstructions: string
  competencies: CompetencyPreview[]
  attemptsUsed: number
  attemptsRemaining: number
}

export type StartedAttempt = {
  attemptId: string
  roomName: string
  attemptNumber: number
  token: string
  url: string
}

export type EmployeeAssignmentSummary = {
  assignmentId: string
  status: Exclude<AssignmentStatus, "CANCELLED">
  assessmentId: string
  name: string
  description: string
  updatedAt: string
  attemptsUsed: number
  attemptsRemaining: number
  latestAttemptStatus: "READY" | "IN_PROGRESS" | "PROCESSING" | "COMPLETED" | "ABANDONED" | "FAILED" | "EXPIRED" | null
  hasActiveAttempt: boolean
}
