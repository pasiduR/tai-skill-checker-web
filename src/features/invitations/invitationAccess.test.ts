import { describe, expect, it } from "vitest"
import { matchesInvitationEmail } from "./invitationAccess"

describe("matchesInvitationEmail", () => {
  it("matches email addresses without case sensitivity", () => {
    expect(matchesInvitationEmail("Employee@Example.com", "employee@example.com")).toBe(true)
  })

  it("rejects a different or missing signed-in account", () => {
    expect(matchesInvitationEmail("admin@example.com", "employee@example.com")).toBe(false)
    expect(matchesInvitationEmail(undefined, "employee@example.com")).toBe(false)
  })
})
