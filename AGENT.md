Yes — for the frontend `AGENT.md`, I’d keep it focused on **structure, UI architecture, data flow, component rules, LiveKit integration, and role separation**.

# AGENT.md — AI Skill Assessment Frontend

## Purpose

This repository contains the **React frontend** for the AI skill assessment platform.

The frontend supports two experiences:

* **ADMIN** — create assessments, invite employees, monitor live sessions, review reports
* **EMPLOYEE** — enter through invitation, prepare, check microphone, complete voice assessment

The backend is maintained separately.

---

# Core Principles

1. **Feature isolation** — organize code by domain, not by generic file type.
2. **Keep components small** — pages compose features; business logic stays outside presentation components.
3. **Server state is not local state** — use a query layer for API data.
4. **Role separation** — admin and employee flows must remain clearly separated.
5. **Backend is authoritative** — never enforce security or attempt limits only in the browser.
6. **Minimal UI** — prioritize clarity, hierarchy, and reliability over decorative UI.
7. **Realtime state is explicit** — LiveKit session state must not be mixed with general application state.

---

# Stack

```text
React
TypeScript
React Router
TanStack Query
Tailwind CSS
shadcn/ui
LiveKit React Components
Zod
```

Use the existing package manager and tooling configured in the repository.

---

# Repository Structure

```text
src/
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── App.tsx
│
├── api/
│   ├── client.ts
│   ├── queryKeys.ts
│   └── index.ts
│
├── features/
│   ├── auth/
│   ├── assessments/
│   ├── invitations/
│   ├── assignments/
│   ├── attempts/
│   ├── liveAssessment/
│   ├── liveInspection/
│   ├── reports/
│   └── resources/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── layouts/
│   ├── AdminLayout.tsx
│   └── EmployeeLayout.tsx
│
├── hooks/
├── lib/
├── types/
└── main.tsx
```

Every feature should follow:

```text
feature/
├── components/
├── hooks/
├── api/
├── types/
└── index.ts
```

Outside code should import from the feature `index.ts` where practical.

---

# Page Structure

## Admin

```text
/admin
/admin/assessments
/admin/assessments/new
/admin/assessments/:id
/admin/assessments/:id/edit
/admin/assessments/:id/invite
/admin/live
/admin/live/:attemptId
/admin/attempts/:attemptId
```

## Employee

```text
/invite/:token
/assessment/:assignmentId/prepare
/assessment/:assignmentId/session
/assessment/:assignmentId/completed
```

Do not expose admin pages to employee users.

---

# API Pattern

All backend communication goes through a central API client.

```typescript
export const api = {
  get: async <T>(url: string): Promise<T> => {
    // request
  },

  post: async <TInput, TResponse>(
    url: string,
    body: TInput,
  ): Promise<TResponse> => {
    // request
  },
}
```

Do not call `fetch()` randomly across components.

Feature-specific API functions live inside:

```text
features/{feature}/api/
```

Example:

```typescript
export async function getAssessment(id: string) {
  return api.get<Assessment>(`/assessments/${id}`)
}
```

---

# Server State

Use TanStack Query for backend data.

Examples:

```text
assessments
assessment details
assignments
attempts
reports
live attempts
resources
```

Centralize query keys.

```typescript
export const queryKeys = {
  assessments: ['assessments'] as const,

  assessment: (id: string) =>
    ['assessments', id] as const,

  attempt: (id: string) =>
    ['attempts', id] as const,
}
```

Do not duplicate backend data inside global state.

---

# Local State

Use local React state for:

```text
forms
dialogs
selected tabs
microphone test state
temporary UI state
```

Do not create global state unless multiple unrelated parts of the app genuinely need it.

---

# Authentication

Authentication state comes from the backend / Better Auth integration.

Frontend responsibilities:

```text
load authenticated user
determine role
route correctly
handle expired sessions
handle invitation entry
```

Do not use frontend role checks as security.

They are only for UI visibility and routing.

---

# Admin Assessment Flow

```text
Create Assessment
      ↓
Basic details
      ↓
Topics / competencies
      ↓
Scenarios
      ↓
Rubrics
      ↓
Resources
      ↓
Preview
      ↓
Publish
```

Admins can create content manually or use AI-assisted generation.

AI-generated content must be editable before publishing.

---

# Assessment Editor

Prefer one clear editor rather than many nested configuration screens.

Sections:

```text
Overview
Scenarios
Competencies
Resources
Settings
```

Each scenario should display:

* scenario prompt
* competency mapping
* expected behaviours
* rubric
* follow-up guidance

Published versions should appear read-only.

---

# Employee Preparation Flow

Employee sees:

```text
assessment title
description
topics / competencies
preparation instructions
remaining attempts
microphone test
start button
```

Employee must never see:

```text
actual scenarios
hidden questions
expected answers
rubrics
evaluation prompts
scores
```

---

# Voice Assessment UI

The assessment page should remain intentionally minimal.

Core UI:

```text
Assessment title

Current session status

Agent speaking / listening state

Audio visualization

Live transcript

Microphone control

End assessment
```

Avoid unnecessary navigation during an active assessment.

---

# LiveKit Pattern

Use official LiveKit React components where appropriate.

The frontend should handle:

```text
room connection
microphone publishing
agent audio playback
connection state
participant state
transcript display
agent state
```

Backend provides:

```text
LiveKit URL
room token
attempt information
```

Frontend must never create arbitrary LiveKit room credentials.

---

# Realtime Session States

Represent states explicitly:

