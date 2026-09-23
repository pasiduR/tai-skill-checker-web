import { describe, expect, it } from "vitest"
import { getLatestAgentCaption } from "./captions"

describe("getLatestAgentCaption", () => {
  it("shows only the newest non-empty interviewer caption", () => {
    expect(getLatestAgentCaption([
      { participantInfo: { identity: "agent-interviewer" }, text: " First question " },
      { participantInfo: { identity: "employee-123" }, text: "My private answer" },
      { participantInfo: { identity: "agent-interviewer" }, text: " Follow-up question " },
    ])).toBe("Follow-up question")
  })

  it("does not turn employee speech into a caption", () => {
    expect(getLatestAgentCaption([
      { participantInfo: { identity: "employee-123" }, text: "My answer" },
      { participantInfo: { identity: "agent-interviewer" }, text: "   " },
    ])).toBeUndefined()
  })
})
