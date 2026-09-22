# FRONTEND_TASKS.md

> Frontend only. Follow `frontend/AGENT.md` before making changes.
>
> **Design is defined in `frontend/DESIGN.md`.**
> Read it before building or changing UI. Do not invent a new visual direction.

## Frontend Stack

- React
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- LiveKit React Components
- Zod

## shadcn Rule

Use shadcn through the CLI and import the generated components into the project.

Example:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add progress
```

Then import them normally:

```tsx
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
```

Do **not** browse the shadcn website, inspect screenshots, or recreate components manually unless the CLI genuinely cannot provide what is needed.

Prefer CLI installation + local imports to save tokens and keep implementation consistent.

---

# Phase 1 — App Foundation + Admin Assessment Flow

Goal: establish frontend structure, API integration, auth routing, and the complete admin assessment creation flow.

### Tasks

- Set up React + strict TypeScript.
- Configure:
  - React Router
  - TanStack Query
  - Tailwind
  - shadcn/ui
- Create shared API client.
- Create centralized query keys.
- Add auth/session handling.
- Add role-aware routing for:
  - `ADMIN`
  - `EMPLOYEE`
- Add layouts:
  - `AdminLayout`
  - `EmployeeLayout`

### Admin Pages

Implement:

```text
/admin
/admin/assessments
/admin/assessments/new
/admin/assessments/:id
/admin/assessments/:id/edit
/admin/assessments/:id/invite
```

### Assessment Editor

Support:

- assessment name
- description
- preparation instructions
- topics / competencies
- scenarios
- rubrics
- expected behaviours
- follow-up guidance
- PDF resource upload
- manual creation
- AI-assisted generation
- preview
- publish

Use a simple editor structure:

```text
Overview
Scenarios
Competencies
Resources
Settings
```

Published versions should be read-only.

### Invitations

Implement:

- invite multiple employee emails
- show invitation status
- validation and error states

### Done when

Admin can:

```text
sign in
→ create assessment
→ manually or AI-generate content
→ upload PDF
→ publish
→ invite multiple employees
```

---

# Phase 2 — Employee Assessment + LiveKit Realtime UI

Goal: complete the employee journey and realtime assessment experience.

### Employee Routes

Implement:

```text
/invite/:token
/assessment/:assignmentId/prepare
/assessment/:assignmentId/session
/assessment/:assignmentId/completed
```

### Preparation Screen

Show:

- assessment title
- description
- topics / competencies
- preparation instructions
- remaining attempts
- microphone check
- start assessment button

Do NOT show:

- exact scenarios
- exact questions
- expected answers
- rubrics
- evaluator prompts
- scores

### Microphone Check

Support:

- permission request
- microphone selection if practical
- input level feedback
- clear permission/error state

### Live Assessment UI

Keep the screen minimal.

Show:

- assessment title
- connection/session state
- agent listening/speaking state
- audio visualization
- live transcript
- microphone control
- end assessment action

Use official LiveKit React components where appropriate.

Do not build custom WebRTC infrastructure.

### Session State

Represent explicitly:

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

### Interrupted Attempts

Prototype behavior:

- no reconnect/resume
- if employee stops, closes, or disconnects, the attempt is consumed
- if attempts remain, employee may start again
- after successful completion, assignment is locked

UI must clearly explain this before starting.

### Completed Screen

After successful submission:

- show completion confirmation
- do not show scores
- do not show evaluator output
- prevent another attempt

### Done when

Employee can:

```text
open invitation
→ prepare
→ test microphone
→ start
→ speak with Gemini Live through LiveKit
→ see transcript/state
→ complete assessment
→ see completion screen
```

---

# Phase 3 — Admin Live Inspection + Reports + Polish

Goal: complete the admin review experience and harden the frontend for demo use.

### Live Inspection

Routes:

```text
/admin/live
/admin/live/:attemptId
```

Show:

- active employee
- assessment
- current scenario
- current agent state
- live transcript
- listen-only audio

Admin must never publish microphone audio.

### Attempt Report

Route:

```text
/admin/attempts/:attemptId
```

Show:

- overall score
- competency scores
- optional percentage representation
- strengths
- gaps
- recommended training
- transcript-backed evidence
- transcript
- audio recording

Internal score:

```text
1–5
```

Example UI:

```text
4 / 5
80%
```

Evidence should link to the relevant transcript section where practical.

### Error / Empty States

Handle explicitly:

- expired invitation
- invalid invitation
- assessment unavailable
- attempt limit reached
- microphone denied
- LiveKit connection failure
- session interrupted
- report processing
- report failed
- recording unavailable
- no active assessments
- no assessments yet

### Final Polish

- responsive employee flow
- desktop-focused admin experience
- accessible dialogs and controls
- loading skeletons
- button mutation states
- proper focus states
- no raw provider errors
- no UI clutter

### Done when

Full frontend flow works:

```text
ADMIN
create assessment
→ publish
→ invite
→ inspect live attempt
→ review final report

EMPLOYEE
open invite
→ prepare
→ microphone check
→ complete voice assessment
→ completion screen
```

---

# File / Feature Structure

Keep features isolated.

```text
src/
├── app/
├── api/
├── components/
│   ├── ui/
│   └── shared/
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
├── layouts/
├── hooks/
├── lib/
└── types/
```

Each feature:

```text
feature/
├── components/
├── hooks/
├── api/
├── types/
└── index.ts
```

---

# Build Order Rule

Within each phase:

1. route/page shell
2. API/query hooks
3. core UI
4. states/errors
5. integration polish

Do not spend time polishing secondary UI before the end-to-end flow works.

---

# Design Rule

`frontend/DESIGN.md` is the source of truth for visual decisions.

Before adding or changing UI:

1. read `frontend/DESIGN.md`
2. follow its spacing, typography, color, component, and layout rules
3. reuse existing patterns
4. do not invent decorative styles that are not in the design system

If a UI decision is not specified, choose the simplest option consistent with `DESIGN.md`.

Avoid:

- unnecessary gradients
- oversized cards
- excessive shadows
- decorative illustrations
- dashboard clutter
- random accent colors
- “AI-looking” visual noise

---

# Prototype Rule

Do not build:

- custom design system
- custom WebRTC
- complex global state
- employee analytics dashboard
- organization management UI
- video assessment UI
- advanced animation system
- complex permission editor

Use existing libraries and shadcn components wherever possible.

Build the smallest frontend that makes the realtime assessment flow feel polished and reliable.
