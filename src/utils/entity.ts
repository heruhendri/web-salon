import { newId, nowIso } from "@/utils/id"

export type BaseEntity = { id: string; createdAt: string; updatedAt: string }

export function withNewBase<T extends Omit<BaseEntity, "id" | "createdAt" | "updatedAt">>(partial: T): BaseEntity & T {
  const now = nowIso()
  return { ...(partial as T), id: newId(), createdAt: now, updatedAt: now }
}

export function touch<T extends BaseEntity>(entity: T): T {
  return { ...entity, updatedAt: nowIso() }
}

export function upsert<T extends BaseEntity>(rows: T[], next: T): T[] {
  const isNew = !next.id
  const prepared = isNew
    ? ({ ...next, id: newId(), createdAt: nowIso(), updatedAt: nowIso() } as T)
    : ({ ...next, updatedAt: nowIso() } as T)

  const idx = rows.findIndex((r) => r.id === prepared.id)
  if (idx === -1) return [prepared, ...rows]
  const copy = [...rows]
  copy[idx] = prepared
  return copy
}

export function removeById<T extends BaseEntity>(rows: T[], id: string): T[] {
  return rows.filter((r) => r.id !== id)
}

