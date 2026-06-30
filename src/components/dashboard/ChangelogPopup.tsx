'use client'

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

const APP_VERSION = '1.0.0'

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: 'June 2026',
    changes: [
      'Dashboard: Subject progress cards, study heatmap, and daily plan',
      'Syllabus tracker with topic-level progress',
      'Pomodoro timer with session history',
      'Timetable planner with weekly scheduling',
      'Formula sheets with file uploads',
      'Test entry with accuracy tracking',
      'AI Tutor for personalized study help',
      'Cloud sync across devices via Supabase',
      'Dark mode support throughout the app',
      'Pro subscription for unlimited storage and features',
    ],
  },
]

export default function ChangelogPopup() {
  const { settings, loaded, update } = useSettingsStore()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!loaded) return
    if (!settings.showChangelog) return
    if (settings.changelogSeenVersion !== APP_VERSION) {
      setShow(true)
      update({ changelogSeenVersion: APP_VERSION })
    }
  }, [loaded, settings.showChangelog, settings.changelogSeenVersion])

  if (!show) return null

  const latest = CHANGELOG[0]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto rounded-[18px] px-[26px] py-[28px]" style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(35,131,226,0.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.2px]" style={{ color: 'var(--c-text)' }}>What&apos;s New</h2>
            <p className="text-[11px]" style={{ color: 'var(--c-muted)' }}>v{latest.version} · {latest.date}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {latest.changes.map((change, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm leading-snug" style={{ color: 'var(--c-text-secondary)' }}>
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-blue)' }} />
              {change}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShow(false)}
            className="text-xs font-medium px-5 py-2 rounded-[40px] text-white transition-all"
            style={{ background: 'var(--c-btn-primary)' }}
          >Got it</button>
        </div>
      </div>
    </div>
  )
}
