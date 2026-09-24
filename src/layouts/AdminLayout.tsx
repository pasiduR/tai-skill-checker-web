import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Activity, ClipboardCheck, LayoutDashboard, LogOut, PanelsTopLeft } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { signOut, useAuth } from "@/features/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/assessments", label: "Assessments", icon: PanelsTopLeft },
  { to: "/admin/evaluations", label: "Evaluations", icon: ClipboardCheck },
  { to: "/admin/live", label: "Live attempts", icon: Activity },
]

export function AdminLayout() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useMutation({ mutationFn: signOut, onSuccess: async () => { queryClient.clear(); await queryClient.invalidateQueries({ queryKey: queryKeys.session }); navigate("/admin/sign-in") } })
  const navClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
    isActive ? "bg-brand-soft text-foreground [&_svg]:text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
  )
  const user = auth.session?.user

  return <div className="min-h-screen bg-[#f7f7f7] md:pl-56">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r bg-white px-4 py-5 md:flex">
      <div className="px-2"><BrandMark to="/admin" /></div>
      <div className="mt-9"><p className="eyebrow mb-2 px-3">Workspace</p><nav className="space-y-1">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} end={end} to={to} className={navClass}><Icon className="size-4" />{label}</NavLink>)}</nav></div>
      <div className="mt-auto border-t pt-4">
        <div className="mb-3 flex items-center gap-3 px-2"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">{user?.name?.slice(0, 1).toUpperCase() ?? "A"}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name || "Administrator"}</p><p className="truncate text-xs text-muted-foreground">{user?.email}</p></div></div>
        <Button className="w-full justify-start" size="sm" variant="ghost" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut />Sign out</Button>
      </div>
    </aside>

    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="md:hidden"><BrandMark to="/admin" compact /></div>
        <div className="hidden md:block"><p className="text-sm font-semibold">Assessment workspace</p><p className="text-xs text-muted-foreground">Create, monitor, and review skill assessments</p></div>
        <div className="ml-auto flex items-center gap-3 md:hidden"><span className="hidden max-w-44 truncate text-xs text-muted-foreground sm:inline">{user?.email}</span><Button size="icon" variant="secondary" aria-label="Sign out" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut /></Button></div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t px-3 py-2 md:hidden">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} end={end} to={to} className={navClass}><Icon className="size-4" />{label}</NavLink>)}</nav>
    </header>

    <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8"><div className="workspace-page"><Outlet /></div></main>
  </div>
}
