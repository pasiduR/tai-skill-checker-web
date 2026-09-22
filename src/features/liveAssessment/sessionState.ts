import { ConnectionState } from "livekit-client"
import type { SessionState } from "./types"

export function resolveSessionState(input: {
  connectionState: ConnectionState
  agentState?: string
  employeeSpeaking: boolean
  ending: boolean
  failed: boolean
}): SessionState {
  if (input.failed) return "ERROR"
  if (input.ending) return "ENDING"
  if (input.connectionState === ConnectionState.Disconnected) return "DISCONNECTED"
  if (input.connectionState !== ConnectionState.Connected) return "CONNECTING"
  if (input.employeeSpeaking) return "EMPLOYEE_SPEAKING"
  if (input.agentState === "speaking") return "AGENT_SPEAKING"
  if (input.agentState === "listening") return "LISTENING"
  return "CONNECTED"
}

export const sessionStateLabel: Record<SessionState, string> = {
  CONNECTING: "Connecting securely…",
  CONNECTED: "Connected",
  LISTENING: "Listening for your response",
  AGENT_SPEAKING: "Interviewer is speaking",
  EMPLOYEE_SPEAKING: "You are speaking",
  ENDING: "Ending assessment…",
  DISCONNECTED: "Session disconnected",
  ERROR: "Connection problem",
}
