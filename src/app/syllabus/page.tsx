'use client'

import { useState, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ChapterCard from '@/components/syllabus/ChapterCard'
import type { Subject, SyllabusData } from '@/types'
import syllabusData from '@/data/syllabus.json'

const syllabus = syllabusData as unknown as SyllabusData
const SUBJECTS: { id: Subject; label: string }[] = [
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'maths', label: 'Maths' },
]

export default function SyllabusPage() {
  const [activeSubject, setActiveSubject] = useState<Subject>('physics')
  const [search, setSearch] = useState('')

  const subjectData = syllabus[activeSubject]

  const filteredDivisions = useMemo(() =>
    subjectData.divisions.map(div => ({
      ...div,
      chapters: div.chapters.filter(ch =>
        !search || ch.name.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(div => div.chapters.length > 0),
    [subjectData, search]
  )

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Syllabus Tracker</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Track your JEE 2027 syllabus progress</p>

        <div className="flex items-center gap-1 mb-6 border-b border-[rgba(0,0,0,0.06)] pb-0">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSubject(s.id)}
              className={`px-3 py-2 text-sm transition-colors border-b-2 -mb-[1px] ${
                activeSubject === s.id ? 'border-[var(--c-blue)] text-[var(--c-blue)] font-medium' : 'border-transparent hover:text-[var(--c-text)]' 
              }`}
              style={{ color: activeSubject === s.id ? undefined : 'var(--c-muted)' }}
            >
              {s.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chapters..."
              className="w-full px-3 py-2 text-xs outline-none rounded-[40px]"
              style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredDivisions.map(div => (
            <div key={div.id}>
              <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{div.name}</h2>
              <div className="space-y-1">
                {div.chapters.map(ch => (
                  <ChapterCard key={ch.id} chapter={ch} />
                ))}
              </div>
            </div>
          ))}

          {subjectData.deletedChapters.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold mb-2 line-through" style={{ color: 'var(--c-muted)' }}>Removed Chapters</h2>
              <div className="space-y-1">
                {subjectData.deletedChapters.map((dc, i) => (
                  <div key={i} className="rounded-[18px] p-3 opacity-40" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                    <span className="text-sm line-through" style={{ color: 'var(--c-muted)' }}>{dc.name}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--c-muted)' }}>({dc.reason})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
