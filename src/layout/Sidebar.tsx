import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { navGroups } from "@/layout/nav"

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="h-full w-[288px] shrink-0 border-r border-[rgb(var(--border)/0.12)] bg-[rgb(var(--panel)/0.65)] backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900/60 shadow-[0_0_0_1px_rgba(16,185,129,0.25)_inset]">
          <div className="h-2 w-2 rounded-full bg-emerald-300" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[rgb(var(--text))]">Andreano Hair Salon</div>
          <div className="truncate text-xs text-[rgb(var(--muted))]">Akuntansi • Manajemen • Laporan</div>
        </div>
      </div>

      <div className="h-[calc(100%-4rem)] overflow-auto px-2 pb-6">
        {navGroups.map((g) => (
          <div key={g.label} className="mt-4">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">
              {g.label}
            </div>
            <div className="grid gap-1">
              {g.items.map((it) => {
                const Icon = it.icon
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[rgb(var(--muted))] transition",
                        "hover:bg-[rgb(var(--panel2)/0.55)] hover:text-[rgb(var(--text))]",
                        isActive &&
                          "bg-[rgb(var(--emerald-deep)/0.22)] text-[rgb(var(--text))] shadow-[0_0_0_1px_rgba(16,185,129,0.22)_inset]",
                      )
                    }
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-[rgb(var(--panel2)/0.6)] shadow-[0_0_0_1px_rgba(var(--border),0.08)_inset]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 truncate">{it.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
