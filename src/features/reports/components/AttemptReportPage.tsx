import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, ExternalLink, GraduationCap, Lightbulb, RefreshCw, Volume2 } from "@/components/ui/icons"
import { Link, useParams } from "react-router-dom"
import { EmptyState, ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Transcript, useAttemptInspection, useAttemptRecording } from "@/features/attempts"
import { scoreLabel, scorePercentage } from "../reportFormat"
import { useRetryEvaluation } from "@/features/evaluations"

function ProcessingState() {
  return <div className="rounded-3xl border bg-muted px-6 py-14 text-center sm:px-12"><Clock3 className="mx-auto size-8 text-primary" /><h2 className="mt-5 text-xl font-semibold">Report processing</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">The evaluator is reviewing the transcript and evidence. This page refreshes automatically.</p></div>
}

function ListSection({ title, items, icon: Icon }: { title: string; items: string[] | null; icon: typeof CheckCircle2 }) {
  return <Card><CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-brand-soft text-primary"><Icon className="size-4" /></span><CardTitle>{title}</CardTitle></div></CardHeader><CardContent>{items?.length ? <ul className="space-y-3">{items.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-6"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">No items were identified.</p>}</CardContent></Card>
}

export function AttemptReportPage() {
  const { attemptId = "" } = useParams()
  const inspection = useAttemptInspection(attemptId)
  const retry = useRetryEvaluation()
  const reportReady = inspection.data?.evaluation?.status === "COMPLETED" && inspection.data.evaluation.overallScore !== null
  const recording = useAttemptRecording(attemptId, reportReady)

  if (inspection.isLoading) return <PageSkeleton />
  if (inspection.error || !inspection.data) return <ErrorNotice message="This attempt report could not be opened." />
  const data = inspection.data
  const evaluation = data.evaluation
  const failed = evaluation?.status === "FAILED" || data.attempt.status === "FAILED"
  const notSubmitted = data.attempt.status === "ABANDONED" || data.attempt.status === "EXPIRED"

  if (failed) return <div className="space-y-8"><Button variant="ghost" asChild><Link to="/admin/evaluations"><ArrowLeft />Back to evaluations</Link></Button><ErrorNotice message="The report could not be generated. The assessment responses are preserved for review." />{evaluation?.status === "FAILED" && <div><Button disabled={retry.isPending} onClick={() => retry.mutate(evaluation.id)}><RefreshCw />{retry.isPending ? "Retrying…" : "Retry evaluation"}</Button>{retry.error && <p className="mt-3 text-sm text-destructive">{retry.error.message}</p>}</div>}</div>
  if (notSubmitted) return <div className="space-y-8"><Button variant="ghost" asChild><Link to="/admin/live"><ArrowLeft />Back to live attempts</Link></Button><EmptyState title="No evaluation was created" description="This interview ended before successful submission, so it was not sent for scoring." /></div>
  if (!reportReady || !evaluation || evaluation.overallScore === null) return <div className="space-y-8"><Button variant="ghost" asChild><Link to="/admin/live"><ArrowLeft />Back to live attempts</Link></Button><header><p className="eyebrow">Attempt report</p><h1 className="font-display mt-2 text-4xl sm:text-5xl">{data.assessment.name}</h1></header><ProcessingState /></div>

  const maxScore = evaluation.maxScore ?? 5
  const percentage = scorePercentage(evaluation.overallScore, maxScore)
  return <div className="space-y-8">
    <div><Button variant="ghost" asChild><Link to="/admin/live"><ArrowLeft />Back to live attempts</Link></Button><header className="mt-5 flex flex-col gap-5 border-b pb-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Completed attempt</p><h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">{data.assessment.name}</h1><p className="mt-3 text-muted-foreground">Evidence backed evaluation report</p></div><Badge variant="secondary">Evaluation complete</Badge></header></div>

    <section className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]" aria-labelledby="overall-score"><Card className="bg-surface-dark text-white"><CardHeader><p className="eyebrow !text-[#a8acb3]">Overall score</p><CardTitle id="overall-score" className="sr-only">Overall score</CardTitle></CardHeader><CardContent><p className="font-mono text-5xl">{scoreLabel(evaluation.overallScore, maxScore)}</p><p className="font-mono mt-3 text-xl text-primary">{percentage}%</p><Progress className="mt-6 bg-white/15" value={percentage} aria-label={`Overall score ${percentage} percent`} /></CardContent></Card>
      <Card><CardHeader><CardTitle>Competency scores</CardTitle></CardHeader><CardContent className="space-y-6">{evaluation.competencyScores.length ? evaluation.competencyScores.map((item) => { const itemPercentage = scorePercentage(item.score, item.maxScore); return <div key={item.id}><div className="flex items-end justify-between gap-4"><div><h3 className="font-semibold">{item.competencyName}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.reasoning}</p></div><span className="font-mono shrink-0 text-sm">{scoreLabel(item.score, item.maxScore)}</span></div><Progress className="mt-3" value={itemPercentage} aria-label={`${item.competencyName} ${itemPercentage} percent`} /></div> }) : <p className="text-sm text-muted-foreground">No competency scores were returned.</p>}</CardContent></Card>
    </section>

    <section className="grid gap-4 lg:grid-cols-3"><ListSection title="Strengths" items={evaluation.strengths} icon={CheckCircle2} /><ListSection title="Growth areas" items={evaluation.gaps} icon={Lightbulb} /><ListSection title="Recommended training" items={evaluation.recommendations} icon={GraduationCap} /></section>

    <section className="space-y-4"><div><p className="eyebrow">Supporting evidence</p><h2 className="mt-2 text-2xl font-semibold">Transcript backed findings</h2></div>{evaluation.competencyScores.some((score) => score.evidence.length > 0) ? <div className="grid gap-4 lg:grid-cols-2">{evaluation.competencyScores.flatMap((score) => score.evidence.map((evidence) => <Card key={evidence.id}><CardHeader><CardTitle className="text-base">{score.competencyName}</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">{evidence.reason}</p><Button className="mt-5" size="sm" variant="outline" asChild><a href={`#turn-${evidence.attemptTurnId}`}>View transcript evidence <ExternalLink /></a></Button></CardContent></Card>))}</div> : <EmptyState title="No evidence available" description="The evaluator did not return transcript references for this report." />}</section>

    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><Card><CardHeader><CardTitle>Transcript</CardTitle></CardHeader><CardContent><div className="max-h-[42rem] overflow-y-auto rounded-2xl bg-muted p-4 sm:p-5"><Transcript turns={data.turns} emptyMessage="No transcript was captured for this attempt." /></div></CardContent></Card><Card className="h-fit"><CardHeader><div className="flex items-center gap-3"><Volume2 className="size-5 text-primary" /><CardTitle>Audio recording</CardTitle></div></CardHeader><CardContent>{recording.isLoading ? <p className="text-sm text-muted-foreground">Preparing secure playback…</p> : recording.data ? <div className="space-y-3"><audio className="w-full" controls preload="metadata" src={recording.data.url}>Your browser does not support audio playback.</audio><p className="text-xs text-muted-foreground">This private playback link expires in {Math.round(recording.data.expiresInSeconds / 60)} minutes.</p></div> : <Alert><AlertCircle /><AlertTitle>Recording unavailable</AlertTitle><AlertDescription>The transcript and report remain available.</AlertDescription></Alert>}</CardContent></Card></section>
  </div>
}
