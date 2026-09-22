import { api } from "@/api"
import type { ActiveAttempt, AttemptInspection, ObserverConnection, RecordingPlayback } from "../types"

type Envelope<T> = { data: T }

export const listActiveAttempts = async () => (await api.get<Envelope<ActiveAttempt[]>>("/api/admin/attempts/active")).data
export const getAttemptInspection = async (attemptId: string) => (await api.get<Envelope<AttemptInspection>>(`/api/admin/attempts/${attemptId}`)).data
export const createObserverConnection = async (attemptId: string) => (await api.post<undefined, Envelope<ObserverConnection>>(`/api/admin/attempts/${attemptId}/observer-token`)).data
export const getAttemptRecording = async (attemptId: string) => (await api.get<Envelope<RecordingPlayback>>(`/api/admin/attempts/${attemptId}/recording`)).data
