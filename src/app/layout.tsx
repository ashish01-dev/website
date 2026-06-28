'use client'

import { useEffect } from 'react'
import './globals.css'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgressStore } from '@/store/progressStore'
import { useTimetableStore } from '@/store/timetableStore'
import { getSupabase } from '@/lib/supabase'
import { setSyncUser, syncPullAll } from '@/lib/supabase-sync'
import { db } from '@/lib/db'

const TABLE_KEYS: Record<string, string> = {
  progress: 'chapterId', timetable: 'id', tests: 'id', errors: 'id',
  formulas: 'id', dailylogs: 'date', settings: 'id', pomodoro: 'id',
  dailyplans: 'date', questions: 'id',
}
const SUPABASE_TO_DEXIE: Record<string, keyof typeof db> = {
  progress: 'progress', timetable: 'timetable', tests: 'tests', errors: 'errors',
  formulas: 'formulas', dailylogs: 'dailyLogs', settings: 'settings',
  pomodoro: 'pomodoro', dailyplans: 'dailyPlans', questions: 'questions',
}

async function afterSync() {
  await useSettingsStore.getState().load()
  await useProgressStore.getState().load()
  await useTimetableStore.getState().load()
}

async function initSync() {
  const sb = getSupabase()
  if (!sb) return
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    setSyncUser(user.id)
    const pulled = await syncPullAll()
    let hasNew = false
    for (const [table, items] of Object.entries(pulled)) {
      if (!items.length) continue
      const dexieKey = SUPABASE_TO_DEXIE[table]
      const tbl = dexieKey ? (db as any)[dexieKey] : null
      if (!tbl || !tbl._raw) continue
      const key = TABLE_KEYS[table] || 'id'
      const existing = await tbl._raw.toArray()
      const existingKeys = new Set(existing.map((e: any) => e[key]))
      for (const item of items) {
        if (!existingKeys.has((item as any)[key])) {
          await tbl._raw.put(item)
          hasNew = true
        }
      }
    }
    if (hasNew) afterSync()
  }
  sb.auth.onAuthStateChange((event, session) => {
    const uid = session?.user?.id ?? null
    setSyncUser(uid)
    if (event === 'SIGNED_IN' && uid) {
      syncPullAll().then(pulled => {
        for (const [table, items] of Object.entries(pulled)) {
          if (!items.length) continue
          const dexieKey = SUPABASE_TO_DEXIE[table]
          const tbl = dexieKey ? (db as any)[dexieKey] : null
          if (!tbl || !tbl._raw) continue
          tbl._raw.bulkPut(items)
        }
        afterSync()
      })
    }
  })
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { load } = useSettingsStore()
  const { load: loadProgress } = useProgressStore()
  const { load: loadTimetable } = useTimetableStore()

  useEffect(() => {
    initSync()
    load().then(() => { loadProgress(); loadTimetable() })
  }, [])

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#191919" />
        <link rel="manifest" href="/manifest.json" />
        <title>JEE 2027 — Command Center</title>
      </head>
      <body className="min-h-screen bg-notion-bg-dark text-notion-text-dark">
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('jee-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}`
        }} />
        {children}
      </body>
    </html>
  )
}
