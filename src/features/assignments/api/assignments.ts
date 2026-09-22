import { api } from "@/api"
import type { AssignmentPreparation, StartedAttempt } from "../types"

export async function getAssignmentPreparation(assignmentId: string) {
  return (await api.get<{ data: AssignmentPreparation }>(`/api/assignments/${assignmentId}/preparation`)).data
}

export async function startAttempt(assignmentId: string) {
  return (await api.post<undefined, { data: StartedAttempt }>(`/api/assignments/${assignmentId}/attempts`)).data
}
