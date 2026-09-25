import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LogOut } from "@/components/ui/icons"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { signOut, useAuth } from "@/features/auth"

export function EmployeeLayout() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const logout = useMutation({ mutationFn: signOut, onSuccess: () => { queryClient.clear(); navigate("/employee/sign-in", { replace: true }) } })
  const isLiveSession = location.pathname.endsWith("/session")

  if (isLiveSession) return <main className="h-dvh overflow-hidden bg-surface-dark"><Outlet /></main>

  return <div className="min-h-screen bg-[#f7f7f7]"><header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur"><div className="page-shell flex h-14 items-center justify-between gap-4"><BrandMark /><div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:inline">{auth.session?.user.email}</span><Button size="sm" variant="secondary" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut />Sign out</Button></div></div></header><main className="page-shell py-7 sm:py-10"><Outlet /></main></div>
}
