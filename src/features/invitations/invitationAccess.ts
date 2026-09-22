export function matchesInvitationEmail(signedInEmail: string | undefined, invitedEmail: string) {
  return signedInEmail?.trim().toLocaleLowerCase() === invitedEmail.trim().toLocaleLowerCase()
}
