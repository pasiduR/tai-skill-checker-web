import { describe, expect, it } from "vitest"
import { emailsSchema } from "./schemas"

describe("emailsSchema", () => {
  it("normalizes and deduplicates comma and newline separated addresses", () => {
    expect(emailsSchema.parse(" Alex@Example.com, sam@example.com\nalex@example.com ")).toEqual(["alex@example.com", "sam@example.com"])
  })

  it("rejects invalid input", () => {
    expect(emailsSchema.safeParse("not-an-email").success).toBe(false)
  })
})
