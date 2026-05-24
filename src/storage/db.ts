import localforage from "localforage"
import type { AppData } from "@/types/models"

const STORAGE_KEY = "andreano-hair-salon:v1"

const store = localforage.createInstance({
  name: "andreano-hair-salon",
  storeName: "app",
  description: "Andreano Hair Salon - sistem akuntansi & manajemen usaha",
})

export async function loadAppData(): Promise<AppData | null> {
  const data = await store.getItem<AppData>(STORAGE_KEY)
  return data ?? null
}

export async function saveAppData(data: AppData): Promise<void> {
  await store.setItem(STORAGE_KEY, data)
}

export async function clearAppData(): Promise<void> {
  await store.removeItem(STORAGE_KEY)
}

