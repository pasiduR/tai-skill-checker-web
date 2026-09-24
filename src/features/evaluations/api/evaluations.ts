import { api } from "@/api"
import type { EvaluationFilters, EvaluationListItem } from "../types"
import { evaluationQuery } from "../evaluationFormat"

type Envelope<T> = { data: T }

export async function listEvaluations(filters: EvaluationFilters) {
  const suffix = evaluationQuery(filters)
  return (await api.get<Envelope<EvaluationListItem[]>>(`/api/admin/evaluations${suffix}`)).data
}

export async function retryEvaluation(evaluationId: string) {
  return (await api.post<undefined, Envelope<{ id: string; status: "PENDING" }>>(`/api/admin/evaluations/${evaluationId}/retry`)).data
}
