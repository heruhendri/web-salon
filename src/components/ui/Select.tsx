import type { SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export default function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-lg bg-[rgb(var(--panel2)/0.6)] px-3 text-sm text-[rgb(var(--text))]",
        "shadow-[0_0_0_1px_rgba(var(--border),0.10)_inset] outline-none",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        className,
      )}
    />
  )
}