```text
CONNECTING
CONNECTED
LISTENING
AGENT_SPEAKING
EMPLOYEE_SPEAKING
ENDING
DISCONNECTED
ERROR
```

Do not infer critical UI behavior from scattered booleans.

---

# Interrupted Sessions

The prototype does not resume interrupted attempts.

If the session disconnects or the employee leaves:

```text
show interruption state
      ↓
notify backend
      ↓
attempt becomes consumed
      ↓
employee may start another attempt if available
```

Do not silently reconnect into the same attempt.

---

# Admin Live Inspection

Admin live view should show:

```text
employee
assessment
elapsed state
current scenario
agent state
live transcript
listen-only audio
```

Admin observer must not publish microphone audio.

Keep the live inspection screen operational and simple.

---

# Reports

Admin report should display:

```text
overall score
competency scores
strengths
gaps
recommended training
evidence
transcript
audio recording
```

Internal scoring is:

```text
1–5
```

The UI may additionally show percentages.

Example:

```text
4 / 5
80%
```

Evidence should link visibly to the relevant transcript section where possible.

---

# Forms

Use:

```text
controlled form state
Zod validation
backend error mapping
```

Do not duplicate complex validation rules manually if a shared schema exists.

Always handle:

```text
loading
success
validation error
server error
```

---

# Loading States

Do not leave blank screens while data loads.

Prefer:

```text
skeletons for page data
button spinner for mutations
clear connection state during LiveKit setup
```

Avoid full-screen loaders for small actions.

---

# Error States

Every important screen needs an explicit error state.

Examples:

```text
invitation expired
assessment unavailable
attempt limit reached
microphone permission denied
LiveKit connection failed
report generation failed
recording unavailable
```

Do not show raw provider errors to users.

---

# Component Rules

Components should generally fall into:

```text
Page
Feature component
Shared component
UI primitive
```

Page components coordinate features.

Feature components contain feature-specific UI.

Shared components are reusable across domains.

UI primitives belong in:

```text
components/ui
```

Do not place business logic inside generic UI components.

---

# Component Size

If a component becomes difficult to understand because it handles:

```text
data fetching
mutation logic
form state
rendering
dialogs
realtime logic
```

split it.

Prefer:

```text
AssessmentPage
├── useAssessment()
├── AssessmentHeader
├── ScenarioList
└── PublishAssessmentDialog
```

over one large page component.

---

# Hooks

Custom hooks are appropriate for reusable behavior.

Examples:

```text
useAssessment
useAttempt
useLiveAssessment
useLiveInspection
useMicrophoneCheck
```

Hooks should not hide unrelated business logic.

---

# Styling

Use Tailwind and existing UI primitives.

Visual direction:

```text
clean
minimal
professional
high whitespace discipline
clear hierarchy
restrained color use
```

Avoid:

```text
unnecessary gradients
oversized cards
excessive shadows
decorative illustrations
dashboard clutter
AI-generated-looking UI
```

Prioritize product usability over decoration.

---

# Responsive Design

Admin screens should work well on desktop.

Employee assessment flow should work on:

```text
desktop
tablet
mobile
```

Voice assessment controls must remain usable on smaller screens.

---

# Accessibility

At minimum:

```text
keyboard-accessible controls
visible focus states
proper labels
semantic buttons
accessible dialogs
meaningful status text
```

Do not rely only on color to communicate state.

---

# TypeScript Rules

Use strict TypeScript.

Do not use `any`.

Prefer:

```typescript
unknown
```

and narrow explicitly.

Backend response types should be declared clearly.

Avoid duplicating the same domain types across many feature folders.

---

# Error Boundaries

Use appropriate React error boundaries around major application areas.

A LiveKit or report component error should not crash the entire application where avoidable.

---

# Testing

Prioritize tests for:

```text
role-based routing
assessment editor
attempt availability
employee preparation flow
microphone check behavior
LiveKit session UI state
admin report rendering
expired invitation behavior
```

Do not over-test basic visual primitives.

---

# Do Not Build

For the prototype, avoid:

```text
complex global state architecture
custom component framework
custom WebRTC layer
custom audio visualization engine
advanced animation system
employee analytics dashboard
organization management UI
complex permission editor
video assessment UI
```

Use existing libraries where they already solve the problem.

---

# Coding Rules

When modifying this repository:

1. Keep feature boundaries clear.
2. Keep pages thin.
3. Use TanStack Query for server state.
4. Use the shared API client.
5. Do not duplicate backend authority in frontend logic.
6. Keep LiveKit logic inside the realtime feature.
7. Do not expose hidden assessment content.
8. Keep admin and employee experiences separated.
9. Handle loading and failure states explicitly.
10. Reuse existing components before creating new abstractions.
11. Keep TypeScript strict.
12. Optimize for a reliable end-to-end prototype, not feature count.

---

# Core Product Flow

```text
ADMIN

Create assessment
      ↓
Configure / AI-generate content
      ↓
Upload PDF
      ↓
Publish
      ↓
Invite employees
      ↓
Monitor live assessment
      ↓
Review evidence-backed report


EMPLOYEE

Open invitation
      ↓
Preparation
      ↓
Microphone check
      ↓
Start assessment
      ↓
Voice interaction
      ↓
Submit
      ↓
Completion screen
```

## Core Principle

The frontend should make a technically complex realtime assessment system feel simple:

> Admins configure and review. Employees prepare, speak, and finish.

This is the level I’d keep it at for the coding agent: enough structure that it **doesn’t freestyle the frontend architecture**, while still leaving it room to implement screens cleanly.
