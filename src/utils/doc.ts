export function makeSimpleNumber(prefix: string, dateISO: string): string {
  const compact = dateISO.replace(/-/g, "")
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  return `${prefix}${compact}-${rand}`
}
