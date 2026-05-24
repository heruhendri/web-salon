import type { InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-lg bg-[rgb(var(--panel2)/0.6)] px-3 text-sm text-[rgb(var(--text))]",
        "shadow-[0_0_0_1px_rgba(var(--border),0.10)_inset] outline-none",
        "placeholder:text-[rgb(var(--muted))] focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        className,
      )}
    />
  )
}
