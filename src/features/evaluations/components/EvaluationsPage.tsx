import { AlertCircle, Clock3, RefreshCw } from "@/components/ui/icons"
import { Link } from "react-router-dom"
import { useState } from "react"
import { EmptyState, ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/features/assessments/components/PageHeader"
import { useAssessments } from "@/features/assessments/hooks/useAssessment"
import { scoreLabel } from "@/features/reports/reportFormat"
import { useEvaluations, useRetryEvaluation } from "../hooks/useEvaluations"
import type { EvaluationStatus } from "../types"
import { evaluationStatusLabel } from "../evaluationFormat"

export function EvaluationsPage() {
  const [status, setStatus] = useState<EvaluationStatus | "">("")
  const [assessmentId, setAssessmentId] = useState("")
  const evaluations = useEvaluations({ ...(status ? { status } : {}), ...(assessmentId ? { assessmentId } : {}) })
  const assessments = useAssessments()
  const retry = useRetryEvaluation()

  if (evaluations.isLoading || assessments.isLoading) return <PageSkeleton />
  if (evaluations.error) return <ErrorNotice message="Evaluations could not be loaded. Please try again." />
  const rows = evaluations.data ?? []
  return <div className="space-y-8">
    <PageHeader eyebrow="Post-interview review" title="Evaluations" description="Track evidence-backed reports after completed interviews." />
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row">
      <label className="text-sm font-medium">Status<span className="sr-only"> filter</span><select className="mt-2 block h-10 min-w-44 rounded-xl border bg-background px-3 font-normal" value={status} onChange={(event) => setStatus(event.target.value as EvaluationStatus | "")}><option value="">All statuses</option><option value="PENDING">Queued</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="FAILED">Failed</option></select></label>
      <label className="text-sm font-medium">Assessment<span className="sr-only"> filter</span><select className="mt-2 block h-10 min-w-60 rounded-xl border bg-background px-3 font-normal" value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)}><option value="">All assessments</option>{(assessments.data ?? []).map((assessment) => <option key={assessment.id} value={assessment.id}>{assessment.name}</option>)}</select></label>
    </div>
    {retry.error && <Alert variant="destructive"><AlertCircle /><AlertTitle>Retry failed</AlertTitle><AlertDescription>{retry.error.message}</AlertDescription></Alert>}
    {rows.length === 0 ? <EmptyState title="No evaluations found" description="Completed interviews appear here when they enter evaluation." /> : <div className="space-y-3">{rows.map((row) => <Card key={row.id}><CardContent className="grid gap-5 p-5 md:grid-cols-[1.2fr_1fr_auto_auto] md:items-center">
      <div><p className="font-semibold">{row.employeeName || row.employeeEmail}</p><p className="mt-1 text-sm text-muted-foreground">{row.employeeEmail}</p></div>
      <div><p className="text-sm font-medium">{row.assessmentName}</p><p className="mt-1 text-xs text-muted-foreground">Version {row.versionNumber} · {new Date(row.completedAt ?? row.updatedAt).toLocaleString()}</p></div>
      <div className="flex items-center gap-3"><Badge variant={row.status === "FAILED" ? "destructive" : "secondary"}>{(row.status === "PENDING" || row.status === "PROCESSING") && <Clock3 className="mr-1 size-3" />}{evaluationStatusLabel[row.status]}</Badge>{row.status === "COMPLETED" && row.overallScore !== null && <span className="font-mono text-sm">{scoreLabel(row.overallScore)}</span>}</div>
      <div className="flex gap-2 md:justify-end"><Button size="sm" variant="outline" asChild><Link to={`/admin/attempts/${row.attemptId}`}>View report</Link></Button>{row.status === "FAILED" && <Button size="sm" disabled={retry.isPending} onClick={() => retry.mutate(row.id)}><RefreshCw />Retry</Button>}</div>
    </CardContent></Card>)}</div>}
  </div>
}
