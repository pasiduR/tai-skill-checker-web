import type { AuthRole } from "./types"

export function homePathForRole(role: AuthRole | undefined) {
  if (role === "ADMIN") return "/admin"
  if (role === "EMPLOYEE") return "/employee"
  return "/setup"
}
