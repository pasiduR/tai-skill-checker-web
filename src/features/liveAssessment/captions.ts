type TranscriptionEntry = {
  text: string
  participantInfo: { identity: string }
}

export function getLatestAgentCaption(entries: readonly TranscriptionEntry[]): string | undefined {
  return entries
    .filter((entry) => !entry.participantInfo.identity.startsWith("employee-") && entry.text.trim().length > 0)
    .at(-1)?.text.trim()
}
