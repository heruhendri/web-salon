import type { AppData, DocumentNumbering } from "@/types/models"

export type DocumentType = keyof DocumentNumbering

export function getNextNumber(data: AppData, type: DocumentType): { next: string; updated: DocumentNumbering } {
  const seq = data.documentNumbering[type]
  const nextNumber = seq.nextNumber
  const padded = String(nextNumber).padStart(seq.padding, "0")
  const next = `${seq.prefix}${padded}`

  return {
    next,
    updated: {
      ...data.documentNumbering,
      [type]: { ...seq, nextNumber: nextNumber + 1 },
    },
  }
}

