import { api } from "@/api"
import type { Session, UserRole } from "../types"

export async function getSession() {
  return api.get<Session | null>("/api/auth/get-session")
}

export async function signIn(input: { email: string; password: string }) {
  return api.post<typeof input, { user: Session["user"] }>("/api/auth/sign-in/email", input)
}

export async function requestEmployeeSignIn(input: { email: string }) {
  const frontendOrigin = window.location.origin
  return api.post<{
    email: string
    callbackURL: string
    newUserCallbackURL: string
    errorCallbackURL: string
    metadata: { purpose: "employee-login" }
  }, { status: boolean }>("/api/auth/sign-in/magic-link", {
    email: input.email.trim().toLocaleLowerCase(),
    callbackURL: `${frontendOrigin}/employee`,
    newUserCallbackURL: `${frontendOrigin}/employee`,
    errorCallbackURL: `${frontendOrigin}/employee/sign-in`,
    metadata: { purpose: "employee-login" },
  })
}

export async function signOut() {
  return api.post<undefined, { success: boolean }>("/api/auth/sign-out")
}

export async function getMembership() {
  return (await api.get<{ data: { userId: string; email: string; role: UserRole } }>("/api/me")).data
}
