import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, Send } from "@/components/ui/icons"
import { Link, useParams } from "react-router-dom"
import { queryKeys } from "@/api"
import { ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { publishAssessment, updateAssessment } from "../api/assessments"
import { mockAssessment } from "@/lib/skeletonFixtures"
import { useAssessment } from "../hooks/useAssessment"
import type { Assessment } from "../types"
import { AiGenerationSection, CompetenciesSection, ResourcesSection, ScenariosSection } from "./EditorSections"
import { OverviewForm } from "./OverviewForm"
import { PageHeader } from "./PageHeader"

export function AssessmentEditorPage() {
  const { id = "" } = useParams()
  const query = useAssessment(id)
  if (query.isLoading) return <AssessmentEditorSkeleton />
  if (query.error || !query.data) return <ErrorNotice message={query.error?.message ?? "Assessment not found."} />
  return <AssessmentEditorView assessment={query.data} />
}

export function AssessmentEditorSkeleton() {
  return <PageSkeleton name="admin-assessment-editor" fixture={<AssessmentEditorView assessment={mockAssessment} />} />
}

function AssessmentEditorView({ assessment }: { assessment: Assessment }) {
  const id = assessment.id
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.assessment(id) })
  const overview = useMutation({ mutationFn: (values: { name: string; description: string; preparationInstructions: string }) => updateAssessment(id, values), onSuccess: refresh })
  const publish = useMutation({ mutationFn: () => publishAssessment(id), onSuccess: async () => { await refresh(); await queryClient.invalidateQueries({ queryKey: queryKeys.assessments }) } })
  const mappedScenarioIds = new Set(assessment.scenarioCompetencies.map((item) => item.scenarioId))
  const rubricCompetencyIds = new Set(assessment.rubrics.map((item) => item.competencyId))
  const ready = assessment.scenarios.length > 0 && assessment.competencies.length > 0 && assessment.scenarios.every((item) => mappedScenarioIds.has(item.id)) && assessment.competencies.every((item) => rubricCompetencyIds.has(item.id)) && assessment.resources.every((item) => item.status === "READY")
  return <div className="space-y-8"><PageHeader eyebrow="Draft editor" title={assessment.name} description="Build and review the complete assessment before publishing an immutable version." actions={<Button variant="outline" asChild><Link to={`/admin/assessments/${id}`}><Eye />Preview</Link></Button>} />
    <AiGenerationSection assessment={assessment} refresh={refresh} />
    <Tabs defaultValue="overview" className="space-y-6"><TabsList className="h-auto flex-wrap justify-start"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="scenarios">Scenarios</TabsTrigger><TabsTrigger value="competencies">Competencies</TabsTrigger><TabsTrigger value="resources">Resources</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList>
      <TabsContent value="overview"><OverviewForm initial={{ name: assessment.name, description: assessment.description, preparationInstructions: assessment.preparationInstructions }} submitLabel="Save overview" pending={overview.isPending} error={overview.error?.message} onSubmit={(values) => overview.mutate(values)} /></TabsContent>
      <TabsContent value="scenarios"><ScenariosSection assessment={assessment} refresh={refresh} /></TabsContent>
      <TabsContent value="competencies"><CompetenciesSection assessment={assessment} refresh={refresh} /></TabsContent>
      <TabsContent value="resources"><ResourcesSection assessment={assessment} refresh={refresh} /></TabsContent>
      <TabsContent value="settings"><Card className="max-w-2xl shadow-none"><CardHeader><CardTitle>Publish assessment</CardTitle><CardDescription>Publishing creates a read-only version used by employee assignments. You can continue editing the draft and publish a later version.</CardDescription></CardHeader><CardContent className="space-y-4">{!ready && <Alert><AlertTitle>Draft is not ready</AlertTitle><AlertDescription>Add at least one scenario and competency, map every scenario, add a rubric for every competency, and finish processing resources.</AlertDescription></Alert>}{publish.error && <ErrorNotice message={publish.error.message} />}{publish.data && <Alert><AlertTitle>Published</AlertTitle><AlertDescription>Version {publish.data.versionNumber} is ready for invitations.</AlertDescription></Alert>}<Button loading={publish.isPending} disabled={!ready} onClick={() => publish.mutate()}><Send />{publish.isPending ? "Publishing…" : "Publish version"}</Button></CardContent></Card></TabsContent>
    </Tabs>
  </div>
}
