'use client'

import { useEffect } from 'react'
import './globals.css'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgressStore } from '@/store/progressStore'
import { useTimetableStore } from '@/store/timetableStore'
import { getSupabase } from '@/lib/supabase'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { load } = useSettingsStore()
  const { load: loadProgress } = useProgressStore()
  const { load: loadTimetable } = useTimetableStore()

  useEffect(() => {
    getSupabase()
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
