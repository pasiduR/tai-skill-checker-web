export type AttemptStatus = "READY" | "IN_PROGRESS" | "PROCESSING" | "COMPLETED" | "ABANDONED" | "FAILED" | "EXPIRED"
export type AttemptSpeaker = "EMPLOYEE" | "AGENT" | "SYSTEM"

export type ActiveAttempt = {
  attemptId: string
  status: AttemptStatus
  roomName: string | null
  currentScenarioId: string | null
  lastHeartbeatAt: string | null
  employeeUserId: string
  employeeName: string
  employeeEmail: string
  assessmentId: string
}

export type AttemptTurn = {
  id: string
  attemptId: string
  scenarioId: string | null
  speaker: AttemptSpeaker
  content: string
  sequence: number
  startedAt: string | null
  endedAt: string | null
  createdAt: string
}

export type AttemptScenario = {
  id: string
  title: string
  prompt: string
  followUpGuidance: string
  position: number
}

export type CompetencyScore = {
  id: string
  competencyId: string
  competencyName: string
  score: number
  maxScore: number
  reasoning: string
  evidence: Array<{ id: string; attemptTurnId: string; reason: string }>
}

export type AttemptEvaluation = {
  id: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  overallScore: number | null
  maxScore?: number
  strengths: string[] | null
  gaps: string[] | null
  recommendations: string[] | null
  errorMessage: string | null
  competencyScores: CompetencyScore[]
}

export type AttemptInspection = {
  attempt: {
    id: string
    status: AttemptStatus
    currentScenarioId: string | null
    startedAt: string | null
    completedAt: string | null
    updatedAt: string
  }
  assessment: { id: string; name: string; description: string }
  scenarios: AttemptScenario[]
  turns: AttemptTurn[]
  progress: Array<{ id: string; scenarioId: string; position: number; completedAt: string | null }>
  events: Array<{ id: string; type: string; createdAt: string }>
  evaluation?: AttemptEvaluation | null
}

export type ObserverConnection = { url: string; token: string }
export type RecordingPlayback = {
  url: string
  expiresInSeconds: number
  recording: { id: string; mimeType: string; byteSize: number | null; durationSeconds: number | null }
}
