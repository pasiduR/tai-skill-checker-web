import { Edit3, Mail } from "@/components/ui/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { queryKeys } from "@/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState, ErrorNotice, InlineSkeleton, PageSkeleton } from "@/components/shared/AsyncState"
import { CoverImage } from "@/components/shared/CoverImage"
import { mockAssessment } from "@/lib/skeletonFixtures"
import { useAssessment } from "../hooks/useAssessment"
import type { Assessment, AssessmentSummary } from "../types"
import { getAssessmentVersion } from "../api/assessments"
import { PageHeader } from "./PageHeader"

export function AssessmentDetailPage() {
  const { id = "" } = useParams()
  const query = useAssessment(id)
  const publishedVersionId = query.data?.currentPublishedVersionId
  const versionQuery = useQuery({ queryKey: queryKeys.assessmentVersion(id, publishedVersionId), queryFn: () => getAssessmentVersion(id, publishedVersionId!), enabled: Boolean(publishedVersionId), staleTime: Infinity })
  const queryClient = useQueryClient()
  if (query.isLoading) {
    // The list cache usually knows whether this assessment has a cover; only reserve the cover slot when it might.
    const summary = queryClient.getQueryData<AssessmentSummary[]>(queryKeys.assessments)?.find((item) => item.id === id)
    return <AssessmentDetailSkeleton showCover={summary ? Boolean(summary.coverImageUrl) : true} />
  }
  if (query.error || !query.data) return <ErrorNotice message={query.error?.message ?? "Assessment not found."} />
  return <AssessmentDetailView assessment={query.data} preview={versionQuery.data ?? query.data} versionLoading={versionQuery.isLoading} />
}

// Captured twice so the cover bone only appears when the assessment is likely to have a cover.
export function AssessmentDetailSkeleton({ showCover = false }: { showCover?: boolean }) {
  if (showCover) return <PageSkeleton name="admin-assessment-detail-cover" fixture={<AssessmentDetailView assessment={mockAssessmentWithCover} preview={mockAssessmentWithCover} versionLoading={false} fixture />} />
  return <PageSkeleton name="admin-assessment-detail" fixture={<AssessmentDetailView assessment={mockAssessment} preview={mockAssessment} versionLoading={false} fixture />} />
}

const mockAssessmentWithCover: Assessment = { ...mockAssessment, coverImageUrl: "/__boneyard/cover" }

type AssessmentPreview = Pick<Assessment, "preparationInstructions" | "competencies" | "scenarios">

function AssessmentDetailView({ assessment, preview, versionLoading, fixture = false }: { assessment: Assessment; preview: AssessmentPreview; versionLoading: boolean; fixture?: boolean }) {
  const id = assessment.id
  return <div className="space-y-8">
    {/* The fixture leaves the frame empty so boneyard captures it as a single cover bone without fetching an image. */}
    {assessment.coverImageUrl && <div className="aspect-[4/1] min-h-32 overflow-hidden rounded-2xl border bg-muted">{!fixture && <CoverImage url={assessment.coverImageUrl} alt="" className="size-full object-cover" />}</div>}
    <PageHeader eyebrow="Assessment preview" title={assessment.name} description={assessment.description} actions={<><Button variant="outline" asChild><Link to={`/admin/assessments/${id}/edit`}><Edit3 />Edit draft</Link></Button>{assessment.status === "PUBLISHED" && <Button asChild><Link to={`/admin/assessments/${id}/invite`}><Mail />Invite employees</Link></Button>}</>} />
    <div className="flex flex-wrap gap-2"><Badge>{assessment.status}</Badge><Badge variant="outline">{assessment.scenarios.length} scenarios</Badge><Badge variant="outline">{assessment.competencies.length} competencies</Badge>{assessment.latestVersionNumber > 0 && <Badge variant="outline">Published v{assessment.latestVersionNumber}</Badge>}</div>
    {versionLoading && <InlineSkeleton />}
    <Card className="shadow-none"><CardHeader><CardTitle>Preparation instructions</CardTitle></CardHeader><CardContent className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{preview.preparationInstructions || "No preparation instructions provided."}</CardContent></Card>
    <section><h2 className="mb-4 text-xl font-semibold tracking-tight">Competencies</h2>{preview.competencies.length ? <div className="grid gap-3 md:grid-cols-2">{preview.competencies.map((item) => <Card key={item.id} className="shadow-none"><CardHeader><CardTitle className="text-base">{item.name}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{item.description}</CardContent></Card>)}</div> : <EmptyState title="No competencies" description="Add competencies in the draft editor." />}</section>
    <section><h2 className="mb-4 text-xl font-semibold tracking-tight">Scenarios</h2>{preview.scenarios.length ? <div className="space-y-3">{preview.scenarios.map((scenario) => <Card key={scenario.id} className="shadow-none"><CardHeader><CardTitle className="text-base">{scenario.position}. {scenario.title}</CardTitle></CardHeader><CardContent className="space-y-4 text-sm leading-6"><p>{scenario.prompt}</p>{scenario.followUpGuidance && <div><p className="font-medium">Follow-up guidance</p><p className="text-muted-foreground">{scenario.followUpGuidance}</p></div>}</CardContent></Card>)}</div> : <EmptyState title="No scenarios" description="Add scenarios manually or generate a draft with AI." />}</section>
  </div>
}
