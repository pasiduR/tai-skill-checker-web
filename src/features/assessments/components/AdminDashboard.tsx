import { ArrowRight, CheckCircle2, CircleDashed, Plus, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
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
  return <div className="space-y-8">
    <section className="relative overflow-hidden rounded-3xl bg-[#0a0b0d] px-7 py-10 text-white sm:px-10 sm:py-12 lg:px-12">
      <div className="relative z-10 max-w-2xl"><p className="eyebrow !text-primary">Assessment workspace</p><h1 className="font-display mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Skills become clear when the work feels real.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#a8acb3]">Build structured voice assessments, invite your team, and review evidence backed results from one focused workflow.</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild><Link to="/admin/assessments/new"><Plus />New assessment</Link></Button><Button size="lg" variant="secondary" asChild><Link to="/admin/assessments">View assessments <ArrowRight /></Link></Button></div></div>
      <div className="absolute -right-24 -top-24 size-72 rounded-full border border-white/10" aria-hidden="true" /><div className="absolute -bottom-20 right-8 size-48 rounded-full bg-primary" aria-hidden="true" />
    </section>
    <div className="grid gap-4 sm:grid-cols-3">{metrics.map(({ label, value, icon: Icon }) => <Card key={label} className="border-[#eef0f3] bg-[#f7f7f7]"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><span className="grid size-10 place-items-center rounded-full bg-white"><Icon className="size-4" /></span></CardHeader><CardContent className="font-mono text-4xl font-medium">{String(value).padStart(2, "0")}</CardContent></Card>)}</div>
  </div>
}
