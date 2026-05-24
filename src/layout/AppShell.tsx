import { useEffect, useState } from "react"
import Sidebar from "@/layout/Sidebar"
import TopBar from "@/layout/TopBar"
import { useAppStore } from "@/state/appStore"
import { useTheme } from "@/hooks/useTheme"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated)
  const hydrate = useAppStore((s) => s.hydrate)
  const reset = useAppStore((s) => s.reset)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -left-48 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-700/10 blur-3xl" />
        <div className="absolute -right-52 top-40 h-[560px] w-[560px] rounded-full bg-sky-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[520px] w-[520px] rounded-full bg-rose-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenMenu={() => setMobileOpen(true)} onReset={reset} theme={theme} onToggleTheme={toggleTheme} />
          <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
