import { Navigate, createBrowserRouter } from "react-router-dom"
import { AdminDashboard, AssessmentDetailPage, AssessmentEditorPage, AssessmentsPage, NewAssessmentPage } from "@/features/assessments"
import { EmployeeHome, OrganizationSetupPage, RequireRole, SignInPage, useAuth } from "@/features/auth"
import { InvitePage } from "@/features/invitations"
import { AdminLayout } from "@/layouts/AdminLayout"
import { EmployeeLayout } from "@/layouts/EmployeeLayout"
import { homePathForRole } from "@/features/auth/routing"

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
  { element: <RequireRole role="ADMIN" />, children: [{ element: <AdminLayout />, children: [
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/assessments", element: <AssessmentsPage /> },
    { path: "/admin/assessments/new", element: <NewAssessmentPage /> },
    { path: "/admin/assessments/:id", element: <AssessmentDetailPage /> },
    { path: "/admin/assessments/:id/edit", element: <AssessmentEditorPage /> },
    { path: "/admin/assessments/:id/invite", element: <InvitePage /> },
  ] }] },
  { element: <RequireRole role="EMPLOYEE" />, children: [{ element: <EmployeeLayout />, children: [{ path: "/employee", element: <EmployeeHome /> }] }] },
  { path: "*", element: <NotFound /> },
])
