// Mock data rendered through the real page views so `npm run bones` captures skeletons that match the UI.
// Keep the amount of content close to what a typical workspace shows — it determines bone count and height.
import type { Assessment, AssessmentSummary } from "@/features/assessments/types"
import type { ActiveAttempt, AttemptInspection } from "@/features/attempts/types"
import type { EvaluationListItem } from "@/features/evaluations/types"
import type { EmployeeInvitation } from "@/features/invitations/api/invitations"

const now = new Date().toISOString()

const featuredAssessment: AssessmentSummary = { id: "a1", name: "Customer communication skills", description: "A structured voice assessment covering empathy, clarity, and de-escalation with customers.", preparationInstructions: "", status: "PUBLISHED", latestVersionNumber: 2, currentPublishedVersionId: "v2", coverImageUrl: null, createdAt: now, updatedAt: now }

export const mockAssessments: AssessmentSummary[] = [
  featuredAssessment,
  { id: "a2", name: "Sales discovery conversation", description: "Evaluates questioning technique and needs analysis in an early-stage sales call.", preparationInstructions: "", status: "DRAFT", latestVersionNumber: 0, currentPublishedVersionId: null, coverImageUrl: null, createdAt: now, updatedAt: now },
  { id: "a3", name: "Incident escalation handling", description: "Checks how employees communicate during a production incident.", preparationInstructions: "", status: "PUBLISHED", latestVersionNumber: 1, currentPublishedVersionId: "v1", coverImageUrl: null, createdAt: now, updatedAt: now },
  { id: "a4", name: "Team leadership check-in", description: "Assesses coaching and feedback conversations with direct reports.", preparationInstructions: "", status: "DRAFT", latestVersionNumber: 0, currentPublishedVersionId: null, coverImageUrl: null, createdAt: now, updatedAt: now },
]

export const mockAssessment: Assessment = {
  ...featuredAssessment,
  preparationInstructions: "Find a quiet place with a working microphone. You will speak with an AI interviewer who plays a customer.\nAnswer naturally and explain your reasoning.",
  competencies: [
    { id: "c1", name: "Empathy", description: "Acknowledges the customer's situation and feelings.", position: 1 },
    { id: "c2", name: "Clarity", description: "Explains next steps in plain, specific language.", position: 2 },
  ],
  scenarios: [
    { id: "s1", title: "Delayed order", prompt: "A customer calls about an order that is two weeks late and asks for a refund.", followUpGuidance: "Probe how the employee sets expectations.", position: 1 },
    { id: "s2", title: "Billing dispute", prompt: "A customer disputes a charge they do not recognise on their invoice.", followUpGuidance: "", position: 2 },
  ],
  rubrics: [],
  scenarioCompetencies: [],
  resources: [],
  versions: [],
}

export const mockEvaluations: EvaluationListItem[] = [1, 2, 3].map((item) => ({
  id: `e${item}`, attemptId: `t${item}`, status: "COMPLETED", overallScore: 4, employeeName: "Jordan Perera", employeeEmail: "jordan@example.com",
  assessmentId: "a1", assessmentName: "Customer communication skills", versionNumber: 2, completedAt: now, updatedAt: now,
}))

export const mockActiveAttempts: ActiveAttempt[] = [1, 2].map((item) => ({
  attemptId: `t${item}`, status: "IN_PROGRESS", roomName: null, currentScenarioId: "s1", lastHeartbeatAt: now,
  employeeUserId: `u${item}`, employeeName: "Jordan Perera", employeeEmail: "jordan@example.com", assessmentId: "a1",
}))

export const mockInspection: AttemptInspection = {
  attempt: { id: "t1", status: "COMPLETED", currentScenarioId: "s1", startedAt: now, completedAt: now, updatedAt: now },
  assessment: { id: "a1", name: "Customer communication skills", description: "" },
  scenarios: [{ id: "s1", title: "Delayed order", prompt: "", followUpGuidance: "", position: 1 }],
  turns: [
    { id: "turn1", attemptId: "t1", scenarioId: "s1", speaker: "AGENT", content: "Hi, my order is two weeks late and I would like a refund.", sequence: 1, startedAt: now, endedAt: now, createdAt: now },
    { id: "turn2", attemptId: "t1", scenarioId: "s1", speaker: "EMPLOYEE", content: "I'm sorry about the delay. Let me check the shipment status and explain your options.", sequence: 2, startedAt: now, endedAt: now, createdAt: now },
    { id: "turn3", attemptId: "t1", scenarioId: "s1", speaker: "AGENT", content: "Okay, how long will that take?", sequence: 3, startedAt: now, endedAt: now, createdAt: now },
  ],
  progress: [],
  events: [],
  evaluation: {
    id: "e1", status: "COMPLETED", overallScore: 4, maxScore: 5, errorMessage: null,
    strengths: ["Acknowledged the customer's frustration early", "Offered clear next steps"],
    gaps: ["Did not confirm the customer's preferred resolution"],
    recommendations: ["Practice summarising agreed actions at the end of a call"],
    competencyScores: [
      { id: "cs1", competencyId: "c1", competencyName: "Empathy", score: 4, maxScore: 5, reasoning: "Consistently acknowledged the customer's situation.", evidence: [{ id: "ev1", attemptTurnId: "turn2", reason: "Apologised and validated the delay before troubleshooting." }] },
      { id: "cs2", competencyId: "c2", competencyName: "Clarity", score: 4, maxScore: 5, reasoning: "Explained options in plain language.", evidence: [{ id: "ev2", attemptTurnId: "turn2", reason: "Set out the refund and replacement options clearly." }] },
    ],
  },
}

export const mockEmployeeInvitations: EmployeeInvitation[] = [1, 2, 3].map((item) => ({
  invitationId: `i${item}`, assignmentId: `as${item}`, email: `employee${item}@example.com`, invitationStatus: "ACCEPTED", assignmentStatus: "READY",
  expiresAt: now, attemptsUsed: 0, attemptsRemaining: 3, hasActiveAttempt: false,
}))
