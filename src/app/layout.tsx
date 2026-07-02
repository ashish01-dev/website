'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import './globals.css'
import Footer from '@/components/layout/Footer'
import LandingAIAssistant from '@/components/ai/LandingAIAssistant'
import AITutorPanel from '@/components/ai/AITutorPanel'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import PageTransition from '@/components/layout/PageTransition'
import DashboardTour from '@/components/dashboard/DashboardTour'
import OfflineOverlay from '@/components/OfflineOverlay'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgressStore } from '@/store/progressStore'
import { useTimetableStore } from '@/store/timetableStore'
import { getSupabase } from '@/lib/supabase'
import { setSyncUser, syncPullAll } from '@/lib/supabase-sync'
import { useUser } from '@/lib/useUser'
import { db, dexie } from '@/lib/db'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

const TABLE_KEYS: Record<string, string> = {
  progress: 'chapterId', timetable: 'id', tests: 'id', errors: 'id',
  formulas: 'id', dailylogs: 'date', settings: 'id',
  dailyplans: 'date', questions: 'id', backlog: 'id', pyqattempts: 'id', studysessions: 'id',
}
const SUPABASE_TO_DEXIE: Record<string, keyof typeof db> = {
  progress: 'progress', timetable: 'timetable', tests: 'tests', errors: 'errors',
  formulas: 'formulas', dailylogs: 'dailyLogs', settings: 'settings',
  dailyplans: 'dailyPlans', questions: 'questions', backlog: 'backlog', pyqAttempts: 'pyqAttempts', studySessions: 'studySessions',
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

async function clearAllLocalData() {
  try {
    await dexie.progress.clear()
    await dexie.timetable.clear()
    await dexie.tests.clear()
    await dexie.errors.clear()
    await dexie.formulas.clear()
    await dexie.dailyLogs.clear()
    await dexie.settings.clear()
    await dexie.dailyPlans.clear()
    await dexie.questions.clear()
    await dexie.backlog.clear()
    await dexie.pyqAttempts.clear()
    await dexie.studySessions.clear()
  } catch (err) { console.error('clearAllLocalData:', err) }
}

async function initSync() {
  const sb = getSupabase()
  if (!sb) return
  try {
    const { data: { user } } = await sb.auth.getUser()
    if (user) {
      setSyncUser(user.id)
      await fillLocalFromCloud()
      await useSettingsStore.getState().load()
      await useProgressStore.getState().load()
      await useTimetableStore.getState().load()
      const meta = user.user_metadata
      const googleName = meta?.full_name || meta?.name || meta?.given_name || ''
      const googleAvatar = meta?.avatar_url || meta?.picture || ''
      const s = useSettingsStore.getState().settings
      const updates: Record<string, any> = {}
      if (googleName && s.name !== googleName) updates.name = googleName
      if (googleAvatar && !s.avatarUrl) updates.avatarUrl = googleAvatar
      if (Object.keys(updates).length) await useSettingsStore.getState().update(updates)
    }
  } catch (e) { console.error('initSync getUser:', e) }
  sb.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    const uid = session?.user?.id ?? null
    setSyncUser(uid)
    if (event === 'SIGNED_IN' && uid) {
      fillLocalFromCloud().then(() => {
        useSettingsStore.getState().load()
        useProgressStore.getState().load()
        useTimetableStore.getState().load()
      })
      if (session?.user?.user_metadata) {
        const meta = session.user.user_metadata
        const googleName = meta.full_name || meta.name || meta.given_name || ''
        const googleAvatar = meta.avatar_url || meta.picture || ''
        const s = useSettingsStore.getState().settings
        const updates: Record<string, any> = {}
        if (googleName && s.name !== googleName) updates.name = googleName
        if (googleAvatar && !s.avatarUrl) updates.avatarUrl = googleAvatar
        if (Object.keys(updates).length) useSettingsStore.getState().update(updates)
      }
    }
    if (event === 'SIGNED_OUT') {
      clearAllLocalData()
      useSettingsStore.getState().reset()
      useProgressStore.getState().load()
      useTimetableStore.getState().load()
    }
  })
}

function RequireAuth({ children, isAppPage }: { children: React.ReactNode; isAppPage: boolean }) {
  const { user, loading } = useUser()
  const [redirected, setRedirected] = useState(false)
  const isLoggingOut = useRef(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isLoggingOut.current = sessionStorage.getItem('voluntary_logout') === 'true'
      if (isLoggingOut.current) sessionStorage.removeItem('voluntary_logout')
    }
  }, [])
  useEffect(() => {
    if (!loading && isAppPage && !user && !redirected && !isLoggingOut.current) {
      setRedirected(true)
      window.location.href = '/?signin=true'
    }
  }, [loading, isAppPage, user, redirected])
  if (isAppPage && !user && !loading) return null
  if (isAppPage && loading && !user) return null
  return <>{children}</>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { load } = useSettingsStore()
  const { load: loadProgress } = useProgressStore()
  const { load: loadTimetable } = useTimetableStore()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)
  const APP_PATHS = ['/dashboard', '/syllabus', '/timetable', '/progress', '/completion', '/activity', '/questions', '/tests', '/revision', '/formula-vault', '/settings', '/ai', '/pyq', '/backlog']
  const isAppPage = APP_PATHS.some(p => {
    if (p === '/ai') return pathname === '/ai'
    return pathname.startsWith(p)
  })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await initSync()
      } catch (e) { console.error('initSync failed:', e) }
      if (cancelled) return
      if (!useSettingsStore.getState().loaded) {
        await load()
        await loadProgress()
        await loadTimetable()
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then((res: { data: { user: any } }) => {
      if (res.data?.user) {
        const meta = res.data.user.user_metadata
        const name = meta?.full_name || meta?.name || meta?.given_name || res.data.user.email?.split('@')[0] || null
        setUserName(name)
      } else {
        setUserName(null)
      }
    })
  }, [])

  useEffect(() => {
    if (pathname === '/dashboard' && userName) {
      document.title = `JEEIFY — ${userName}`
    } else {
      document.title = 'JEEIFY'
    }
  }, [pathname, userName])

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#191919" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23191919'/%3E%3Ccircle cx='74' cy='26' r='8' fill='%232383e2' opacity='0.25'/%3E%3Ctext x='50' y='66' text-anchor='middle' font-size='44' font-weight='800' font-family='system-ui,sans-serif' fill='white'%3EJ%3C/text%3E%3C/svg%3E" />
        <title>JEEIFY</title>
      </head>
      <body className="min-h-screen" style={{ background: 'var(--c-bg-gradient)', color: 'var(--c-text)', fontFamily: "'DM Sans', sans-serif" }}>
        <Script id="theme-init" strategy="beforeInteractive">{`try{var t=localStorage.getItem('jee-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else if(t==='dark'){document.documentElement.classList.add('dark')}else{if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else{document.documentElement.classList.add('dark')}}}catch(e){document.documentElement.classList.add('dark')}`}</Script>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <PageTransition>
              <RequireAuth isAppPage={isAppPage}>{children}</RequireAuth>
            </PageTransition>
          </div>
          {!isAppPage && <Footer />}
        </div>
        {isAppPage ? <AITutorPanel /> : <LandingAIAssistant />}
        <OnboardingFlow />
        <DashboardTour />
        <OfflineOverlay />
      </body>
    </html>
  )
}
