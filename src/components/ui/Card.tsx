import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl bg-[rgb(var(--panel)/0.65)] shadow-[0_0_0_1px_rgba(var(--border),0.10)_inset] backdrop-blur",
        className,
      )}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("px-5 pt-5", className)} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("text-sm font-semibold text-[rgb(var(--text))]", className)} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mt-1 text-xs text-[rgb(var(--muted))]", className)} />
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("px-5 pb-5 pt-4", className)} />
}
