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
const SUBJECT_COLORS: Record<Subject, string> = { physics: '#2383e2', chemistry: '#0f8a5e', maths: '#d9730d' }

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
    <div className="min-h-screen pb-[100px] md:pb-[90px]">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-page-title text-notion-text-dark mb-1">Completion</h1>
        <p className="text-sm text-notion-muted-dark mb-6">Track completed chapters per subject</p>

        {/* Overall stats */}
        <div className="notion-card p-4 mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-notion-text-dark">Overall Progress</span>
            <span className="text-2xl font-bold" style={{ color: SUBJECT_COLORS[tab] }}>{stats.done}/{stats.total} chapters</span>
          </div>
          <div className="notion-progress-bar">
            <div className="notion-progress-fill" style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%`, backgroundColor: SUBJECT_COLORS[tab] }} />
          </div>
        </div>

        {/* Subject tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-notion-border-dark pb-0">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-2 text-sm border-b-2 -mb-[1px] transition-colors flex items-center gap-1.5 ${
                tab === s ? 'border-[#2383e2] text-[#2383e2] font-medium' : 'border-transparent text-notion-muted-dark hover:text-notion-text-dark'
              }`}
            >
              <span>{SUBJECT_ICONS[s]}</span>
              <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* Divisions & chapters */}
        <div className="space-y-4">
          {divisions.map(div => {
            const doneInDiv = div.chapters.filter(ch => progress[ch.id]?.status === 'done').length
            return (
              <div key={div.id} className="notion-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-notion-text-dark">{div.name}</h3>
                  <span className="text-xs text-notion-muted-dark">{doneInDiv}/{div.chapters.length}</span>
                </div>
                <div className="space-y-1">
                  {div.chapters.map(ch => {
                    const isDone = progress[ch.id]?.status === 'done'
                    return (
                      <label
                        key={ch.id}
                        className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/[0.04] cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={e => setChapterStatus(ch.id, e.target.checked ? 'done' : 'not_started')}
                          className="w-4 h-4 rounded border-white/[0.08] text-[#2383e2] focus:ring-[#2383e2]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${isDone ? 'line-through text-notion-muted-dark' : 'text-notion-text-dark'}`}>
                            {ch.name}
                          </span>
                          <span className="ml-2 text-[10px] text-notion-muted-dark">Class {ch.class} · {ch.weightage}</span>
                        </div>
                        {isDone && <span className="text-xs text-[#0f8a5e] font-medium">✓</span>}
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
