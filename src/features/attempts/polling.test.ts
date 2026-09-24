import { describe, expect, it } from "vitest"
import { shouldPollAttemptInspection } from "./polling"
import type { AttemptInspection } from "./types"

function inspection(status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null): AttemptInspection {
  return {
    attempt: { id: "attempt", status: "PROCESSING", currentScenarioId: null, startedAt: null, completedAt: null, updatedAt: "2026-01-01" },
    assessment: { id: "assessment", name: "Test", description: "" }, scenarios: [], turns: [], progress: [], events: [],
    evaluation: status ? { id: "evaluation", status, overallScore: null, strengths: null, gaps: null, recommendations: null, errorMessage: null, competencyScores: [] } : null,
  }
}

describe("attempt report polling", () => {
  it("continues for queued work and stops for terminal evaluation states", () => {
    expect(shouldPollAttemptInspection(inspection(null))).toBe(true)
    expect(shouldPollAttemptInspection(inspection("PENDING"))).toBe(true)
    expect(shouldPollAttemptInspection(inspection("PROCESSING"))).toBe(true)
    expect(shouldPollAttemptInspection(inspection("FAILED"))).toBe(false)
    expect(shouldPollAttemptInspection(inspection("COMPLETED"))).toBe(false)
  })
})
