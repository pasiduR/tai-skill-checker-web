import { api } from "@/api"

export type InvitationResult = { expiresAt: string; invitations: Array<{ invitationId: string; email: string; sent: boolean }> }

export async function inviteEmployees(assessmentId: string, emails: string[]) {
  return (await api.post<{ emails: string[] }, { data: InvitationResult }>(`/api/assessments/${assessmentId}/invitations`, { emails })).data
}
