import { cn } from "@/lib/utils"

function normalize(values: number[]): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return values.map(() => 0.5)
  return values.map((v) => (v - min) / (max - min))
}

export default function Sparkline({
  values,
  className,
  tone = "emerald",
}: {
  values: number[]
  className?: string
  tone?: "emerald" | "rose" | "sky"
}) {
  if (!values.length) return null

  const w = 160
  const h = 44
  const p = 6
  const xs = values.map((_, i) => p + (i * (w - p * 2)) / Math.max(1, values.length - 1))
  const ys = normalize(values).map((v) => p + (1 - v) * (h - p * 2))
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${ys[i].toFixed(2)}`).join(" ")

  const stroke = tone === "rose" ? "stroke-rose-400" : tone === "sky" ? "stroke-sky-400" : "stroke-emerald-400"
  const fill = tone === "rose" ? "fill-rose-500/10" : tone === "sky" ? "fill-sky-500/10" : "fill-emerald-500/10"

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-11 w-40", className)} aria-hidden="true">
      <path d={`${d} L ${w - p} ${h - p} L ${p} ${h - p} Z`} className={cn(fill)} />
      <path d={d} className={cn("fill-none stroke-[2.25]", stroke)} strokeLinecap="round" />
    </svg>
  )
}

