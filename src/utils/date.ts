export function todayLocalISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function firstDayOfMonthISO(dateISO: string): string {
  const [y, m] = dateISO.split("-")
  return `${y}-${m}-01`
}

export function monthKey(dateISO: string): string {
  const [y, m] = dateISO.split("-")
  return `${y}-${m}`
}

