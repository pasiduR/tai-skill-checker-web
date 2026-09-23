import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Activity, LayoutDashboard, LogOut, PanelsTopLeft } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { signOut, useAuth } from "@/features/auth"
import { cn } from "@/lib/utils"

export function AdminLayout() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useMutation({ mutationFn: signOut, onSuccess: async () => { queryClient.clear(); await queryClient.invalidateQueries({ queryKey: queryKeys.session }); navigate("/admin/sign-in") } })
  const navClass = ({ isActive }: { isActive: boolean }) => cn("flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors", isActive ? "bg-[#0a0b0d] text-white" : "text-[#5b616e] hover:bg-[#eef0f3] hover:text-[#0a0b0d]")
  return <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur"><div className="page-shell flex h-16 items-center justify-between">
      <BrandMark to="/admin" />
      <div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground md:inline">{auth.session?.user.email}</span><Button size="sm" variant="secondary" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut />Sign out</Button></div>
    </div></header>
    <div className="page-shell grid md:grid-cols-[210px_1fr]">
      <aside className="border-b py-4 md:min-h-[calc(100vh-4rem)] md:border-b-0 md:border-r md:py-8 md:pr-6"><p className="eyebrow mb-3 hidden md:block">Workspace</p><nav className="flex gap-2 overflow-x-auto md:flex-col"><NavLink end to="/admin" className={navClass}><LayoutDashboard />Overview</NavLink><NavLink to="/admin/assessments" className={navClass}><PanelsTopLeft />Assessments</NavLink><NavLink to="/admin/live" className={navClass}><Activity />Live</NavLink></nav></aside>
      <main className="min-w-0 py-8 md:pl-8 lg:py-12 lg:pl-12"><Outlet /></main>
    </div>
  </div>
}
