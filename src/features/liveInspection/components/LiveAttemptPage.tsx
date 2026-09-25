import { useConnectionState, useVoiceAssistant, LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react"
import { ArrowLeft, Headphones, LiveConnection, Volume2 } from "@/components/ui/icons"
import { ConnectionState } from "livekit-client"
import { Link, useParams } from "react-router-dom"
import { ErrorNotice, InlineSkeleton, PageSkeleton } from "@/components/shared/AsyncState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Transcript, useActiveAttempts, useAttemptInspection, useObserverConnection, type ActiveAttempt, type AttemptInspection } from "@/features/attempts"
import type { ObserverConnection } from "@/features/attempts/types"
import { mockActiveAttempts, mockInspection } from "@/lib/skeletonFixtures"

const agentLabels: Record<string, string> = { connecting: "Agent connecting", initializing: "Agent preparing", listening: "Agent listening", thinking: "Agent thinking", speaking: "Agent speaking", disconnected: "Agent disconnected" }

function ObserverRoom() {
  const connection = useConnectionState()
  const { state: agentState } = useVoiceAssistant()
  const connected = connection === ConnectionState.Connected
  return <>
    <div className="flex flex-wrap items-center gap-3"><Badge variant={connected ? "default" : "secondary"}><span className={`mr-2 size-2 rounded-full ${connected ? "bg-white" : "bg-muted-foreground"}`} />{connected ? "Listening live" : "Connecting audio"}</Badge><span className="text-sm text-muted-foreground">{agentLabels[agentState] ?? "Agent state unavailable"}</span></div>
    <RoomAudioRenderer />
  </>
}

export function LiveAttemptPage() {
  const { attemptId = "" } = useParams()
  const inspection = useAttemptInspection(attemptId, true)
  const activeAttempts = useActiveAttempts()
  const isActive = inspection.data?.attempt.status === "IN_PROGRESS" || inspection.data?.attempt.status === "PROCESSING"
  const observer = useObserverConnection(attemptId, isActive)

  if (inspection.isLoading) return <LiveAttemptSkeleton />
  if (inspection.error || !inspection.data) return <ErrorNotice message="This attempt could not be opened." />
  return <LiveAttemptView attemptId={attemptId} data={inspection.data} employee={activeAttempts.data?.find((item) => item.attemptId === attemptId)} observer={observer} />
}

const liveMockInspection: AttemptInspection = { ...mockInspection, attempt: { ...mockInspection.attempt, status: "IN_PROGRESS" } }

export function LiveAttemptSkeleton() {
  return <PageSkeleton name="admin-live-attempt" fixture={<LiveAttemptView attemptId="t1" data={liveMockInspection} employee={mockActiveAttempts[0]} observer={{ data: undefined, isLoading: false }} />} />
}

type LiveAttemptViewProps = {
  attemptId: string
  data: AttemptInspection
  employee?: ActiveAttempt
  observer: { data?: ObserverConnection; isLoading: boolean }
}

function LiveAttemptView({ attemptId, data, employee, observer }: LiveAttemptViewProps) {
  const isActive = data.attempt.status === "IN_PROGRESS" || data.attempt.status === "PROCESSING"
  const scenario = data.scenarios.find((item) => item.id === data.attempt.currentScenarioId)

  return <div className="space-y-8">
    <div><Button variant="ghost" asChild><Link to="/admin/live"><ArrowLeft />Back to live attempts</Link></Button><div className="mt-5 flex flex-col gap-5 border-b pb-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Listen only inspection</p><h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">{employee?.employeeName || employee?.employeeEmail || "Live attempt"}</h1><p className="mt-3 text-muted-foreground">{data.assessment.name}</p></div>{!isActive && <Button asChild><Link to={`/admin/attempts/${attemptId}`}>Open report</Link></Button>}</div></div>
    <Alert><Headphones /><AlertTitle>Your microphone is off</AlertTitle><AlertDescription>This observer connection can receive audio only. It cannot publish microphone, camera, or data.</AlertDescription></Alert>
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-6"><Card className="bg-surface-dark text-white"><CardHeader><div className="flex items-center justify-between"><CardTitle>Session state</CardTitle><LiveConnection className="size-5 text-primary" /></div></CardHeader><CardContent className="space-y-6"><div><p className="text-xs text-[#a8acb3]">Current scenario</p><p className="mt-2 text-lg">{scenario?.title ?? (isActive ? "Transitioning between scenarios" : "Assessment ended")}</p></div><div className="border-t border-white/10 pt-5"><p className="text-xs text-[#a8acb3]">Live audio</p><div className="mt-3">
        {observer.data ? <LiveKitRoom serverUrl={observer.data.url} token={observer.data.token} connect audio={false} video={false} className="contents" onError={() => undefined}><ObserverRoom /></LiveKitRoom> : observer.isLoading ? <InlineSkeleton /> : <p className="text-sm text-[#a8acb3]">{isActive ? "Listen only audio is temporarily unavailable." : "This session is no longer live."}</p>}
      </div></div><div className="flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-[#a8acb3]"><Volume2 className="size-4" />Audio plays through your selected output device.</div></CardContent></Card></div>
      <Card><CardHeader><CardTitle>Live transcript</CardTitle><p className="text-sm text-muted-foreground" aria-live="polite">Updates every few seconds.</p></CardHeader><CardContent><div className="max-h-[38rem] overflow-y-auto rounded-2xl bg-muted p-4 sm:p-5"><Transcript turns={data.turns} /></div></CardContent></Card>
    </div>
  </div>
}
