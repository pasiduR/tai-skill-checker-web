import { api } from "@/api"
import type { CompetencyPreview } from "@/features/assignments/types"

export type InvitationResult = { expiresAt: string; invitations: Array<{ invitationId: string; email: string; sent: boolean }> }

export async function inviteEmployees(assessmentId: string, emails: string[]) {
  return (await api.post<{ emails: string[] }, { data: InvitationResult }>(`/api/assessments/${assessmentId}/invitations`, { emails })).data
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
