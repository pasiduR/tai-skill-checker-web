export type SessionUser = { id: string; name: string; email: string }
export type Session = { user: SessionUser; session: { id: string; expiresAt: string } }
export type UserRole = "ADMIN" | "EMPLOYEE"
export type AuthRole = UserRole | "UNASSIGNED"
