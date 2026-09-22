export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type ResourceStatus = "UPLOADED" | "PROCESSING" | "READY" | "FAILED"

export type AssessmentSummary = {
  id: string
  name: string
  description: string
  preparationInstructions: string
  status: AssessmentStatus
  latestVersionNumber: number
  currentPublishedVersionId: string | null
  createdAt: string
  updatedAt: string
}

export type Scenario = { id: string; title: string; prompt: string; followUpGuidance: string; position: number }
export type Competency = { id: string; name: string; description: string; position: number }
export type Rubric = { id: string; competencyId: string; title: string; criteria: Array<{ score: number; description: string }>; expectedBehaviors: string[] }
export type ScenarioCompetency = { id: string; scenarioId: string; competencyId: string }
export type Resource = { id: string; filename: string; mimeType: string; byteSize: number; status: ResourceStatus; createdAt: string }
export type AssessmentVersion = { id: string; versionNumber: number; publishedAt: string }

export type Assessment = AssessmentSummary & {
  scenarios: Scenario[]
  competencies: Competency[]
  rubrics: Rubric[]
  scenarioCompetencies: ScenarioCompetency[]
  resources: Resource[]
  versions: AssessmentVersion[]
}
