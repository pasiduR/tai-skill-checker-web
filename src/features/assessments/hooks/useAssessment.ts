import { queryOptions, useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/api"
import { getAssessment, listAssessments } from "../api/assessments"

export const useAssessments = () => useQuery({ queryKey: queryKeys.assessments, queryFn: listAssessments })
export const assessmentQuery = (id: string) => queryOptions({ queryKey: queryKeys.assessment(id), queryFn: () => getAssessment(id) })
export const useAssessment = (id: string) => useQuery({ ...assessmentQuery(id), enabled: Boolean(id) })
