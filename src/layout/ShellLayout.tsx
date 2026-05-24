import { Outlet } from "react-router-dom"
import AppShell from "@/layout/AppShell"

export default function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

