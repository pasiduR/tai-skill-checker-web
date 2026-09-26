import { z } from 'zod'
import { agentVoices } from './types'

export const agentSettingsSchema = z.object({
  systemPrompt: z.string().trim().min(20, 'System prompt must be at least 20 characters.').max(8_000, 'System prompt must be 8,000 characters or fewer.'),
  welcomeMessage: z.string().trim().min(1, 'Opening message is required.').max(1_000, 'Opening message must be 1,000 characters or fewer.'),
  closingMessage: z.string().trim().min(1, 'Closing message is required.').max(1_000, 'Closing message must be 1,000 characters or fewer.'),
  voice: z.enum(agentVoices, { error: 'Choose a supported voice.' }),
  temperature: z.number().min(0, 'Temperature must be between 0 and 2.').max(2, 'Temperature must be between 0 and 2.'),
  topP: z.number().min(0, 'Top P must be between 0 and 1.').max(1, 'Top P must be between 0 and 1.'),
  maxOutputTokens: z.number().int('Maximum response tokens must be a whole number.').min(64, 'Maximum response tokens must be at least 64.').max(8_192, 'Maximum response tokens must be 8,192 or fewer.'),
})
