import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LogOut } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { signOut, useAuth } from "@/features/auth"

export function EmployeeLayout() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useMutation({ mutationFn: signOut, onSuccess: () => { queryClient.clear(); navigate("/employee/sign-in", { replace: true }) } })

  return <div className="min-h-screen bg-white"><header className="border-b"><div className="page-shell flex h-16 items-center justify-between gap-4"><BrandMark /><div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:inline">{auth.session?.user.email}</span><Button size="sm" variant="secondary" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut />Sign out</Button></div></div></header><main className="page-shell py-12 sm:py-20"><Outlet /></main></div>
}
