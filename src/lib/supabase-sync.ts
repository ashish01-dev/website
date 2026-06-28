import { getSupabase } from './supabase'

let userId: string | null = null

export function setSyncUser(uid: string | null) { userId = uid }

/* ─── camelCase → snake_case column mapping ─── */

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

function toSnake(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    out[CAMEL_TO_SNAKE[k] || k] = v
  }
  return out
}

/* ─── Supabase DB sync helpers ─── */

export async function syncUpsert(tableName: string, data: Record<string, unknown>) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    await sb.from(tableName).upsert({ ...toSnake(data), user_id: userId })
  } catch { /* silent */ }
}

export async function syncAdd(tableName: string, data: Record<string, unknown>) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    await sb.from(tableName).insert({ ...toSnake(data), user_id: userId })
  } catch { /* silent */ }
}

export async function syncDelete(tableName: string, column: string, value: string) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    const col = CAMEL_TO_SNAKE[column] || column
    await sb.from(tableName).delete().eq(col, value).eq('user_id', userId)
  } catch { /* silent */ }
}

export async function syncClear(tableName: string) {
  if (!userId) return
  try {
    const sb = getSupabase()
    if (!sb) return
    await sb.from(tableName).delete().eq('user_id', userId)
  } catch { /* silent */ }
}

/* ─── Supabase Storage helpers for formula files ─── */

export async function uploadFile(chapterId: string, file: File): Promise<string> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const path = `${user.id}/${chapterId}/${Date.now()}_${file.name}`
  const { error } = await sb.storage.from('formulas').upload(path, file)
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
    if (path) await sb.storage.from('formulas').remove([path])
  } catch { /* silent */ }
}
