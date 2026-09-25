import { describe, expect, it } from 'vitest'
import { ConnectionState } from 'livekit-client'
import { resolveAgentTestState } from './testState'

describe('agent test state', () => {
  it('distinguishes browser connection from agent readiness', () => {
    expect(resolveAgentTestState({ connectionState: ConnectionState.Connecting, hasAgent: false })).toBe('CONNECTING_ROOM')
    expect(resolveAgentTestState({ connectionState: ConnectionState.Connected, hasAgent: false })).toBe('WAITING_FOR_AGENT')
  })

  it('reports the active agent conversation state after it joins', () => {
    expect(resolveAgentTestState({ connectionState: ConnectionState.Connected, hasAgent: true, agentState: 'listening' })).toBe('LISTENING')
    expect(resolveAgentTestState({ connectionState: ConnectionState.Connected, hasAgent: true, agentState: 'speaking' })).toBe('SPEAKING')
  })
})
