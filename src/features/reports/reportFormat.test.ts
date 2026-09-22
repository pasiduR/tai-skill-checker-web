import { describe, expect, it } from "vitest"
import { scoreLabel, scorePercentage } from "./reportFormat"

describe("report score formatting", () => {
  it("converts the internal five point score to a percentage", () => {
    expect(scorePercentage(4)).toBe(80)
    expect(scoreLabel(4)).toBe("4 / 5")
  })

  it("keeps malformed and out of range values safe for display", () => {
    expect(scorePercentage(Number.NaN)).toBe(0)
    expect(scorePercentage(6)).toBe(100)
    expect(scorePercentage(-1)).toBe(0)
  })
})
