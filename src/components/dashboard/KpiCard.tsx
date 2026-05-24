import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export default function KpiCard({
  label,
  value,
  tone = "neutral",
  icon,
  footer,
}: {
  label: string
  value: string
  tone?: "neutral" | "good" | "bad" | "info"
  icon?: ReactNode
  footer?: ReactNode
}) {
  const ring =
    tone === "good"
      ? "shadow-[0_0_0_1px_rgba(16,185,129,0.25)_inset]"
      : tone === "bad"
        ? "shadow-[0_0_0_1px_rgba(244,63,94,0.25)_inset]"
        : tone === "info"
          ? "shadow-[0_0_0_1px_rgba(56,189,248,0.25)_inset]"
          : "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"

  const chip =
    tone === "good"
      ? "bg-emerald-950/60 text-emerald-200"
      : tone === "bad"
        ? "bg-rose-950/60 text-rose-200"
        : tone === "info"
          ? "bg-sky-950/60 text-sky-200"
          : "bg-zinc-900/60 text-zinc-200"

  return (
    <div className={cn("rounded-2xl bg-zinc-950/40 p-5 backdrop-blur", ring)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium text-zinc-400">{label}</div>
          <div className="mt-2 truncate text-xl font-semibold tracking-tight text-zinc-100">{value}</div>
        </div>
        {icon ? (
          <div className={cn("rounded-xl px-2 py-2 text-xs shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]", chip)}>
            {icon}
          </div>
        ) : null}
      </div>
      {footer ? <div className="mt-4 text-xs text-zinc-400">{footer}</div> : null}
    </div>
  )
}

