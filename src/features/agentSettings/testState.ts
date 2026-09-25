import { ConnectionState } from 'livekit-client'

export type AgentTestState = 'CONNECTING_ROOM' | 'WAITING_FOR_AGENT' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'CONNECTED'

export function resolveAgentTestState(input: { connectionState: ConnectionState; hasAgent: boolean; agentState?: string }): AgentTestState {
  if (input.connectionState !== ConnectionState.Connected) return 'CONNECTING_ROOM'
  if (!input.hasAgent) return 'WAITING_FOR_AGENT'
  if (input.agentState === 'listening') return 'LISTENING'
  if (input.agentState === 'thinking') return 'THINKING'
  if (input.agentState === 'speaking') return 'SPEAKING'
  return 'CONNECTED'
}

export const agentTestStateLabel: Record<AgentTestState, string> = {
  CONNECTING_ROOM: 'Connecting to room',
  WAITING_FOR_AGENT: 'Waiting for agent',
  LISTENING: 'Agent is listening',
  THINKING: 'Agent is thinking',
  SPEAKING: 'Agent is speaking',
  CONNECTED: 'Agent connected',
}
