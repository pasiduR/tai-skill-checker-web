import { api } from "@/api"
import type { Assessment, AssessmentSummary, AssessmentVersion, Competency, Resource, Rubric, Scenario } from "../types"

type Envelope<T> = { data: T }
type OverviewInput = { name: string; description: string; preparationInstructions: string }

export const listAssessments = async () => (await api.get<Envelope<AssessmentSummary[]>>("/api/assessments")).data
export const getAssessment = async (id: string) => (await api.get<Envelope<Assessment>>(`/api/assessments/${id}`)).data
export const getAssessmentVersion = async (assessmentId: string, versionId: string) => (await api.get<Envelope<Omit<Assessment, "status" | "latestVersionNumber" | "currentPublishedVersionId" | "versions">>>(`/api/assessments/${assessmentId}/versions/${versionId}`)).data
export const createAssessment = async (input: OverviewInput) => (await api.post<OverviewInput, Envelope<AssessmentSummary>>("/api/assessments", input)).data
export const updateAssessment = async (id: string, input: OverviewInput) => (await api.put<OverviewInput, Envelope<AssessmentSummary>>(`/api/assessments/${id}`, input)).data
export const addCompetency = async (assessmentId: string, input: Omit<Competency, "id">) => (await api.post<typeof input, Envelope<Competency>>(`/api/assessments/${assessmentId}/competencies`, input)).data
export const updateCompetency = async (assessmentId: string, competencyId: string, input: Omit<Competency, "id">) => (await api.put<typeof input, Envelope<Competency>>(`/api/assessments/${assessmentId}/competencies/${competencyId}`, input)).data
export const addRubric = async (assessmentId: string, input: Omit<Rubric, "id">) => (await api.post<typeof input, Envelope<Rubric>>(`/api/assessments/${assessmentId}/rubrics`, input)).data
export const updateRubric = async (assessmentId: string, rubricId: string, input: Omit<Rubric, "id" | "competencyId">) => (await api.put<typeof input, Envelope<Rubric>>(`/api/assessments/${assessmentId}/rubrics/${rubricId}`, input)).data
export const addScenario = async (assessmentId: string, input: Omit<Scenario, "id">) => (await api.post<typeof input, Envelope<Scenario>>(`/api/assessments/${assessmentId}/scenarios`, input)).data
export const updateScenario = async (assessmentId: string, scenarioId: string, input: Omit<Scenario, "id">) => (await api.put<typeof input, Envelope<Scenario>>(`/api/assessments/${assessmentId}/scenarios/${scenarioId}`, input)).data
export const mapScenarioCompetency = async (assessmentId: string, input: { scenarioId: string; competencyId: string }) => (await api.post<typeof input, Envelope<unknown>>(`/api/assessments/${assessmentId}/scenario-competencies`, input)).data
export const generateAssessment = async (assessmentId: string, input: { brief: string }) => (await api.post<typeof input, Envelope<unknown>>(`/api/assessments/${assessmentId}/generate`, input)).data
export const publishAssessment = async (assessmentId: string) => (await api.post<undefined, Envelope<AssessmentVersion>>(`/api/assessments/${assessmentId}/publish`)).data
export const uploadResource = async (assessmentId: string, file: File) => {
  const form = new FormData(); form.set("file", file)
  return (await api.post<FormData, Envelope<Resource>>(`/api/assessments/${assessmentId}/resources`, form)).data
}
export const processResource = async (assessmentId: string, resourceId: string) => (await api.post<undefined, Envelope<Resource>>(`/api/assessments/${assessmentId}/resources/${resourceId}/process`)).data
