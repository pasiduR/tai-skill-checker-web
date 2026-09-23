import { ArrowRight, CheckCircle2, CircleDashed, Plus, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSkeleton } from "@/components/shared/AsyncState"
import { useAssessments } from "../hooks/useAssessment"

export function AdminDashboard() {
  const query = useAssessments()
  if (query.isLoading) return <PageSkeleton />
  const assessments = query.data ?? []
  const published = assessments.filter((item) => item.status === "PUBLISHED").length
  const metrics = [
    { label: "Total assessments", value: assessments.length, icon: Sparkles },
    { label: "Published", value: published, icon: CheckCircle2 },
    { label: "Drafts", value: assessments.length - published, icon: CircleDashed },
  ]
  const recent = assessments.slice(0, 4)
  return <div className="space-y-5">
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(250px,0.75fr)]">
      <section className="relative min-h-[280px] overflow-hidden rounded-2xl bg-[#0a0b0d] px-6 py-8 text-white sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-2xl"><p className="eyebrow !text-primary">Assessment workspace</p><h1 className="font-display mt-3 text-3xl leading-[1.08] sm:text-4xl lg:text-[2.75rem]">Skills become clear when the work feels real.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#a8acb3]">Build structured voice assessments, invite your team, and review evidence-backed results from one focused workflow.</p><div className="mt-6 flex flex-wrap gap-2.5"><Button asChild><Link to="/admin/assessments/new"><Plus />New assessment</Link></Button><Button variant="secondary" asChild><Link to="/admin/assessments">View assessments <ArrowRight /></Link></Button></div></div>
        <div className="absolute -right-16 -top-24 size-64 rounded-full border border-white/10" aria-hidden="true" /><div className="absolute -bottom-24 right-8 size-44 rounded-full bg-primary" aria-hidden="true" />
      </section>

      <Card className="border-[#eef0f3] bg-white"><CardHeader className="flex-row items-center justify-between"><div><p className="eyebrow">At a glance</p><CardTitle className="mt-1 text-lg">Assessment status</CardTitle></div><Sparkles className="size-4 text-primary" /></CardHeader><CardContent className="space-y-1">{metrics.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3 border-t py-3 first:border-t-0 first:pt-0"><span className="grid size-9 place-items-center rounded-full bg-secondary"><Icon className="size-4" /></span><p className="flex-1 text-sm text-muted-foreground">{label}</p><p className="font-mono text-xl">{String(value).padStart(2, "0")}</p></div>)}</CardContent></Card>
    </div>

    <section className="rounded-2xl border bg-white" aria-labelledby="recent-assessments">
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6"><div><h2 id="recent-assessments" className="text-base font-semibold">Recent assessments</h2><p className="mt-0.5 text-xs text-muted-foreground">Continue editing or review your latest work.</p></div><Button size="sm" variant="ghost" asChild><Link to="/admin/assessments">See all <ArrowRight /></Link></Button></div>
      {recent.length === 0 ? <div className="px-5 py-8 text-center"><p className="text-sm text-muted-foreground">No assessments yet. Start with a new draft.</p></div> : <div className="divide-y">{recent.map((assessment) => <Link key={assessment.id} to={`/admin/assessments/${assessment.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/70 sm:px-6"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary"><Sparkles className="size-4 text-primary" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{assessment.name}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{assessment.description || "No description added"}</p></div><Badge variant={assessment.status === "PUBLISHED" ? "default" : "secondary"}>{assessment.status}</Badge><ArrowRight className="hidden size-4 text-muted-foreground sm:block" /></Link>)}</div>}
    </section>
  </div>
}
