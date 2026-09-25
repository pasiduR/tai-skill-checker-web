export const agentVoices = ['Aoede', 'Charon', 'Fenrir', 'Kore', 'Leda', 'Orus', 'Puck', 'Zephyr'] as const

export type AgentVoice = typeof agentVoices[number]

export type AgentSettings = {
  systemPrompt: string
  welcomeMessage: string
  closingMessage: string
  voice: AgentVoice
  temperature: number
  topP: number
  maxOutputTokens: number
}

export type AgentTestConnection = {
  roomName: string
  url: string
  token: string
}
