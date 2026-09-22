import { Outlet } from "react-router-dom"
import { BrandMark } from "@/components/shared/BrandMark"

export function EmployeeLayout() {
  return <div className="min-h-screen bg-white"><header className="border-b"><div className="page-shell flex h-16 items-center"><BrandMark /></div></header><main className="page-shell py-12 sm:py-20"><Outlet /></main></div>
}
