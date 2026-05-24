import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      {children}
    </label>
  )
}

