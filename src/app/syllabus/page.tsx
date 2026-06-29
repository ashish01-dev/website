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
    <div className="min-h-screen pb-[100px] md:pb-[90px]">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-page-title text-notion-text-dark mb-1">Syllabus Tracker</h1>
        <p className="text-sm text-notion-muted-dark mb-6">Track your JEE 2027 syllabus progress</p>

        {/* Subject tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-notion-border-dark pb-0">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSubject(s.id)}
              className={`px-3 py-2 text-sm transition-colors border-b-2 -mb-[1px] ${
                activeSubject === s.id ? 'border-[#2383e2] text-[#2383e2] font-medium' : 'border-transparent text-notion-muted-dark hover:text-notion-text-dark'
              }`}
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
              className="notion-input w-48 text-xs"
            />
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-6">
          {filteredDivisions.map(div => (
            <div key={div.id}>
              <h2 className="section-title text-notion-text-dark mb-2">{div.name}</h2>
              <div className="space-y-1">
                {div.chapters.map(ch => (
                  <ChapterCard key={ch.id} chapter={ch} />
                ))}
              </div>
            </div>
          ))}

          {subjectData.deletedChapters.length > 0 && (
            <div>
              <h2 className="section-title text-notion-muted-dark mb-2 line-through">Removed Chapters</h2>
              <div className="space-y-1">
                {subjectData.deletedChapters.map((dc, i) => (
                  <div key={i} className="notion-card p-3 opacity-40">
                    <span className="text-sm line-through text-notion-muted-dark">{dc.name}</span>
                    <span className="text-xs text-notion-muted-dark ml-2">({dc.reason})</span>
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
