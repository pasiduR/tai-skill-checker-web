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
