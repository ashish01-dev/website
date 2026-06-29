import { getSupabase } from './supabase'

let userId: string | null = null

export function setSyncUser(uid: string | null) { userId = uid }

/* ─── camelCase ↔ snake_case column mapping ─── */

const CAMEL_TO_SNAKE: Record<string, string> = {
  chapterId: 'chapter_id',
  completedOn: 'completed_on',
  topicStatus: 'topic_status',
  customTopics: 'custom_topics',
  updatedAt: 'updated_at',
  studyMinutes: 'study_minutes',
  chaptersCompleted: 'chapters_completed',
  questionsAttempted: 'questions_attempted',
  pomodoroSessions: 'pomodoro_sessions',
}

const SNAKE_TO_CAMEL: Record<string, string> = {}
for (const [k, v] of Object.entries(CAMEL_TO_SNAKE)) SNAKE_TO_CAMEL[v] = k

function toSnake(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    out[CAMEL_TO_SNAKE[k] || k] = v
  }
  return out
}

function toCamel(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    if (k === 'user_id') continue
    out[SNAKE_TO_CAMEL[k] || k] = v
  }
  return out
}

/* ─── Supabase DB sync helpers ─── */

export async function syncUpsert(tableName: string, data: Record<string, unknown>) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    await (sb.from(tableName) as any).upsert({ ...toSnake(data), user_id: userId })
  } catch (err) { console.error('syncUpsert error:', err) }
}

export async function syncAdd(tableName: string, data: Record<string, unknown>) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    await (sb.from(tableName) as any).insert({ ...toSnake(data), user_id: userId })
  } catch (err) { console.error('syncAdd error:', err) }
}

export async function syncDelete(tableName: string, column: string, value: string) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    const col = CAMEL_TO_SNAKE[column] || column
    await (sb.from(tableName) as any).delete().eq(col, value).eq('user_id', userId)
  } catch (err) { console.error('syncDelete error:', err) }
}

export async function syncClear(tableName: string) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    await (sb.from(tableName) as any).delete().eq('user_id', userId)
  } catch (err) { console.error('syncClear error:', err) }
}

/* ─── Supabase pull (cloud → local sync on sign-in) ─── */

const ALL_TABLES = ['progress', 'timetable', 'tests', 'errors', 'formulas', 'dailylogs', 'settings', 'pomodoro', 'dailyplans', 'questions'] as const

export async function syncPullAll(): Promise<Record<string, unknown[]>> {
  if (!userId) return {}
  const sb = getSupabase()
  if (!sb) return {}
  const result: Record<string, unknown[]> = {}
  for (const table of ALL_TABLES) {
    try {
      const { data } = await (sb.from(table) as any).select('*').eq('user_id', userId)
      if (data) result[table] = data.map(toCamel)
    } catch (err) { console.error('syncPullAll error:', err) }
  }
  return result
}

/* ─── Supabase Storage helpers for formula files ─── */

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)
}

export async function uploadFile(chapterId: string, file: File): Promise<string> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) throw new Error('File too large (max 10 MB)')
  const safeName = sanitizeFileName(file.name)
  const path = `${user.id}/${chapterId}/${Date.now()}_${safeName}`
  const { error } = await sb.storage.from('formulas').upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = sb.storage.from('formulas').getPublicUrl(path)
  return publicUrl
}

export async function deleteStorageFile(url: string) {
  try {
    const sb = getSupabase()
    if (!sb) return
    const parts = url.split('/')
    const bucketIdx = parts.indexOf('formulas')
    if (bucketIdx === -1) return
    const path = parts.slice(bucketIdx + 1).join('/').split('?')[0]
    if (!path) return
    if (!userId) return
    if (!path.startsWith(`${userId}/`)) {
      console.error('deleteStorageFile: path does not belong to current user')
      return
    }
    await sb.storage.from('formulas').remove([path])
  } catch (err) { console.error('deleteStorageFile error:', err) }
}
