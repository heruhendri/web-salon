import { create } from "zustand"
import { loadAppData, saveAppData, clearAppData } from "@/storage/db"
import type { AppData } from "@/types/models"
import { createEmptyData } from "@/domain/seed"
import { normalizeAppData } from "@/domain/migrate"

type AppState = {
  hydrated: boolean
  data: AppData
  hydrate: () => Promise<void>
  update: (updater: (data: AppData) => AppData) => void
  reset: () => Promise<void>
}

let saveTimer: number | null = null
let lastSaved: string | null = null

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  data: createEmptyData(),
  hydrate: async () => {
    const loaded = await loadAppData()
    set({ data: normalizeAppData(loaded), hydrated: true })
    scheduleSave(get().data)
  },
  update: (updater) => {
    set((s) => {
      const next = updater(s.data)
      scheduleSave(next)
      return { data: next }
    })
  },
  reset: async () => {
    await clearAppData()
    const next = createEmptyData()
    set({ data: next, hydrated: true })
    scheduleSave(next)
  },
}))

function scheduleSave(data: AppData) {
  const snapshot = JSON.stringify(data)
  if (snapshot === lastSaved) return
  if (saveTimer) window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(async () => {
    lastSaved = snapshot
    await saveAppData(data)
  }, 350)
}
