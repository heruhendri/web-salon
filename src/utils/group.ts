export function groupBy<T, K extends string>(rows: T[], keyFn: (row: T) => K): Record<K, T[]> {
  return rows.reduce((acc, r) => {
    const k = keyFn(r)
    ;(acc[k] ||= []).push(r)
    return acc
  }, {} as Record<K, T[]>)
}

