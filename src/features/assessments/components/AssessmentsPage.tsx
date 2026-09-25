import { Plus } from "@/components/ui/icons"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState, ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { useAssessments } from "../hooks/useAssessment"
import { PageHeader } from "./PageHeader"

export function AssessmentsPage() {
  const query = useAssessments()
  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorNotice message={query.error.message} />
  const assessments = query.data ?? []
  return <div className="space-y-8">
    <PageHeader eyebrow="Admin workspace" title="Assessments" description="Create, publish, and invite employees to structured voice assessments." actions={<Button asChild><Link to="/admin/assessments/new"><Plus />New assessment</Link></Button>} />
    {assessments.length === 0 ? <EmptyState title="No assessments yet" description="Create a draft to define competencies, scenarios, rubrics, and preparation guidance." action={<Button asChild><Link to="/admin/assessments/new">Create assessment</Link></Button>} /> :
      <div className="grid gap-4 md:grid-cols-2">{assessments.map((assessment) => <Link key={assessment.id} to={`/admin/assessments/${assessment.id}`} className="group"><Card className="h-full bg-[#f7f7f7] transition group-hover:-translate-y-1 group-hover:border-[#a8acb3] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"><CardHeader className="flex-row items-start justify-between gap-3"><div><p className="eyebrow mb-3">Assessment</p><CardTitle className="text-xl">{assessment.name}</CardTitle></div><Badge variant={assessment.status === "PUBLISHED" ? "default" : "secondary"}>{assessment.status}</Badge></CardHeader><CardContent><p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{assessment.description}</p><div className="mt-8 flex items-center justify-between border-t pt-4"><p className="font-mono text-xs text-muted-foreground">{assessment.latestVersionNumber ? `Version ${assessment.latestVersionNumber}` : "Unpublished draft"}</p><span className="text-sm font-semibold text-primary">Open →</span></div></CardContent></Card></Link>)}</div>}
  </div>
}
