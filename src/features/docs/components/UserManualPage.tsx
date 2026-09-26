import { Fragment, useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, ArrowLeft, ArrowRight, ImageIcon, LockKeyhole } from "@/components/ui/icons"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/features/assessments/components/PageHeader"
import { cn } from "@/lib/utils"

// Screenshots are optional: drop PNGs into src/assets/docs/ using the file names below and they appear automatically.
const screenshots = import.meta.glob<string>("/src/assets/docs/*.png", { eager: true, query: "?url", import: "default" })

const sections = [
  { id: "overview", title: "System overview" },
  { id: "roles", title: "User roles" },
  { id: "sign-in", title: "Signing in (admin)" },
  { id: "dashboard", title: "Admin dashboard" },
  { id: "assessments", title: "Managing assessments" },
  { id: "create", title: "Creating an assessment" },
  { id: "edit", title: "Editing an assessment" },
  { id: "invite", title: "Inviting employees" },
  { id: "evaluations", title: "Evaluations" },
  { id: "reports", title: "Attempt reports" },
  { id: "live", title: "Live inspection" },
  { id: "settings", title: "Agent settings" },
  { id: "employee-flow", title: "Employee flow" },
  { id: "lifecycle", title: "Assessment lifecycle" },
  { id: "attempt-states", title: "Attempt states" },
  { id: "troubleshooting", title: "Troubleshooting" },
]

function useActiveSection() {
  const [active, setActive] = useState("overview")
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) setActive(visible[0].target.id)
    }, { rootMargin: "-80px 0px -65% 0px" })
    sections.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element) })
    return () => observer.disconnect()
  }, [])
  return active
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  const index = sections.findIndex((section) => section.id === id)
  return <section id={id} className="scroll-mt-24 space-y-5 border-b pb-10 last:border-b-0">
    <div><p className="eyebrow">Section {String(index + 1).padStart(2, "0")}</p><h2 className="font-display mt-1.5 text-2xl leading-tight sm:text-[1.75rem]">{sections[index]?.title}</h2></div>
    {children}
  </section>
}

