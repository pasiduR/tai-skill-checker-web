import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useRoomContext,
  useTranscriptions,
  useVoiceAssistant,
} from "@livekit/components-react"
import { Mic, MicOff, PhoneOff } from "lucide-react"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { ConnectionState, Track } from "livekit-client"
import { queryKeys } from "@/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { resolveSessionState, sessionStateLabel } from "../sessionState"
import type { AssessmentSessionLocationState } from "../types"

function SessionRoom({ assignmentId, assessmentTitle, failed }: { assignmentId: string; assessmentTitle: string; failed: boolean }) {
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const { agent, state: agentState, audioTrack } = useVoiceAssistant()
  const { localParticipant, isMicrophoneEnabled, microphoneTrack } = useLocalParticipant()
  const employeeSpeaking = useIsSpeaking(localParticipant)
  const transcriptions = useTranscriptions()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [ending, setEnding] = useState(false)
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
  const end = async () => {
    setEnding(true)
    await room.disconnect()
    await queryClient.invalidateQueries({ queryKey: queryKeys.assignmentPreparation(assignmentId) })
    navigate(`/assessment/${assignmentId}/prepare`, { replace: true, state: { interrupted: true } })
  }

  return <div className="mx-auto min-h-[calc(100vh-12rem)] max-w-5xl overflow-hidden rounded-3xl bg-surface-dark text-white">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
      <div><p className="text-xs text-[#a8acb3]">Live assessment</p><h1 className="mt-1 font-medium">{assessmentTitle}</h1></div>
      <Badge className="border border-white/10 bg-white/10 text-white hover:bg-white/10"><span className={`mr-2 size-2 rounded-full ${state === "ERROR" || state === "DISCONNECTED" ? "bg-red-400" : "bg-primary"}`} />{sessionStateLabel[state]}</Badge>
    </div>
    <div className="grid min-h-[34rem] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col items-center justify-center border-b border-white/10 p-8 text-center lg:border-r lg:border-b-0">
        <div className="grid size-20 place-items-center rounded-full bg-[#16181c] text-primary"><Mic className="size-8" /></div>
        <p className="mt-6 text-sm text-[#a8acb3]">{agentState === "speaking" ? "Listen to the interviewer" : employeeSpeaking ? "Your response is being heard" : "Take your time and answer naturally"}</p>
        <BarVisualizer
          className="session-visualizer mt-8 flex h-20 w-full max-w-sm items-center justify-center gap-1"
          state={agentState}
          track={agentState === "speaking" ? audioTrack : microphoneTrack ? { participant: localParticipant, publication: microphoneTrack, source: Track.Source.Microphone } : undefined}
          barCount={7}
        />
        {failed && <p className="mt-5 text-sm text-red-300" role="alert">The realtime connection failed. This attempt cannot be resumed.</p>}
      </section>
      <section className="flex min-h-0 flex-col p-5 sm:p-8">
        <div><p className="eyebrow !text-[#a8acb3]">Live transcript</p><p className="mt-2 text-sm text-[#a8acb3]">A live draft appears as you speak.</p></div>
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-2xl bg-[#16181c] p-5" aria-live="polite">
          {transcriptions.length === 0 && <p className="text-sm text-[#7c828a]">Waiting for the conversation to begin…</p>}
          {transcriptions.map((entry, index) => {
            const employee = entry.participantInfo.identity.startsWith("employee-")
            return <div key={`${entry.participantInfo.identity}-${index}`} className={employee ? "pl-6" : "pr-6"}><p className="text-xs font-medium text-primary">{employee ? "You" : "Interviewer"}</p><p className="mt-1 text-sm leading-6 text-white/90">{entry.text}</p></div>
          })}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)} disabled={ending}>{isMicrophoneEnabled ? <Mic /> : <MicOff />}{isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}</Button>
          <Button variant="destructive" onClick={() => void end()} disabled={ending}><PhoneOff />{ending ? "Ending…" : "End assessment"}</Button>
        </div>
      </section>
    </div>
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
    <SessionRoom assignmentId={assignmentId} assessmentTitle={session.assessmentTitle} failed={error} />
    {error && <p className="sr-only" role="alert">The LiveKit connection failed.</p>}
  </LiveKitRoom>
}
