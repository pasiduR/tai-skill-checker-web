import { describe, expect, it } from "vitest"
import { emailsSchema } from "./schemas"

describe("emailsSchema", () => {
  it("normalizes and deduplicates comma and newline separated addresses", () => {
    expect(emailsSchema.parse(" Alex@Example.com, sam@example.com\nalex@example.com ")).toEqual(["alex@example.com", "sam@example.com"])
  })

  it("rejects invalid input", () => {
    expect(emailsSchema.safeParse("not-an-email").success).toBe(false)
  })

  it("returns a user-facing limit for more than 100 addresses", () => {
    const input = Array.from({ length: 101 }, (_, index) => `person${index}@example.com`).join("\n")
    expect(emailsSchema.safeParse(input).error?.issues[0]?.message).toBe("You can invite up to 100 employees at a time.")
  })
})
