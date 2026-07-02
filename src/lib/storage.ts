import { db } from './db'
import { getSupabase } from './supabase'

export interface StorageUsage {
  syncDataBytes: number
  storageBytes: number
  totalBytes: number
  limitBytes: number
  percentUsed: number
}

const FREE_LIMIT = 500 * 1024 * 1024
const PRO_LIMIT = 5 * 1024 * 1024 * 1024

export function getStorageLimit(isPro: boolean): number {
  return isPro ? PRO_LIMIT : FREE_LIMIT
}

function bytesEstimate(obj: unknown): number {
  return new Blob([JSON.stringify(obj)]).size
}

export async function estimateStorageUsage(isPro: boolean): Promise<StorageUsage> {
  let syncDataBytes = 0

  const tables = ['progress', 'timetable', 'tests', 'errors', 'formulas', 'dailyLogs', 'pomodoro', 'dailyPlans', 'questions', 'backlog', 'pyqAttempts', 'studySessions'] as const
  for (const table of tables) {
    try {
      const data = await (db as any)[table].toArray()
      for (const item of data) {
        syncDataBytes += bytesEstimate(item)
      }
    } catch {}
  }

  let storageBytes = 0
  try {
    const formulas = await db.formulas.toArray()
    for (const entry of formulas) {
      for (const file of entry.files || []) {
        storageBytes += file.size || 0
      }
    }
  } catch {}

  const totalBytes = syncDataBytes + storageBytes
  const limitBytes = getStorageLimit(isPro)
  const percentUsed = limitBytes > 0 ? (totalBytes / limitBytes) * 100 : 0

  return { syncDataBytes, storageBytes, totalBytes, limitBytes, percentUsed }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export async function checkStorageAndWarn(isPro: boolean): Promise<{ shouldWarn: boolean; usage: StorageUsage }> {
  const usage = await estimateStorageUsage(isPro)
  const shouldWarn = !isPro && usage.percentUsed >= 80
  return { shouldWarn, usage }
}
