import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export default function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[rgb(var(--panel)/0.65)] p-6 text-center shadow-[0_0_0_1px_rgba(var(--border),0.10)_inset]",
        className,
      )}
    >
      <div className="text-sm font-semibold text-[rgb(var(--text))]">{title}</div>
      <div className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</div>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
