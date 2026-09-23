import { describe, expect, it } from "vitest"
import { ConnectionState } from "livekit-client"
import { resolveSessionState } from "./sessionState"

describe("resolveSessionState", () => {
  it("gives terminal and transition states priority", () => {
    expect(resolveSessionState({ connectionState: ConnectionState.Connected, employeeSpeaking: true, ending: false, failed: true })).toBe("ERROR")
    expect(resolveSessionState({ connectionState: ConnectionState.Connected, employeeSpeaking: true, ending: true, failed: false })).toBe("ENDING")
    expect(resolveSessionState({ connectionState: ConnectionState.Disconnected, employeeSpeaking: false, ending: false, failed: false })).toBe("DISCONNECTED")
  })

  it("represents both sides of an active conversation", () => {
    expect(resolveSessionState({ connectionState: ConnectionState.Connected, agentState: "speaking", employeeSpeaking: false, ending: false, failed: false })).toBe("AGENT_SPEAKING")
    expect(resolveSessionState({ connectionState: ConnectionState.Connected, agentState: "listening", employeeSpeaking: false, ending: false, failed: false })).toBe("LISTENING")
    expect(resolveSessionState({ connectionState: ConnectionState.Connected, agentState: "speaking", employeeSpeaking: true, ending: false, failed: false })).toBe("AGENT_SPEAKING")
  })
})
