import type { StartedAttempt } from "@/features/assignments"

export type SessionState =
  | "CONNECTING"
  | "CONNECTED"
  | "LISTENING"
  | "AGENT_SPEAKING"
  | "EMPLOYEE_SPEAKING"
  | "ENDING"
  | "DISCONNECTED"
  | "ERROR"

export type AssessmentSessionLocationState = { connection: StartedAttempt; assessmentTitle: string; microphoneDeviceId?: string }
