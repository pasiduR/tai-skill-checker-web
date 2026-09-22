import { lazy, Suspense } from "react"
import { Navigate, createBrowserRouter } from "react-router-dom"
import { AdminDashboard, AssessmentDetailPage, AssessmentEditorPage, AssessmentsPage, NewAssessmentPage } from "@/features/assessments"
import { CompletedPage, PreparationPage } from "@/features/assignments"
import { EmployeeHome, OrganizationSetupPage, RequireRole, SignInPage, useAuth } from "@/features/auth"
import { InvitationEntryPage, InvitePage } from "@/features/invitations"
import { PageSkeleton } from "@/components/shared/AsyncState"
import { AdminLayout } from "@/layouts/AdminLayout"
import { EmployeeLayout } from "@/layouts/EmployeeLayout"
import { homePathForRole } from "@/features/auth/routing"

const AssessmentSessionPage = lazy(() => import("@/features/liveAssessment").then((module) => ({ default: module.AssessmentSessionPage })))

function HomeRedirect() {
  const auth = useAuth()
  if (auth.isLoading) return <main className="p-8 text-sm text-muted-foreground">Loading session…</main>
  if (!auth.session) return <Navigate to="/sign-in" replace />
  return <Navigate to={homePathForRole(auth.role)} replace />
}

function NotFound() {
  return <main className="grid min-h-screen place-items-center p-6 text-center"><div><p className="font-mono text-xs text-muted-foreground">404</p><h1 className="mt-2 text-2xl font-semibold">Page not found</h1><a className="mt-5 inline-block text-sm text-primary underline" href="/">Return home</a></div></main>
}

export const router = createBrowserRouter([
  { path: "/", element: <HomeRedirect /> },
  { path: "/sign-in", element: <SignInPage /> },
  { path: "/setup", element: <OrganizationSetupPage /> },
  { path: "/invite/:token", element: <InvitationEntryPage /> },
  { path: "/invitations/:token", element: <InvitationEntryPage /> },
  { element: <RequireRole role="ADMIN" />, children: [{ element: <AdminLayout />, children: [
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/assessments", element: <AssessmentsPage /> },
    { path: "/admin/assessments/new", element: <NewAssessmentPage /> },
    { path: "/admin/assessments/:id", element: <AssessmentDetailPage /> },
    { path: "/admin/assessments/:id/edit", element: <AssessmentEditorPage /> },
    { path: "/admin/assessments/:id/invite", element: <InvitePage /> },
  ] }] },
  { element: <RequireRole role="EMPLOYEE" />, children: [{ element: <EmployeeLayout />, children: [
    { path: "/employee", element: <EmployeeHome /> },
    { path: "/assessment/:assignmentId/prepare", element: <PreparationPage /> },
    { path: "/assessment/:assignmentId/session", element: <Suspense fallback={<PageSkeleton />}><AssessmentSessionPage /></Suspense> },
    { path: "/assessment/:assignmentId/completed", element: <CompletedPage /> },
  ] }] },
  { path: "*", element: <NotFound /> },
])
