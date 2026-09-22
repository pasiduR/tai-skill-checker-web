import { api } from "@/api"
import type { Session, UserRole } from "../types"

export async function getSession() {
  return api.get<Session | null>("/api/auth/get-session")
}

export async function signIn(input: { email: string; password: string }) {
  return api.post<typeof input, { user: Session["user"] }>("/api/auth/sign-in/email", input)
}

export async function signOut() {
  return api.post<undefined, { success: boolean }>("/api/auth/sign-out")
}

export async function getMembership() {
  return (await api.get<{ data: { userId: string; email: string; role: UserRole } }>("/api/me")).data
}

export async function bootstrapOrganization(input: { organizationName: string; slug: string }) {
  return (await api.post<typeof input, { data: { role: "ADMIN" } }>("/api/bootstrap", input)).data
}
