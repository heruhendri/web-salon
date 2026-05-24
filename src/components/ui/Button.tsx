import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "info"
type Size = "sm" | "md" | "lg"

export default function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium outline-none transition",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-11 px-5 text-base",
        variant === "primary" &&
          "bg-[rgb(var(--emerald-deep)/0.92)] text-white hover:bg-[rgb(var(--emerald-deep)/1)] active:bg-[rgb(var(--emerald-deep)/0.92)] shadow-[0_0_0_1px_rgba(16,185,129,0.35)_inset]",
        variant === "secondary" &&
          "bg-[rgb(var(--panel2)/0.6)] text-[rgb(var(--text))] hover:bg-[rgb(var(--panel2)/0.78)] shadow-[0_0_0_1px_rgba(var(--border),0.10)_inset]",
        variant === "ghost" &&
          "bg-transparent text-[rgb(var(--text))] hover:bg-[rgb(var(--panel2)/0.55)]",
        variant === "danger" &&
          "bg-[rgb(var(--rose)/0.12)] text-[rgb(var(--text))] hover:bg-[rgb(var(--rose)/0.18)] shadow-[0_0_0_1px_rgba(244,63,94,0.35)_inset]",
        variant === "info" &&
          "bg-[rgb(var(--sky)/0.12)] text-[rgb(var(--text))] hover:bg-[rgb(var(--sky)/0.18)] shadow-[0_0_0_1px_rgba(56,189,248,0.35)_inset]",
        className,
      )}
    />
  )
}
