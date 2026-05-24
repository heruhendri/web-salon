import { cn } from "@/lib/utils"

export default function Badge({ tone = "neutral", children }: { tone?: "neutral" | "good" | "bad" | "info"; children: string }) {
  const cls =
    tone === "good"
      ? "bg-[rgb(var(--emerald)/0.14)] text-[rgb(var(--text))] ring-1 ring-[rgb(var(--emerald)/0.35)]"
      : tone === "bad"
        ? "bg-[rgb(var(--rose)/0.14)] text-[rgb(var(--text))] ring-1 ring-[rgb(var(--rose)/0.35)]"
        : tone === "info"
          ? "bg-[rgb(var(--sky)/0.14)] text-[rgb(var(--text))] ring-1 ring-[rgb(var(--sky)/0.35)]"
          : "bg-[rgb(var(--panel2))] text-[rgb(var(--text))] ring-1 ring-[rgb(var(--border)/0.12)]"

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", cls)}>
      {children}
    </span>
  )
}
