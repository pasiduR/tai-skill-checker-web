import { describe, expect, it } from "vitest"
import { agentSettingsSchema } from "./schemas"

const validSettings = {
  systemPrompt: "Use a calm and professional interviewing style.",
  welcomeMessage: "Welcome.",
  closingMessage: "Thank you.",
  voice: "Kore" as const,
  temperature: 0.8,
  topP: 0.95,
  maxOutputTokens: 1024,
}

describe("agentSettingsSchema", () => {
  it("accepts supported settings", () => {
    expect(agentSettingsSchema.safeParse(validSettings).success).toBe(true)
  })

  it("rejects the values previously sent to the backend", () => {
    const result = agentSettingsSchema.safeParse({ ...validSettings, systemPrompt: "too short", maxOutputTokens: 1 })
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "System prompt must be at least 20 characters.",
      "Maximum response tokens must be at least 64.",
    ])
  })
})
