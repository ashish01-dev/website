'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/syllabus', label: 'Syllabus', icon: '📚' },
  { href: '/roadmap', label: 'Roadmap', icon: '🗺️' },
  { href: '/timetable', label: 'Timetable', icon: '📅' },
  { href: '/progress', label: 'Progress', icon: '📈' },
  { href: '/pomodoro', label: 'Pomodoro', icon: '🍅' },
  { href: '/completion', label: 'Completion', icon: '✅' },
  { href: '/activity', label: 'Journal', icon: '📓' },
  { href: '/questions', label: 'Questions', icon: '❓' },
  { href: '/tests', label: 'Tests', icon: '📝' },
  { href: '/revision', label: 'Revision', icon: '🧠' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

const SUBJECT_STYLES: Record<Subject, { color: string; bg: string }> = {
  physics: { color: '#2383e2', bg: 'bg-[#2383e2]/10' },
  chemistry: { color: '#0f8a5e', bg: 'bg-[#0f8a5e]/10' },
  maths: { color: '#d9730d', bg: 'bg-[#d9730d]/10' },
}

function getChapterStats(subject: Subject, progress: Record<string, { status: string }>) {
  let total = 0, done = 0
  const data = syllabus[subject]
  for (const div of data.divisions) {
    for (const ch of div.chapters) {
      if (ch.deleted) continue
      total++
      if (progress[ch.id]?.status === 'done') done++
    }
  }
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export default function Sidebar() {
  const pathname = usePathname()
  const { progress, loaded } = useProgressStore()
  const { settings } = useSettingsStore()

  const subs = ['physics', 'chemistry', 'maths'] as Subject[]

  return (
    <aside className="hidden md:flex flex-col h-screen w-60 fixed left-0 top-0 bg-white/[0.03] backdrop-blur-2xl border-r border-white/[0.06] py-2 select-none">
      <div className="px-3 py-2 mb-1">
        <div className="text-sm font-semibold text-notion-text-dark">{settings.name || 'User'}</div>
        <div className="text-[11px] text-notion-muted-dark">JEE 2027</div>
      </div>

      <div className="flex-1 px-1.5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-2 py-1 rounded-notion text-sm transition-colors ${
                isActive ? 'bg-notion-sidebar-hover-dark text-notion-text-dark' : 'text-notion-muted-dark hover:text-notion-text-dark hover:bg-notion-sidebar-hover-dark'
              }`}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {loaded && (
        <div className="px-3 pt-2 mt-2 border-t border-notion-border-dark">
          <div className="text-[10px] text-notion-muted-dark uppercase tracking-wider mb-2 font-medium">Chapter Progress</div>
          <div className="space-y-1.5">
            {subs.map(sub => {
              const stats = getChapterStats(sub, progress)
              const style = SUBJECT_STYLES[sub]
              return (
                <div key={sub} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: style.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-notion-muted-dark capitalize truncate">{sub}</span>
                      <span className="text-notion-text-dark font-medium ml-1">{stats.done}/{stats.total}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/[0.06] mt-0.5">
                      <div className="h-full rounded-full transition-all" style={{ width: `${stats.pct}%`, backgroundColor: style.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
