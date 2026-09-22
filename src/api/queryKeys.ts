export const queryKeys = {
  session: ["session"] as const,
  membership: (userId?: string) => ["session", "membership", userId] as const,
  assessments: ["assessments"] as const,
  assessment: (id: string) => ["assessments", id] as const,
  invitation: (token: string) => ["invitations", token] as const,
  assignmentPreparation: (assignmentId: string) => ["assignments", assignmentId, "preparation"] as const,
}
