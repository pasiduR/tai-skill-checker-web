export const queryKeys = {
  session: ["session"] as const,
  membership: (userId?: string) => ["session", "membership", userId] as const,
  assessments: ["assessments"] as const,
  assessment: (id: string) => ["assessments", id] as const,
  invitation: (token: string) => ["invitations", token] as const,
  assessmentInvitations: (assessmentId: string) => ["assessments", assessmentId, "invitations"] as const,
  assignmentPreparation: (assignmentId: string) => ["assignments", assignmentId, "preparation"] as const,
  employeeAssignments: ["assignments", "employee"] as const,
  activeAttempts: ["admin", "attempts", "active"] as const,
  attemptInspection: (attemptId: string) => ["admin", "attempts", attemptId] as const,
  observerConnection: (attemptId: string) => ["admin", "attempts", attemptId, "observer"] as const,
  attemptRecording: (attemptId: string) => ["admin", "attempts", attemptId, "recording"] as const,
}
