import { describe, expect, it } from "vitest"
import { homePathForRole } from "./routing"

describe("homePathForRole", () => {
  it("keeps all authentication states distinct", () => {
    expect(homePathForRole("ADMIN")).toBe("/admin")
    expect(homePathForRole("EMPLOYEE")).toBe("/employee")
    expect(homePathForRole("UNASSIGNED")).toBe("/access-pending")
  })
})
