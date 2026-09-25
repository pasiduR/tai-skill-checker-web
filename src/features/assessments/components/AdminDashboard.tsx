import { Activity, ArrowRight, CheckCircle2, CircleDashed, ClipboardCheck, FileArchive, PanelsTopLeft, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth"
import { useActiveAttempts } from "@/features/attempts"
import { useEvaluations } from "@/features/evaluations"
import { cn } from "@/lib/utils"
import { useAssessments } from "../hooks/useAssessment"

const statusColors = { PUBLISHED: "bg-emerald-500", DRAFT: "bg-amber-400", ARCHIVED: "bg-slate-400" } as const

export function AdminDashboard() {
  const auth = useAuth()
  const assessmentsQuery = useAssessments()
  const attemptsQuery = useActiveAttempts()
  const evaluationsQuery = useEvaluations({})

  if (assessmentsQuery.isLoading || attemptsQuery.isLoading || evaluationsQuery.isLoading) return <PageSkeleton />
  if (assessmentsQuery.error || attemptsQuery.error || evaluationsQuery.error) return <ErrorNotice message="The operations overview could not be loaded. Please try again." />

  const assessments = assessmentsQuery.data ?? []
  const activeAttempts = attemptsQuery.data ?? []
  const evaluations = evaluationsQuery.data ?? []
  const published = assessments.filter((item) => item.status === "PUBLISHED").length
  const drafts = assessments.filter((item) => item.status === "DRAFT").length
  const archived = assessments.filter((item) => item.status === "ARCHIVED").length
  const reviewReady = evaluations.filter((item) => item.status === "COMPLETED").length
  const awaitingReview = evaluations.filter((item) => item.status === "PENDING" || item.status === "PROCESSING").length
  const name = auth.session?.user.name?.split(" ")[0] || "Administrator"
  const recent = [...assessments].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  const metrics = [
    { label: "Total assessments", description: "All configured skill checks", value: assessments.length, icon: PanelsTopLeft, to: "/admin/assessments" },
    { label: "Published", description: "Available for employee invitations", value: published, icon: CheckCircle2, to: "/admin/assessments" },
    { label: "Drafts", description: "Assessments still being prepared", value: drafts, icon: CircleDashed, to: "/admin/assessments" },
    { label: "Live attempts", description: "Assessments happening now", value: activeAttempts.length, icon: Activity, to: "/admin/live" },
    { label: "Ready to review", description: "Completed evaluation reports", value: reviewReady, icon: ClipboardCheck, to: "/admin/evaluations" },
    { label: "Awaiting review", description: "Reports queued or processing", value: awaitingReview, icon: FileArchive, to: "/admin/evaluations" },
  ]
  const distribution = [
    { label: "Published", value: published, color: statusColors.PUBLISHED },
    { label: "Draft", value: drafts, color: statusColors.DRAFT },
    { label: "Archived", value: archived, color: statusColors.ARCHIVED },
  ]

  return <div className="dashboard-enter space-y-7 sm:space-y-8">
    <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">Assessment operations</p>
        <h1 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">Operations overview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Welcome, {name}. Review assessment activity and move current work forward from one place.</p>
      </div>
      <Button asChild><Link to="/admin/assessments/new"><Plus />New assessment</Link></Button>
    </section>

    <section className="grid grid-flow-dense gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Workspace metrics">
      {metrics.map(({ label, description, value, icon: Icon, to }, index) => <article key={label} className="metric-card group relative min-h-40 overflow-hidden rounded-2xl border bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#a8acb3] hover:shadow-[0_8px_24px_rgba(10,11,13,0.06)]" style={{ animationDelay: `${index * 45}ms` }}>
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{label}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p></div><Icon className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" /></div>
        <p className="font-mono mt-5 text-2xl">{value}</p>
        <Link to={to} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold underline-offset-4 hover:underline">View details <ArrowRight className="size-3.5" /><span className="sr-only">for {label}</span></Link>
      </article>)}
    </section>

    <section aria-labelledby="workspace-activity">
      <h2 id="workspace-activity" className="text-xl font-medium">Workspace activity</h2>
      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <article className="rounded-2xl border bg-white p-5 sm:p-6">
          <div><h3 className="font-semibold">Assessment mix</h3><p className="mt-1 text-sm text-muted-foreground">Current assessment status across the workspace</p></div>
          <div className="mt-8 space-y-6">
            {distribution.map(({ label, value, color }) => { const percentage = assessments.length ? Math.round((value / assessments.length) * 100) : 0; return <div key={label}>
              <div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className={cn("size-2 rounded-full", color)} />{label}</span><span className="font-mono text-xs text-muted-foreground">{value} · {percentage}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full rounded-full transition-[width] duration-700", color)} style={{ width: `${percentage}%` }} /></div>
            </div> })}
          </div>
          {assessments.length === 0 && <p className="mt-8 rounded-xl bg-muted px-4 py-5 text-sm text-muted-foreground">Create your first assessment to start tracking workspace activity.</p>}
        </article>

        <article className="overflow-hidden rounded-2xl border bg-white">
          <div className="flex items-center justify-between gap-4 border-b px-5 py-5 sm:px-6"><div><h3 className="font-semibold">Recently updated</h3><p className="mt-1 text-sm text-muted-foreground">Your latest assessment work</p></div><Button size="sm" variant="ghost" asChild><Link to="/admin/assessments">See all <ArrowRight /></Link></Button></div>
          {recent.length === 0 ? <div className="px-6 py-12 text-center"><p className="text-sm text-muted-foreground">No assessments yet.</p><Button className="mt-4" size="sm" variant="outline" asChild><Link to="/admin/assessments/new">Create assessment</Link></Button></div> : <div className="divide-y">{recent.map((assessment) => <Link key={assessment.id} to={`/admin/assessments/${assessment.id}`} className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/70 sm:px-6">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary"><PanelsTopLeft className="size-4 transition-transform duration-300 group-hover:scale-110" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{assessment.name}</p><p className="mt-0.5 text-xs text-muted-foreground">Updated {new Date(assessment.updatedAt).toLocaleDateString()}</p></div>
            <Badge variant={assessment.status === "PUBLISHED" ? "default" : "secondary"}>{assessment.status}</Badge>
          </Link>)}</div>}
        </article>
      </div>
    </section>
  </div>
}
