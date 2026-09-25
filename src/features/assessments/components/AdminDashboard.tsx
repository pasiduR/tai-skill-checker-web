import { ArrowRight, Assessment, CheckCircle2, Draft, Evaluation, LiveActivity, Plus } from "@/components/ui/icons"
import { Link } from "react-router-dom"
import { ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth"
import { useActiveAttempts } from "@/features/attempts"
import { useEvaluations } from "@/features/evaluations"
import { cn } from "@/lib/utils"
import { useAssessments } from "../hooks/useAssessment"

const coverStyles = [
  "overview-cover-dark",
  "overview-cover-strong",
  "overview-cover-soft",
]

const statusStyles = {
  PUBLISHED: "overview-status-published",
  DRAFT: "overview-status-draft",
  ARCHIVED: "overview-status-archived",
} as const

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
  const completed = evaluations.filter((item) => item.status === "COMPLETED").length
  const name = auth.session?.user.name?.split(" ")[0] || "Administrator"
  const recent = [...assessments].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const featured = recent.slice(0, 3)
  const reviewQueue = [...evaluations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4)
  const publishedPercent = assessments.length ? Math.round((published / assessments.length) * 100) : 0
  const chartValues = [assessments.length, published, completed, activeAttempts.length]
  const chartMax = Math.max(...chartValues, 1)
  const stats = [
    { label: "Published", value: published, note: `${assessments.length} total`, icon: CheckCircle2 },
    { label: "Drafts", value: drafts, note: "In progress", icon: Draft },
    { label: "Live now", value: activeAttempts.length, note: "Active attempts", icon: LiveActivity },
  ]

  return <div>
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="min-w-0 space-y-5 xl:col-span-2">
        <section className="overview-hero relative min-h-64 overflow-hidden rounded-3xl px-6 py-8 text-white sm:px-8 sm:py-10" aria-labelledby="overview-heading">
          <div className="relative z-10 max-w-xl md:max-w-[56%]">
            <p className="eyebrow !text-[#a8acb3]">Assessment workspace</p>
            <h1 id="overview-heading" className="font-display mt-4 max-w-xl text-3xl leading-[1.08] sm:text-4xl">Build sharper teams with evidence-backed skills.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#a8acb3]">Welcome, {name}. Create realistic skill checks, invite employees, and turn conversations into clear results.</p>
            <Button className="mt-7" asChild><Link to="/admin/assessments/new">Create assessment <ArrowRight /></Link></Button>
          </div>
          <div className="absolute inset-y-0 right-0 hidden w-[42%] md:block" aria-hidden="true">
            <div className="absolute right-8 top-8 w-52 rounded-2xl border border-white/10 bg-[#16181c] p-4">
              <div className="flex items-center justify-between"><span className="h-2 w-16 rounded-full bg-white/20" /><span className="size-2 rounded-full bg-primary" /></div>
              <div className="mt-6 space-y-3"><span className="block h-2 w-full rounded-full bg-white/10" /><span className="block h-2 w-4/5 rounded-full bg-white/10" /><span className="block h-2 w-3/5 rounded-full bg-white/10" /></div>
            </div>
            <div className="absolute bottom-7 right-20 w-56 rounded-2xl border border-white/10 bg-[#16181c] p-4">
              <div className="flex h-20 items-end gap-2"><span className="h-2/5 flex-1 rounded-t bg-white/15" /><span className="h-3/4 flex-1 rounded-t bg-primary" /><span className="h-1/2 flex-1 rounded-t bg-white/15" /><span className="h-full flex-1 rounded-t bg-white/15" /></div>
            </div>
          </div>
        </section>

        <section className="grid grid-flow-dense gap-3 sm:grid-cols-3" aria-label="Assessment status">
          {stats.map(({ label, value, note, icon: Icon }) => <article key={label} className="overview-card flex min-w-0 items-center gap-3 rounded-2xl p-5">
            <span className="overview-stat-icon grid size-10 shrink-0 place-items-center rounded-full"><Icon className="size-[18px]" /></span>
            <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{note}</p><p className="mt-1 truncate text-sm font-semibold"><span className="font-mono">{value}</span> {label}</p></div>
          </article>)}
        </section>

        <section aria-labelledby="recent-assessments">
          <div className="mb-3 flex items-center justify-between gap-4"><h2 id="recent-assessments" className="text-lg font-semibold">Recent assessments</h2><Link to="/admin/assessments" className="overview-primary-text inline-flex items-center gap-1 text-xs font-semibold hover:underline">See all <ArrowRight className="size-3.5" /></Link></div>
          {featured.length === 0 ? <div className="overview-card rounded-2xl px-5 py-10 text-center"><p className="text-sm text-muted-foreground">No assessments yet.</p><Button className="mt-4" size="sm" variant="outline" asChild><Link to="/admin/assessments/new">Create assessment</Link></Button></div> : <div className="grid grid-flow-dense gap-3 md:grid-cols-3">{featured.map((assessment, index) => <Link key={assessment.id} to={`/admin/assessments/${assessment.id}`} className="group overview-card overflow-hidden rounded-2xl transition-colors hover:border-primary/40">
            <div className={cn("relative grid h-28 place-items-center overflow-hidden", coverStyles[index % coverStyles.length])}><span className="grid size-12 place-items-center rounded-full bg-white"><Assessment className="size-6 text-foreground" /></span></div>
            <div className="p-4"><span className={cn("inline-flex rounded-full px-2 py-1 text-[10px] font-semibold", statusStyles[assessment.status])}>{assessment.status}</span><h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-5">{assessment.name}</h3><p className="mt-3 text-[11px] text-muted-foreground">Updated {new Date(assessment.updatedAt).toLocaleDateString()}</p></div>
          </Link>)}</div>}
        </section>

        <section className="overview-card overflow-hidden rounded-2xl" aria-labelledby="assessment-library">
          <div className="flex items-center justify-between border-b px-5 py-4"><h2 id="assessment-library" className="font-semibold">Assessment library</h2><Button size="sm" variant="ghost" asChild><Link to="/admin/assessments/new"><Plus />New</Link></Button></div>
          {recent.length === 0 ? <p className="px-5 py-8 text-center text-sm text-muted-foreground">Your assessments will appear here.</p> : <div className="divide-y">{recent.slice(0, 4).map((assessment) => <Link key={assessment.id} to={`/admin/assessments/${assessment.id}`} className="overview-row grid gap-3 px-5 py-3.5 transition-colors sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{assessment.name}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{assessment.description || "No description added"}</p></div><span className={cn("w-fit rounded-full px-2 py-1 text-[10px] font-semibold", statusStyles[assessment.status])}>{assessment.status}</span><ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
          </Link>)}</div>}
        </section>
      </div>

      <aside className="min-w-0 space-y-4 xl:sticky  xl:self-start">
        <section className="overview-card rounded-3xl p-5" aria-labelledby="statistics-heading">
          <h2 id="statistics-heading" className="font-semibold">Statistics</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="relative grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#fa6619 ${publishedPercent * 3.6}deg, #eef0f3 0deg)` }}><div className="grid size-[86px] place-items-center rounded-full bg-white"><div className="text-center"><span className="font-mono text-xl">{publishedPercent}%</span><p className="text-[10px] text-muted-foreground">published</p></div></div></div>
            <div className="min-w-0"><p className="text-lg font-semibold">Welcome, {name}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your assessment workspace is ready for today’s work.</p></div>
          </div>
          <div className="overview-soft-panel mt-6 rounded-2xl px-4 pb-4 pt-5">
            <div className="flex h-28 items-end justify-around gap-3 border-b border-dashed border-[#dcdbea]">
              {chartValues.map((value, index) => <div key={index} className="flex h-full flex-1 items-end justify-center"><div className={cn("w-full max-w-10 rounded-t-lg", index === 1 ? "overview-chart-accent" : "overview-chart-muted")} style={{ height: `${24 + (value / chartMax) * 68}%` }} /></div>)}
            </div>
            <div className="mt-2 grid grid-cols-4 text-center text-[9px] text-muted-foreground"><span>Total</span><span>Published</span><span>Reports</span><span>Active</span></div>
          </div>
        </section>

        <section className="overview-card overflow-hidden rounded-3xl" aria-labelledby="review-queue-heading">
          <div className="flex items-center justify-between px-5 py-4"><div><h2 id="review-queue-heading" className="font-semibold">Review queue</h2><p className="mt-1 text-xs text-muted-foreground">Latest employee evaluations</p></div><span className="overview-primary-soft grid size-8 place-items-center rounded-full"><Evaluation className="size-4" /></span></div>
          {reviewQueue.length === 0 ? <p className="border-t px-5 py-8 text-center text-sm text-muted-foreground">No evaluations yet.</p> : <div className="divide-y border-t">{reviewQueue.map((evaluation) => <Link key={evaluation.id} to={`/admin/attempts/${evaluation.attemptId}`} className="overview-row flex items-center gap-3 px-5 py-3 transition-colors">
            <span className="overview-stat-icon grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold">{(evaluation.employeeName || evaluation.employeeEmail).slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{evaluation.employeeName || evaluation.employeeEmail}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{evaluation.assessmentName}</p></div><span className="overview-primary-text text-[10px] font-semibold">{evaluation.status}</span>
          </Link>)}</div>}
          <Link to="/admin/evaluations" className="overview-primary-soft m-4 flex h-9 items-center justify-center rounded-xl text-xs font-semibold transition-colors">See all evaluations</Link>
        </section>
      </aside>
    </div>
  </div>
}
