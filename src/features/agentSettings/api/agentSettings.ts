import { api } from '@/api'
import type { AgentSettings, AgentTestConnection } from '../types'

export async function getAgentSettings() {
  return (await api.get<{ data: AgentSettings }>('/api/admin/agent-settings')).data
}

export async function updateAgentSettings(settings: AgentSettings) {
  return (await api.put<AgentSettings, { data: AgentSettings }>('/api/admin/agent-settings', settings)).data
}

export async function createAgentTestSession() {
  return (await api.post<undefined, { data: AgentTestConnection }>('/api/admin/agent-settings/test-session')).data
}

export async function endAgentTestSession(roomName: string) {
  return (await api.post<{ roomName: string }, { data: { ended: boolean } }>('/api/admin/agent-settings/test-session/end', { roomName })).data
}
