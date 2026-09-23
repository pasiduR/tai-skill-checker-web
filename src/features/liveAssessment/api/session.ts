import { api } from "@/api"

export async function abandonAttempt(attemptId: string) {
  return (await api.post<undefined, { data: { status: "ABANDONED" } }>(`/api/attempts/${attemptId}/abandon`)).data
}
