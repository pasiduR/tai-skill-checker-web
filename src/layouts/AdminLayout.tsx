import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Assessment, Bell, Evaluation, LayoutDashboard, LiveActivity, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "@/components/ui/icons"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { signOut, useAuth } from "@/features/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/assessments", label: "Assessments", icon: Assessment },
  { to: "/admin/evaluations", label: "Evaluations", icon: Evaluation },
  { to: "/admin/live", label: "Live attempts", icon: LiveActivity },
]

function pageTitle(pathname: string) {
  if (pathname === "/admin") return "Operations overview"
  if (pathname.startsWith("/admin/assessments/new")) return "New assessment"
  if (pathname.startsWith("/admin/assessments")) return "Assessments"
  if (pathname.startsWith("/admin/evaluations")) return "Evaluations"
  if (pathname.startsWith("/admin/live")) return "Live attempts"
  if (pathname.startsWith("/admin/attempts")) return "Attempt report"
  return "Admin workspace"
}

export function AdminLayout() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("admin-sidebar-collapsed") === "true")
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const logout = useMutation({ mutationFn: signOut, onSuccess: async () => { queryClient.clear(); await queryClient.invalidateQueries({ queryKey: queryKeys.session }); navigate("/admin/sign-in") } })
  const user = auth.session?.user

  useEffect(() => setMobileNavigationOpen(false), [location.pathname])
  useEffect(() => localStorage.setItem("admin-sidebar-collapsed", String(sidebarCollapsed)), [sidebarCollapsed])
  useEffect(() => {
    if (!mobileNavigationOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileNavigationOpen(false) }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [mobileNavigationOpen])

  const navClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color,transform] duration-200",
    sidebarCollapsed && "md:justify-center md:px-0",
    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  )

  const sidebar = (mobile = false) => <>
    <div className={cn("flex h-[72px] items-center", sidebarCollapsed && !mobile ? "justify-center px-2" : "px-5")}>
      <BrandMark to="/admin" compact={sidebarCollapsed && !mobile} />
      {mobile && <Button className="ml-auto" size="icon" variant="ghost" aria-label="Close navigation" onClick={() => setMobileNavigationOpen(false)}><X /></Button>}
    </div>
    <div className={cn("flex-1 overflow-y-auto py-6", sidebarCollapsed && !mobile ? "px-2" : "px-4")}>
      {(!sidebarCollapsed || mobile) && <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Workspace</p>}
      <nav className="space-y-1" aria-label="Admin navigation">
        {navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} end={end} to={to} className={navClass} title={sidebarCollapsed && !mobile ? label : undefined}><Icon className="size-[18px]" /><span className={cn(sidebarCollapsed && !mobile && "md:sr-only")}>{label}</span></NavLink>)}
      </nav>
    </div>
    <div className={cn("border-t py-4", sidebarCollapsed && !mobile ? "px-2" : "px-4")}>
      <div className={cn("flex items-center gap-3", sidebarCollapsed && !mobile ? "justify-center" : "px-2")}>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">{user?.name?.slice(0, 1).toUpperCase() ?? "A"}</span>
        {(!sidebarCollapsed || mobile) && <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user?.name || "Administrator"}</p><p className="truncate text-xs text-muted-foreground">{user?.email}</p></div>}
      </div>
      <Button className={cn("mt-3", sidebarCollapsed && !mobile ? "w-full px-0" : "w-full justify-start")} size={sidebarCollapsed && !mobile ? "icon" : "sm"} variant="ghost" aria-label="Sign out" title={sidebarCollapsed && !mobile ? "Sign out" : undefined} disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut />{(!sidebarCollapsed || mobile) && "Sign out"}</Button>
    </div>
  </>

  return <div className="min-h-screen bg-[#f4f4f3]">
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col bg-[#f4f4f3] transition-[width] duration-300 md:flex", sidebarCollapsed ? "w-[72px]" : "w-60")}>{sidebar()}</aside>
    {mobileNavigationOpen && <div className="fixed inset-0 z-40 md:hidden"><button className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" aria-label="Close navigation" onClick={() => setMobileNavigationOpen(false)} /><aside className="relative flex h-full w-[min(20rem,88vw)] flex-col bg-white shadow-xl">{sidebar(true)}</aside></div>}
    <div className={cn("min-w-0 transition-[padding] duration-300", sidebarCollapsed ? "md:pl-[72px]" : "md:pl-60")}>
      <div className="min-h-screen bg-white md:mt-2 md:min-h-[calc(100vh-0.5rem)] md:rounded-tl-2xl md:border-l md:border-t">
        <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur md:rounded-tl-2xl">
          <div className="flex h-[64px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button className="md:hidden" size="icon" variant="ghost" aria-label="Open navigation" onClick={() => setMobileNavigationOpen(true)}><Menu /></Button>
            <Button className="hidden md:inline-flex" size="icon" variant="ghost" aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setSidebarCollapsed((value) => !value)}>{sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button>
            <div className="h-6 w-px bg-border" aria-hidden="true" />
            <p className="min-w-0 truncate text-sm font-medium">{pageTitle(location.pathname)}</p>
            <Button className="ml-auto" size="icon" variant="ghost" aria-label="Notifications" title="Notifications"><Bell /></Button>
          </div>
        </header>
        <main className="min-w-0 overflow-x-hidden px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10"><div className="workspace-page"><Outlet /></div></main>
      </div>
    </div>
  </div>
}
