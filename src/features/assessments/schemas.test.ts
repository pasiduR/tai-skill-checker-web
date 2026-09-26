import { describe, expect, it } from "vitest"
import { competencySchema, generationSchema, overviewSchema, rubricSchema, scenarioSchema } from "./schemas"

describe("assessment form schemas", () => {
  it("returns user-facing overview limits", () => {
    const result = overviewSchema.safeParse({ name: "a".repeat(201), description: "Valid", preparationInstructions: "" })
    expect(result.error?.issues[0]?.message).toBe("Assessment name must be 200 characters or fewer.")
  })

  it("validates editor fields with actionable messages", () => {
    expect(competencySchema.safeParse({ name: "", description: "" }).error?.issues.map((issue) => issue.message)).toEqual([
      "Competency name is required.",
      "Competency description is required.",
    ])
    expect(scenarioSchema.safeParse({ title: "", prompt: "", followUpGuidance: "", competencyId: "" }).error?.issues.map((issue) => issue.message)).toContain("Choose a competency.")
    expect(generationSchema.safeParse({ brief: "short" }).error?.issues[0]?.message).toBe("Describe the assessment in at least 10 characters.")
  })

  it("normalizes expected behaviours in a valid rubric", () => {
    const result = rubricSchema.parse({
      competencyId: "00000000-0000-4000-8000-000000000001",
      title: "Communication",
      low: "Unclear",
      medium: "Mostly clear",
      high: "Clear and concise",
      expected: " Listens\n\nExplains clearly ",
    })
    expect(result.expected).toEqual(["Listens", "Explains clearly"])
  })
})
