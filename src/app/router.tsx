import { lazy, Suspense } from "react"
import { Navigate, Outlet, createBrowserRouter } from "react-router-dom"
import { AdminDashboard, AssessmentDetailPage, AssessmentEditorPage, AssessmentsPage, NewAssessmentPage } from "@/features/assessments"
import { CompletedPage, PreparationPage } from "@/features/assignments"
import { AccessPendingPage, EmployeeHome, EmployeeSignInPage, RequireRole, SignInPage, useAuth } from "@/features/auth"
import { InvitationEntryPage, InvitePage } from "@/features/invitations"
import { GenericPageSkeleton } from "@/components/shared/AsyncState"
import { PageLoader } from "@/components/ui/bars-loader"
import { AdminSkeletonGallery } from "./BoneyardGallery"
import { AdminLayout } from "@/layouts/AdminLayout"
import { EmployeeLayout } from "@/layouts/EmployeeLayout"
import { homePathForRole } from "@/features/auth/routing"
import { LiveAttemptPage, LiveAttemptsPage } from "@/features/liveInspection"
import { AttemptReportPage } from "@/features/reports"
import { EvaluationsPage } from "@/features/evaluations"
import { AgentSettingsPage } from "@/features/agentSettings"

const AssessmentSessionPage = lazy(() => import("@/features/liveAssessment").then((module) => ({ default: module.AssessmentSessionPage })))

function HomeRedirect() {
  const auth = useAuth()
  if (auth.isLoading) return <main className="p-8"><GenericPageSkeleton /></main>
  if (!auth.session) return <Navigate to="/admin/sign-in" replace />
  return <Navigate to={homePathForRole(auth.role)} replace />
}

function NotFound() {
  return <main className="grid min-h-screen place-items-center p-6 text-center"><div><p className="font-mono text-xs text-muted-foreground">404</p><h1 className="mt-2 text-2xl font-semibold">Page not found</h1><a className="mt-5 inline-block text-sm text-primary underline" href="/">Return home</a></div></main>
}

function BoneyardCaptureRoute() {
  const buildMode = Boolean((window as Window & { __BONEYARD_BUILD?: boolean }).__BONEYARD_BUILD)
  const previewMode = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview")
  return buildMode || previewMode ? <Outlet /> : <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  { path: "/", element: <HomeRedirect /> },
  { path: "/admin/sign-in", element: <SignInPage /> },
  { path: "/employee/sign-in", element: <EmployeeSignInPage /> },
  { path: "/access-pending", element: <AccessPendingPage /> },
  { path: "/invite/:token", element: <InvitationEntryPage /> },
  { path: "/invitations/:token", element: <InvitationEntryPage /> },
  { path: "/__boneyard", element: <BoneyardCaptureRoute />, children: [
    { element: <AdminLayout />, children: [{ path: "admin", element: <AdminSkeletonGallery /> }] },
  ] },
  { element: <RequireRole role="ADMIN" />, children: [{ element: <AdminLayout />, children: [
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/assessments", element: <AssessmentsPage /> },
    { path: "/admin/assessments/new", element: <NewAssessmentPage /> },
    { path: "/admin/assessments/:id", element: <AssessmentDetailPage /> },
    { path: "/admin/assessments/:id/edit", element: <AssessmentEditorPage /> },
    { path: "/admin/assessments/:id/invite", element: <InvitePage /> },
    { path: "/admin/evaluations", element: <EvaluationsPage /> },
    { path: "/admin/live", element: <LiveAttemptsPage /> },
    { path: "/admin/live/:attemptId", element: <LiveAttemptPage /> },
    { path: "/admin/attempts/:attemptId", element: <AttemptReportPage /> },
    { path: "/admin/settings", element: <AgentSettingsPage /> },
  ] }] },
  { element: <RequireRole role="EMPLOYEE" />, children: [{ element: <EmployeeLayout />, children: [
    { path: "/employee", element: <EmployeeHome /> },
    { path: "/assessment/:assignmentId/prepare", element: <PreparationPage /> },
    { path: "/assessment/:assignmentId/session", element: <Suspense fallback={<PageLoader className="h-dvh text-white" label="Connecting to your session…" />}><AssessmentSessionPage /></Suspense> },
    { path: "/assessment/:assignmentId/completed", element: <CompletedPage /> },
  ] }] },
  { path: "*", element: <NotFound /> },
])