function Subheading({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-base font-semibold">{children}</h3>
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{children}</p>
}

function Path({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.8em] text-foreground">{children}</code>
}

function Bullets({ items }: { items: ReactNode[] }) {
  return <ul className="max-w-3xl space-y-2 text-sm leading-6 text-muted-foreground">{items.map((item, index) => <li key={index} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#fa6619]" aria-hidden="true" /><span>{item}</span></li>)}</ul>
}

function Note({ tone = "info", children }: { tone?: "info" | "privacy"; children: ReactNode }) {
  const Icon = tone === "privacy" ? LockKeyhole : AlertCircle
  return <div className="flex max-w-3xl gap-3 rounded-2xl border bg-[#f7f7f7] p-4 text-sm leading-6"><Icon className="mt-0.5 size-4 shrink-0 text-[#c94b0b]" /><p>{children}</p></div>
}

function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return <div className="overflow-x-auto rounded-2xl border">
    <table className="w-full min-w-[32rem] text-left text-sm">
      <thead className="bg-[#f7f7f7]"><tr>{head.map((cell) => <th key={cell} scope="col" className="px-4 py-3 text-xs font-semibold text-muted-foreground">{cell}</th>)}</tr></thead>
      <tbody className="divide-y">{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className={cn("px-4 py-3 align-top leading-6", cellIndex === 0 ? "font-medium" : "text-muted-foreground")}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

function Figure({ number, file, caption }: { number: number; file: string; caption: string }) {
  const src = screenshots[`/src/assets/docs/${file}`]
  return <figure className="space-y-2">
    <div className="overflow-hidden rounded-2xl border bg-[#f7f7f7]">
      {src
        ? <img src={src} alt={caption} loading="lazy" className="block w-full" />
        : <div className="grid aspect-[16/9] place-items-center p-6 text-center text-muted-foreground"><div><ImageIcon className="mx-auto size-6" /><p className="mt-2 text-sm">Screenshot pending</p><p className="mt-1 font-mono text-xs">src/assets/docs/{file}</p></div></div>}
    </div>
    <figcaption className="text-xs text-muted-foreground">Figure {number} — {caption}</figcaption>
  </figure>
}

function Flow({ steps }: { steps: string[] }) {
  return <div className="flex flex-wrap items-center gap-2">{steps.map((step, index) => <Fragment key={step}>
    {index > 0 && <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />}
    <span className="rounded-full border bg-white px-3 py-1 font-mono text-xs font-medium">{step}</span>
  </Fragment>)}</div>
}

function Steps({ items }: { items: ReactNode[] }) {
  return <ol className="max-w-3xl space-y-3">{items.map((item, index) => <li key={index} className="flex gap-4 text-sm leading-6"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs font-semibold">{index + 1}</span><span className="pt-0.5 text-muted-foreground">{item}</span></li>)}</ol>
}

export function UserManualPage() {
  const active = useActiveSection()

  return <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="page-shell flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-3"><BrandMark to="/admin" /><span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" /><span className="hidden text-sm text-muted-foreground sm:inline">Docs</span></div>
        <Button size="sm" variant="secondary" asChild><Link to="/admin"><ArrowLeft />Back to workspace</Link></Button>
      </div>
    </header>
    <main className="page-shell space-y-8 py-7 sm:py-10">
    <PageHeader eyebrow="Documentation · v1.0" title="User manual" description="How administrators and employees use TAI Skill Checker, from building an assessment to reviewing evidence-backed reports." />
    <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav aria-label="Manual contents" className="sticky top-24">
          <p className="eyebrow mb-3 px-3">Contents</p>
          <ol className="space-y-0.5">{sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} aria-current={active === section.id ? "true" : undefined} className={cn("flex gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors", active === section.id ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className="w-5 shrink-0 font-mono text-xs leading-5 text-muted-foreground">{index + 1}</span>{section.title}</a></li>)}</ol>
        </nav>
      </aside>

      <div className="min-w-0 space-y-10">
        <Card className="lg:hidden"><CardContent className="p-5">
          <p className="eyebrow mb-3">Contents</p>
          <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">{sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="text-muted-foreground hover:text-foreground"><span className="mr-2 font-mono text-xs">{index + 1}</span>{section.title}</a></li>)}</ol>
        </CardContent></Card>

        <Section id="overview">
          <Prose>TAI Skill Checker is an AI-powered workforce skill assessment platform. Administrators design realistic, scenario-based voice assessments; employees complete them through a guided web experience; and an independent AI evaluator produces structured, evidence-backed competency reports.</Prose>
          <Prose>The platform uses LiveKit for real-time audio sessions and Gemini Live as the AI interviewer. A separate Gemini evaluation model scores each completed attempt against defined rubrics. All audio recordings are stored privately in Cloudflare R2 and are never publicly accessible.</Prose>
          <DataTable head={["Capability", "Description"]} rows={[
            ["Voice assessments", "Real-time conversational interviews conducted by an AI agent"],
            ["Scenario library", "Fixed, ordered scenarios with configurable adaptive follow-ups"],
            ["AI-assisted creation", "Upload training material; generate scenarios, rubrics, and competencies automatically"],
            ["Evidence-backed reports", "Each score references specific transcript turns as evidence"],
            ["Private recordings", "Audio stored in private cloud storage; admin playback via signed URLs"],
            ["Employee privacy", "Employees never see scores, rubrics, or evaluation output"],
          ]} />
        </Section>

        <Section id="roles">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardContent className="space-y-4 p-5 sm:p-6"><h3 className="font-semibold">Admin</h3><Bullets items={["Create and manage assessments", "Configure scenarios, competencies, and rubrics", "Generate content with AI assistance", "Invite employees via email", "Monitor live assessments", "Listen to active sessions", "Review transcripts and recordings", "Access evaluation reports"]} /></CardContent></Card>
            <Card><CardContent className="space-y-4 p-5 sm:p-6"><h3 className="font-semibold">Employee</h3><Bullets items={["Enter via a private invitation link", "View preparation information", "Check microphone before starting", "Complete a voice assessment", "Return via magic-link sign-in"]} /></CardContent></Card>
          </div>
          <Note tone="privacy">Employees cannot see scores, rubrics, expected answers, or evaluation reports.</Note>
        </Section>

        <Section id="sign-in">
          <Prose>Navigate to <Path>/admin/sign-in</Path>. Enter the administrator email and password configured for the workspace.</Prose>
          <Figure number={1} file="01-admin-sign-in.png" caption="Admin sign-in page" />
          <Note>The admin sign-in page is separate from the employee sign-in page. Admin credentials are fixed at workspace configuration time. Employee access uses one-time magic links.</Note>
        </Section>

        <Section id="dashboard">
          <Prose>After signing in, the admin dashboard is the default landing page (<Path>/admin</Path>). It provides an at-a-glance view of the entire workspace.</Prose>
          <Figure number={2} file="02-admin-dashboard.png" caption="Admin dashboard" />
          <Subheading>Dashboard panels</Subheading>
          <DataTable head={["Panel", "Description"]} rows={[
            ["Assessment status strip", "Total assessments, published count, draft count, and live active attempts at a glance"],
            ["Recent assessments", "The three most recently updated assessments with status badges"],
            ["Assessment library", "Full scrollable list of all assessments"],
            ["Statistics sidebar", "Published percentage gauge and workspace welcome message"],
            ["Review queue", "Latest completed employee attempts that have evaluation reports ready"],
          ]} />
          <Subheading>Navigation sidebar</Subheading>
          <Bullets items={[<><strong className="text-foreground">Overview</strong> — Dashboard home</>, <><strong className="text-foreground">Assessments</strong> — Full assessment library and management</>, <><strong className="text-foreground">Evaluations</strong> — All completed attempt evaluations</>, <><strong className="text-foreground">Live attempts</strong> — Real-time monitoring of active sessions</>, <><strong className="text-foreground">Settings</strong> — Agent configuration</>, <><strong className="text-foreground">User manual</strong> — This page</>]} />
        </Section>

        <Section id="assessments">
          <Prose>The Assessments page (<Path>/admin/assessments</Path>) lists every assessment in the workspace with their status badges and last-updated dates.</Prose>
          <Figure number={3} file="03-assessments-list.png" caption="Assessments list" />
          <Subheading>Assessment statuses</Subheading>
          <DataTable head={["Status", "Meaning"]} rows={[
            ["Draft", "Under construction; editable; not yet ready for employees"],
            ["Published", "Immutable live version; employees can be invited"],
            ["Archived", "No longer active; retained for historical records"],
          ]} />
        </Section>

        <Section id="create">
          <Prose>Click <strong className="text-foreground">New assessment</strong> from the dashboard or assessments list to open the creation form.</Prose>
          <Figure number={4} file="04-new-assessment.png" caption="New assessment creation form" />
          <Subheading>Creation options</Subheading>
          <Bullets items={[<><strong className="text-foreground">Manual</strong> — Enter all details, scenarios, competencies, and rubrics yourself.</>, <><strong className="text-foreground">AI-assisted</strong> — Upload training material (PDF) and let Gemini generate suggested scenarios, competencies, rubrics, and expected behaviours. All AI-generated content is editable before publishing.</>]} />
          <Subheading>Required assessment fields</Subheading>
          <DataTable head={["Field", "Description"]} rows={[
            ["Name", "Assessment title shown to employees"],
            ["Description", "Brief overview displayed on the invitation and preparation page"],
            ["Preparation instructions", "Guidance shown to employees before they start"],
            ["Competencies", "Skill areas being assessed (visible to employees)"],
            ["Scenarios", "Fixed ordered conversation scenarios"],
            ["Rubrics", "Hidden scoring criteria (not visible to employees)"],
          ]} />
          <Note>Once published, an assessment version is immutable. Any changes require creating a new version.</Note>
        </Section>

        <Section id="edit">
          <Prose>Selecting an assessment opens the detail view. Draft assessments can be edited via the <strong className="text-foreground">Edit</strong> button. Published assessments are read-only.</Prose>
          <Figure number={5} file="05-assessment-detail.png" caption="Assessment detail page (published)" />
          <Figure number={6} file="06-assessment-editor.png" caption="Assessment editor (draft)" />
          <Subheading>Editor sections</Subheading>
          <Bullets items={[<><strong className="text-foreground">Overview</strong> — Name, description, preparation instructions, cover image</>, <><strong className="text-foreground">Competencies</strong> — Add, edit, and reorder competency blocks</>, <><strong className="text-foreground">Scenarios</strong> — Configure each scenario prompt, context, and follow-up guidance</>, <><strong className="text-foreground">Rubrics</strong> — Define scoring criteria per competency per scenario</>, <><strong className="text-foreground">Resources</strong> — Upload PDF reference material used by the AI agent during interviews</>]} />
          <Subheading>Publishing</Subheading>
          <Prose>When the assessment is ready, click <strong className="text-foreground">Publish</strong>. Publishing locks the current content as an immutable version, makes the assessment available for employee invitations, and prevents further edits to that version.</Prose>
        </Section>

        <Section id="invite">
          <Prose>From a published assessment detail page, click <strong className="text-foreground">Invite employees</strong>. This opens the bulk invitation form at <Path>/admin/assessments/:id/invite</Path>.</Prose>
          <Figure number={7} file="07-invite-employees.png" caption="Invite employees page" />
          <Subheading>How invitations work</Subheading>
          <Steps items={[
            "Enter one or more employee email addresses (one per line or comma-separated).",
            <>Click <strong className="text-foreground">Send invitations</strong>. The system creates a unique, time-limited invitation link for each address and delivers it via email.</>,
            "Each invitation link is single-use and expires after the configured TTL (default 7 days).",
            "When the employee opens their link, they are directed to accept the invitation and begin their assigned assessment.",
          ]} />
          <Note>Opening an invitation or preparation page does not consume an attempt. An attempt is consumed only when the employee actually starts the realtime voice session.</Note>
          <Subheading>Attempt limits</Subheading>
          <Prose>Each assignment has a maximum number of attempts (default 3, configurable via the <Path>MAX_ASSESSMENT_ATTEMPTS</Path> environment variable). Once all attempts are used or the employee successfully completes the assessment, no further attempts are available.</Prose>
        </Section>

        <Section id="evaluations">
          <Prose>The Evaluations page (<Path>/admin/evaluations</Path>) shows all completed attempts that have been evaluated. The independent Gemini evaluator runs automatically after each successfully completed assessment.</Prose>
          <Figure number={8} file="08-evaluations.png" caption="Evaluations list" />
          <Subheading>What the evaluator produces</Subheading>
          <DataTable head={["Output", "Description"]} rows={[
            ["Overall score", "Aggregate competency rating across all scenarios"],
            ["Competency scores", "1–5 rating per competency (1 = very weak, 5 = excellent)"],
            ["Strengths", "Areas where the employee performed well"],
            ["Gaps", "Areas needing development"],
            ["Evidence", "Specific transcript turns cited to justify each score"],
            ["Recommended next steps", "Training and development guidance"],
          ]} />
          <Note>Scores without supporting transcript evidence are rejected by the system. Every competency score must be backed by specific evidence.</Note>
        </Section>

        <Section id="reports">
          <Prose>Click any entry in the Evaluations list or Review queue to open the full attempt report.</Prose>
          <Figure number={9} file="09-attempt-report.png" caption="Attempt report with evaluation results" />
          <Subheading>Report contents</Subheading>
          <Bullets items={["Employee identity and assessment information", "Overall result and competency scores shown as both a 1–5 rating and a percentage", "Strengths and gaps narrative", "Evidence table linking scores to transcript turns", "Recommended training and next steps", "Full session transcript", "Audio recording playback via short-lived signed URL"]} />
          <Note tone="privacy">Reports are accessible to administrators only. Employees are never shown scores, evaluation output, or recording links.</Note>
        </Section>

        <Section id="live">
          <Prose>The Live attempts page (<Path>/admin/live</Path>) shows all currently active assessment sessions in real time.</Prose>
          <Figure number={10} file="10-live-attempts.png" caption="Live attempts monitoring" />
          <Prose>Click <strong className="text-foreground">Inspect live</strong> on a session to open the listen-only inspection view with the current scenario, live audio, and rolling transcript.</Prose>
          <Figure number={11} file="11-live-inspection.png" caption="Listen-only live inspection" />
          <Subheading>What you can monitor</Subheading>
          <Bullets items={["Active employees currently in a session", "Which assessment and scenario each employee is on", "Current AI agent state", "Live rolling transcript", "Listen-only audio access (admin observer mode)"]} />
          <Note tone="privacy">Admin observers join in listen-only mode. Their microphone is never published into the session.</Note>
        </Section>

        <Section id="settings">
          <Prose>The Settings page (<Path>/admin/settings</Path>) allows configuration of the AI interviewer agent behaviour.</Prose>
          <Figure number={12} file="12-settings.png" caption="Agent settings" />
          <Prose>Settings include AI model selection, interviewer persona, and system-level behaviour controls. Changes take effect for new sessions.</Prose>
        </Section>

        <Section id="employee-flow">
          <Prose>Employees never use a traditional username/password login. Their entire journey is driven by secure invitation links and one-time magic links.</Prose>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Receiving the invitation", "The employee receives an email with a unique invitation link. It opens the invitation entry page showing the assessment name and description, the invited email, the expiry date, and a privacy notice. If they are not signed in, Accept invitation sends a one-time sign-in link to their email, which lands them on the preparation page."],
              ["Preparation page", "The employee sees the assessment name and description, remaining attempts, preparation instructions, competency names and descriptions (no rubrics or scoring criteria), and a microphone check that must pass before starting."],
              ["Voice assessment session", "Gemini Live conducts the session in real time: fixed scenarios in the configured order, adaptive follow-up questions, context retrieved from uploaded PDF resources, and every transcript turn and the audio recording persisted to storage."],
              ["Completion", "When all scenarios are complete, the session ends and the employee sees a confirmation screen. The assignment is locked and no further attempts are permitted."],
            ].map(([title, body], index) => <Card key={title}><CardContent className="p-5 sm:p-6"><p className="eyebrow">Step {index + 1}</p><h3 className="mt-1.5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></CardContent></Card>)}
          </div>
          <Note>Once the employee clicks <strong>Start assessment</strong>, an attempt is consumed immediately — even if they disconnect or close the page early.</Note>
          <Figure number={13} file="13-employee-preparation.png" caption="Employee preparation page with microphone check" />
          <Figure number={14} file="14-employee-session.png" caption="Live voice assessment session" />
          <Subheading>Returning employee sign-in</Subheading>
          <Prose>Employees who need to return to their dashboard visit <Path>/employee/sign-in</Path> and enter their email. A fresh magic link is sent to their inbox.</Prose>
          <Figure number={15} file="15-employee-sign-in.png" caption="Employee magic-link sign-in" />
          <Prose>After signing in, the employee workspace lists every assigned assessment with its status and remaining attempts, so they can prepare, start, or try again.</Prose>
          <Figure number={16} file="16-employee-home.png" caption="Employee workspace" />
        </Section>

        <Section id="lifecycle">
          <Flow steps={["DRAFT", "PUBLISHED", "ARCHIVED"]} />
          <DataTable head={["State", "Editable?", "Invitations?", "Description"]} rows={[
            ["Draft", "Yes", "No", "Assessment is under construction. Full editing is available."],
            ["Published", "No", "Yes", "Immutable version. Employees can be invited. Any change requires a new version."],
            ["Archived", "No", "No", "Retired assessment retained for historical records."],
          ]} />
        </Section>

        <Section id="attempt-states">
          <DataTable head={["State", "Description"]} rows={[
            [<span className="font-mono text-xs">READY</span>, "Attempt available; employee has not yet started"],
            [<span className="font-mono text-xs">IN_PROGRESS</span>, "Active live session underway"],
            [<span className="font-mono text-xs">PROCESSING</span>, "Session ended; evaluation is running"],
            [<span className="font-mono text-xs">COMPLETED</span>, "Evaluation finished; report available to admin"],
            [<span className="font-mono text-xs">ABANDONED</span>, "Session was interrupted, closed, or disconnected"],
            [<span className="font-mono text-xs">FAILED</span>, "Technical error prevented normal completion"],
            [<span className="font-mono text-xs">EXPIRED</span>, "Attempt was not started before the invitation expired"],
          ]} />
          <Subheading>Typical successful flow</Subheading>
          <Flow steps={["READY", "IN_PROGRESS", "PROCESSING", "COMPLETED"]} />
          <Subheading>Interrupted session flow</Subheading>
          <Flow steps={["IN_PROGRESS", "ABANDONED"]} />
          <Note>There is no reconnect or resume for an interrupted attempt. The employee must start a fresh attempt if attempts remain.</Note>
        </Section>

        <Section id="troubleshooting">
          <DataTable head={["Issue", "Likely cause", "Resolution"]} rows={[
            ["Invitation link says expired", "Link TTL (7 days) has passed", "Admin sends a fresh invitation from the assessment detail page"],
            ["Employee cannot start — button disabled", "Microphone check has not passed", "Employee grants microphone permission in the browser and retries the check"],
            ["Attempt shows ABANDONED", "Session was closed, disconnected, or the browser navigated away", "Employee uses a remaining attempt; admin reviews whether further attempts should be granted"],
            ["Report shows evaluation pending", "Evaluator is still processing the transcript", "Wait a few minutes and refresh; evaluation runs automatically after completion"],
            ["Magic link says used or expired", "Link was already clicked once or its TTL elapsed", <>Employee visits <Path>/employee/sign-in</Path> and requests a fresh link</>],
            ["Admin sign-in fails", "Incorrect credentials or session expired", <>Verify credentials match the <Path>ADMIN_EMAIL</Path> and <Path>ADMIN_PASSWORD</Path> environment variables</>],
            ["Audio playback unavailable", "Signed URL has expired", "Refresh the report page to generate a fresh signed URL"],
          ]} />
        </Section>
      </div>
    </div>
    </main>
  </div>
}
