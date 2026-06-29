'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import './globals.css'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgressStore } from '@/store/progressStore'
import { useTimetableStore } from '@/store/timetableStore'
import { getSupabase } from '@/lib/supabase'
import { setSyncUser, syncPullAll } from '@/lib/supabase-sync'
import { db } from '@/lib/db'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

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

async function fillLocalFromCloud() {
  const pulled = await syncPullAll()
  for (const [table, items] of Object.entries(pulled)) {
    const dexieKey = SUPABASE_TO_DEXIE[table]
    const tbl = dexieKey ? (db as any)[dexieKey] : null
    if (!tbl || !tbl._raw) continue
    if (items.length) {
      await tbl._raw.bulkPut(items)
    } else {
      await tbl._raw.clear()
    }
  }
}

async function initSync() {
  const sb = getSupabase()
  if (!sb) return
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    setSyncUser(user.id)
    await fillLocalFromCloud()
    await useSettingsStore.getState().load()
    await useProgressStore.getState().load()
    await useTimetableStore.getState().load()
  }
  sb.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    const uid = session?.user?.id ?? null
    setSyncUser(uid)
    if (event === 'SIGNED_IN' && uid) {
      fillLocalFromCloud().then(() => {
        useSettingsStore.getState().load()
        useProgressStore.getState().load()
        useTimetableStore.getState().load()
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
        <Script id="theme-init" strategy="beforeInteractive">{`try{var t=localStorage.getItem('jee-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}`}</Script>
        {children}
      </body>
    </html>
  )
}
