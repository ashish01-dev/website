'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import './globals.css'
import Footer from '@/components/layout/Footer'
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
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)
  const APP_PATHS = ['/dashboard', '/syllabus', '/roadmap', '/timetable', '/progress', '/pomodoro', '/completion', '/activity', '/questions', '/tests', '/revision', '/settings']
  const isAppPage = APP_PATHS.some(p => pathname.startsWith(p))

  useEffect(() => {
    initSync()
    load().then(() => { loadProgress(); loadTimetable() })
  }, [])

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then((res: { data: { user: any } }) => {
      if (res.data?.user) {
        const meta = res.data.user.user_metadata
        const name = meta?.full_name || meta?.name || meta?.given_name || res.data.user.email?.split('@')[0] || null
        setUserName(name)
      }
    })
  }, [pathname])

  useEffect(() => {
    if (pathname === '/dashboard' && userName) {
      document.title = `JEEIFY — ${userName}`
    } else {
      document.title = 'JEEIFY'
    }
  }, [pathname, userName])

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#191919" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" />
        <title>JEEIFY</title>
      </head>
      <body className="min-h-screen" style={{ background: 'var(--c-bg-gradient)', color: 'var(--c-text)', fontFamily: "'DM Sans', sans-serif" }}>
        <Script id="theme-init" strategy="beforeInteractive">{`try{var t=localStorage.getItem('jee-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}`}</Script>
        <div className="animate-page-in flex flex-col min-h-screen">
          <div className="flex-1">
            {children}
          </div>
          {!isAppPage && <Footer />}
        </div>
      </body>
    </html>
  )
}
