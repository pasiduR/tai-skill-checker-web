import { Navigate, Outlet, useLocation } from "react-router-dom"
import { AppLoader } from "@/components/shared/AppLoader"
import { ErrorNotice } from "@/components/shared/AsyncState"
import { useAuth } from "../hooks/useAuth"
import type { UserRole } from "../types"
import { homePathForRole } from "../routing"

export function RequireRole({ role }: { role: UserRole }) {
  const auth = useAuth()
  const location = useLocation()
  if (auth.isLoading) return <AppLoader />
  if (auth.error) return <main className="mx-auto max-w-2xl p-8"><ErrorNotice message="Your session could not be verified." /></main>
  if (!auth.session) return <Navigate to={role === "EMPLOYEE" ? "/employee/sign-in" : "/admin/sign-in"} state={{ from: location.pathname }} replace />
  if (auth.role !== role) return <Navigate to={homePathForRole(auth.role)} replace />
  return <Outlet />
}
