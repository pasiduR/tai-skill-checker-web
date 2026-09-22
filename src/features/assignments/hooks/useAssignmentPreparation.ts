import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/api"
import { getAssignmentPreparation } from "../api/assignments"

export function useAssignmentPreparation(assignmentId: string) {
  return useQuery({
    queryKey: queryKeys.assignmentPreparation(assignmentId),
    queryFn: () => getAssignmentPreparation(assignmentId),
    enabled: Boolean(assignmentId),
    retry: false,
  })
}
