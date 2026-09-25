import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useRoomContext,
  useTranscriptions,
  useVoiceAssistant,
} from "@livekit/components-react"
import { Mic, MicOff, PhoneOff, ShieldCheck } from "@/components/ui/icons"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { ConnectionState, Track } from "livekit-client"
import { queryKeys } from "@/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"
import { cn } from "@/lib/utils"
import { abandonAttempt } from "../api/session"
import { getLatestAgentCaption } from "../captions"
import { resolveSessionState, sessionStateLabel, sessionStateShortLabel } from "../sessionState"
import type { AssessmentSessionLocationState } from "../types"
import { AgentAudioVisualizerRadial } from "./AgentAudioVisualizerRadial"

function SessionRoom({ assignmentId, attemptId, assessmentTitle, failed }: { assignmentId: string; attemptId: string; assessmentTitle: string; failed: boolean }) {
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const { agent, state: agentState, audioTrack } = useVoiceAssistant()
  const { localParticipant, isMicrophoneEnabled, microphoneTrack } = useLocalParticipant()
  const employeeSpeaking = useIsSpeaking(localParticipant)
  const transcriptions = useTranscriptions()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [ending, setEnding] = useState(false)
  const [endError, setEndError] = useState(false)
  const sawAgent = useRef(false)
  const wasConnected = useRef(false)
  const completed = useRef(false)

  useEffect(() => {
    if (agent) sawAgent.current = true
    if (!agent && sawAgent.current && !ending) {
      completed.current = true
      void queryClient.invalidateQueries({ queryKey: queryKeys.assignmentPreparation(assignmentId) })
      void room.disconnect().finally(() => navigate(`/assessment/${assignmentId}/completed`, { replace: true }))
    }
  }, [agent, assignmentId, ending, navigate, queryClient, room])

  useEffect(() => {
    if (connectionState === ConnectionState.Connected) wasConnected.current = true
    if ((connectionState === ConnectionState.Reconnecting || connectionState === ConnectionState.Disconnected) && wasConnected.current && !ending && !completed.current) {
      if (connectionState === ConnectionState.Reconnecting) void room.disconnect()
      void queryClient.invalidateQueries({ queryKey: queryKeys.assignmentPreparation(assignmentId) })
        .finally(() => navigate(`/assessment/${assignmentId}/prepare`, { replace: true, state: { interrupted: true } }))
    }
  }, [assignmentId, connectionState, ending, navigate, queryClient, room])

  const state = resolveSessionState({ connectionState, agentState, employeeSpeaking, ending, failed })
  const agentSpeaking = state === "AGENT_SPEAKING"
  const employeeIsSpeaking = state === "EMPLOYEE_SPEAKING"
  const latestAgentCaption = getLatestAgentCaption(transcriptions)
  const visualizerState = agentSpeaking || employeeIsSpeaking ? "speaking" : agentState
  const visualizerTrack = agentSpeaking ? audioTrack : microphoneTrack ? { participant: localParticipant, publication: microphoneTrack, source: Track.Source.Microphone } : undefined

  const end = async () => {
    setEnding(true)
    setEndError(false)
    try {
      await abandonAttempt(attemptId)
      await room.disconnect()
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignmentPreparation(assignmentId) })
      navigate(`/assessment/${assignmentId}/prepare`, { replace: true, state: { interrupted: true } })
    } catch {
      setEnding(false)
      setEndError(true)
    }
  }

  return <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-surface-dark text-white">
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3"><img src={logo} alt="TAI Skill Checker" className="size-9 shrink-0" /><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#a8acb3]">Live interview</p><h1 className="truncate text-sm font-semibold sm:text-base">{assessmentTitle}</h1></div></div>
      <Badge className="shrink-0 border border-white/10 bg-white/10 text-white hover:bg-white/10" aria-label={sessionStateLabel[state]}><span className={`mr-2 size-2 rounded-full ${state === "ERROR" || state === "DISCONNECTED" ? "bg-red-400" : state === "CONNECTING" ? "bg-amber-300" : "bg-primary"}`} /><span className="sm:hidden">{sessionStateShortLabel[state]}</span><span className="hidden sm:inline">{sessionStateLabel[state]}</span></Badge>
    </header>

    <main className="flex min-h-0 flex-1 overflow-y-auto">
      <section className="relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-10 text-center sm:px-10">
        <div className="relative grid size-44 shrink-0 place-items-center">
          <AgentAudioVisualizerRadial className="absolute inset-0 size-full text-primary" state={visualizerState} audioTrack={visualizerTrack} radius={62} barCount={24} aria-hidden="true" />
          <div className={cn("relative z-10 grid size-24 place-items-center rounded-full border transition-all duration-300 sm:size-28", agentSpeaking ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_0_60px_rgba(250,102,25,0.22)]" : employeeIsSpeaking ? "border-white/30 bg-white text-foreground shadow-[0_0_60px_rgba(255,255,255,0.14)]" : "border-white/10 bg-[#16181c] text-primary")}><Mic className="size-9 sm:size-10" /></div>
        </div>
        <p className="relative mt-7 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">{sessionStateLabel[state]}</p>
        <h2 className="relative mt-2 font-display text-2xl sm:text-3xl">{agentSpeaking ? "Listen to the interviewer" : employeeIsSpeaking ? "We’re listening" : state === "CONNECTING" ? "Preparing your interview" : "Take your time"}</h2>
        <p className="relative mt-2 max-w-md text-sm leading-6 text-[#a8acb3]">{agentSpeaking ? "You’ll have space to respond when the interviewer finishes." : employeeIsSpeaking ? "Speak naturally. You do not need to rush your answer." : "Answer naturally when you are ready. Pauses are completely fine."}</p>
        <div className="relative mt-8 flex min-h-24 w-full max-w-3xl items-center justify-center px-2" aria-live="polite" aria-atomic="true">
          {latestAgentCaption && <div><p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7c828a]">Interviewer</p><p className="text-pretty text-lg leading-8 text-white/90 sm:text-xl">{latestAgentCaption}</p></div>}
        </div>
        {failed && <p className="relative mt-5 text-sm text-red-300" role="alert">The realtime connection failed. This attempt cannot be resumed.</p>}
        {endError && <p className="relative mt-5 text-sm text-red-300" role="alert">The interview could not be ended safely. Please try again.</p>}
      </section>
    </main>

    <footer className="flex shrink-0 items-center justify-center border-t border-white/10 bg-[#0a0b0d]/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex w-full max-w-xl items-center justify-between gap-3"><Button variant="secondary" onClick={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)} disabled={ending}>{isMicrophoneEnabled ? <Mic /> : <MicOff />}{isMicrophoneEnabled ? "Mute" : "Unmute"}</Button><div className="hidden items-center gap-2 text-xs text-[#7c828a] sm:flex"><ShieldCheck className="size-4" />Secure assessment session</div><Button variant="destructive" onClick={() => void end()} loading={ending}><PhoneOff />{ending ? "Ending…" : "End interview"}</Button></div>
    </footer>
    <RoomAudioRenderer />
  </div>
}

export function AssessmentSessionPage() {
  const { assignmentId = "" } = useParams()
  const location = useLocation()
  const session = (location.state as AssessmentSessionLocationState | null)
  const [error, setError] = useState(false)
  if (!session?.connection || !assignmentId) return <Navigate to={`/assessment/${assignmentId}/prepare`} replace />
  return <LiveKitRoom
    serverUrl={session.connection.url}
    token={session.connection.token}
    connect
    audio={session.microphoneDeviceId ? { deviceId: { exact: session.microphoneDeviceId } } : true}
    video={false}
    onError={() => setError(true)}
    onMediaDeviceFailure={() => setError(true)}
    className="contents"
  >
    <SessionRoom assignmentId={assignmentId} attemptId={session.connection.attemptId} assessmentTitle={session.assessmentTitle} failed={error} />
    {error && <p className="sr-only" role="alert">The LiveKit connection failed.</p>}
  </LiveKitRoom>
}
