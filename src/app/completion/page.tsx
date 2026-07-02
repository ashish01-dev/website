'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useProgressStore } from '@/store/progressStore'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, Chapter } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

const SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']
const SUBJECT_ICONS: Record<Subject, string> = { physics: '⚡', chemistry: '🧪', maths: '📐' }
const SUBJECT_COLORS: Record<Subject, string> = { physics: 'var(--c-blue)', chemistry: 'var(--c-green)', maths: 'var(--c-orange)' }

interface DivisionInfo {
  id: string
  name: string
  chapters: Chapter[]
}

function getDivisions(subject: Subject): DivisionInfo[] {
  return syllabus[subject].divisions.map(d => ({
    id: d.id,
    name: d.name,
    chapters: d.chapters.filter(c => !c.deleted),
  }))
}

export default function CompletionPage() {
  const { progress, setChapterStatus, getSubjectChapters } = useProgressStore()
  const [tab, setTab] = useState<Subject>('physics')

  const divisions = getDivisions(tab)
  const stats = getSubjectChapters(tab)

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Completion</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Track completed chapters per subject</p>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Overall Progress</span>
            <span className="text-2xl font-bold" style={{ color: SUBJECT_COLORS[tab] }}>{stats.done}/{stats.total} chapters</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%`, backgroundColor: SUBJECT_COLORS[tab] }} />
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b pb-0" style={{ borderColor: 'var(--c-border)' }}>
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-2 text-sm border-b-2 -mb-[1px] transition-colors flex items-center gap-1.5 ${
                tab === s ? 'border-[var(--c-blue)] text-[var(--c-blue)] font-medium' : 'border-transparent hover:text-[var(--c-text)]'
              }`}
              style={{ color: tab !== s ? 'var(--c-muted)' : undefined }}
            >
              <span>{SUBJECT_ICONS[s]}</span>
              <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {divisions.map(div => {
            const doneInDiv = div.chapters.filter(ch => progress[ch.id]?.status === 'done').length
            return (
              <div key={div.id} className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{div.name}</h3>
                  <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{doneInDiv}/{div.chapters.length}</span>
                </div>
                <div className="space-y-1">
                  {div.chapters.map(ch => {
                    const isDone = progress[ch.id]?.status === 'done'
                    return (
                      <label
                        key={ch.id}
                        className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-black/[0.02] cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={e => setChapterStatus(ch.id, e.target.checked ? 'done' : 'not_started')}
                          className="w-4 h-4 rounded text-[var(--c-blue)] focus:ring-[#2383e2]"
                          style={{ borderColor: 'rgba(0,0,0,0.15)' }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${isDone ? 'line-through' : ''}`} style={{ color: isDone ? 'var(--c-muted)' : 'var(--c-text)' }}>
                            {ch.name}
                          </span>
                          <span className="ml-2 text-[10px]" style={{ color: 'var(--c-muted)' }}>Class {ch.class} · {ch.weightage}</span>
                        </div>
                        {isDone && <span className="text-xs font-medium" style={{ color: 'var(--c-green)' }}>✓</span>}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
