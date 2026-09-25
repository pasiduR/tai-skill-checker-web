import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/api"
import { listEvaluations, retryEvaluation } from "../api/evaluations"
import type { EvaluationFilters } from "../types"

export const useEvaluations = (filters: EvaluationFilters) => useQuery({
  queryKey: queryKeys.evaluations(filters.status ?? "ALL", filters.assessmentId ?? "ALL"),
  queryFn: () => listEvaluations(filters),
  // Keep the current rows on screen while a new filter combination loads instead of dropping back to the skeleton.
  placeholderData: keepPreviousData,
  refetchInterval: (query) => query.state.data?.some((item) => item.status === "PENDING" || item.status === "PROCESSING") ? 5_000 : false,
})

export const useRetryEvaluation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: retryEvaluation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.evaluationsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.attemptInspections }),
      ])
    },
  })
}
