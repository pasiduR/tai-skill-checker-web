import { Activity, ArrowRight, Clock3, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState, ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/features/assessments/components/PageHeader"
import { useAssessments } from "@/features/assessments/hooks/useAssessment"
import { useActiveAttempts } from "@/features/attempts"

function heartbeatLabel(value: string | null) {
  if (!value) return "Waiting for activity"
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1_000))
  return seconds < 60 ? `Active ${seconds}s ago` : `Active ${Math.floor(seconds / 60)}m ago`
}

export function LiveAttemptsPage() {
  const attempts = useActiveAttempts()
  const assessments = useAssessments()
  if (attempts.isLoading || assessments.isLoading) return <PageSkeleton />
  if (attempts.error) return <ErrorNotice message="Live attempts could not be loaded. Please try again." />
  const assessmentNames = new Map((assessments.data ?? []).map((assessment) => [assessment.id, assessment.name]))
  const active = attempts.data ?? []

  return <div className="space-y-8">
    <PageHeader eyebrow="Realtime oversight" title="Live attempts" description="Listen to active assessments and follow each conversation as it happens." />
    {active.length === 0 ? <EmptyState title="No active assessments" description="Live attempts appear here after an employee starts an assessment." /> :
      <div className="grid gap-4 lg:grid-cols-2">{active.map((attempt) => <Card key={attempt.attemptId} className="bg-muted">
        <CardHeader className="flex-row items-start justify-between gap-4"><div><p className="eyebrow">In progress</p><CardTitle className="mt-3 text-xl">{attempt.employeeName || attempt.employeeEmail}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{attempt.employeeEmail}</p></div><Badge><span className="mr-2 size-2 animate-pulse rounded-full bg-foreground" />Live</Badge></CardHeader>
        <CardContent><dl className="space-y-3 border-t pt-5 text-sm"><div className="flex gap-3"><Activity className="size-4 shrink-0 text-primary" /><div><dt className="sr-only">Assessment</dt><dd>{assessmentNames.get(attempt.assessmentId) ?? `Assessment ${attempt.assessmentId.slice(0, 8)}`}</dd></div></div><div className="flex gap-3 text-muted-foreground"><UserRound className="size-4 shrink-0" /><div><dt className="sr-only">State</dt><dd>{attempt.status === "PROCESSING" ? "Finishing assessment" : "Employee connected"}</dd></div></div><div className="flex gap-3 text-muted-foreground"><Clock3 className="size-4 shrink-0" /><div><dt className="sr-only">Last activity</dt><dd>{heartbeatLabel(attempt.lastHeartbeatAt)}</dd></div></div></dl><Button className="mt-6 w-full" asChild><Link to={`/admin/live/${attempt.attemptId}`}>Inspect live <ArrowRight /></Link></Button></CardContent>
      </Card>)}</div>}
  </div>
}
