export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function clampNumber(n: number): number {
  if (!Number.isFinite(n)) return 0
  return n
}

