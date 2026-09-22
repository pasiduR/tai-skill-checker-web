import { api } from "@/api"
import type { CompetencyPreview } from "@/features/assignments/types"

export type InvitationResult = { expiresAt: string; invitations: Array<{ invitationId: string; email: string; sent: boolean }> }
export type EmployeeInvitation = {
  invitationId: string
  assignmentId: string
  email: string
  invitationStatus: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  assignmentStatus: "PENDING" | "READY" | "COMPLETED" | "EXPIRED"
  expiresAt: string
  attemptsUsed: number
  attemptsRemaining: number
  hasActiveAttempt: boolean
}

export async function inviteEmployees(assessmentId: string, emails: string[]) {
  return (await api.post<{ emails: string[] }, { data: InvitationResult }>(`/api/assessments/${assessmentId}/invitations`, { emails })).data
}

export async function listEmployeeInvitations(assessmentId: string) {
  return (await api.get<{ data: EmployeeInvitation[] }>(`/api/assessments/${assessmentId}/invitations`)).data
}

export async function reinviteEmployee(assessmentId: string, invitationId: string) {
  return (await api.post<undefined, { data: { invitationId: string; email: string; expiresAt: string; sent: boolean; attemptsRemaining: number } }>(`/api/assessments/${assessmentId}/invitations/${invitationId}/reinvite`)).data
}

export type InvitationPreview = {
  email: string
  expiresAt: string
  assessment: {
    name: string
    description: string
    preparationInstructions: string
    competencies: CompetencyPreview[]
  }
}

export type AcceptedInvitation = { id: string }

export async function getInvitation(token: string) {
  return (await api.get<{ data: InvitationPreview }>(`/api/invitations/${encodeURIComponent(token)}`)).data
}

export async function acceptInvitation(token: string) {
  return (await api.post<undefined, { data: AcceptedInvitation }>(`/api/invitations/${encodeURIComponent(token)}/accept`)).data
}
