import type { TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export default function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full resize-y rounded-lg bg-[rgb(var(--panel2)/0.6)] px-3 py-2 text-sm text-[rgb(var(--text))]",
        "shadow-[0_0_0_1px_rgba(var(--border),0.10)_inset] outline-none",
        "placeholder:text-[rgb(var(--muted))] focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        className,
      )}
    />
  )
}
