'use client'

import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculatePace } from '@/lib/pacing'
import { getWeekDates, getMonthDays, formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, Chapter, DailyPlan } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData
type ViewType = 'daily' | 'weekly' | 'monthly'

const PHASES = {
  foundation: { label: 'Foundation & Coverage', desc: 'First pass through 100% of non-deleted syllabus' },
  consolidation: { label: 'Consolidation & Testing', desc: 'Full revision + chapter tests + weak-topic remediation' },
  sprint: { label: 'Final Sprint', desc: 'Zero new content — formula sheets, full mocks, sleep discipline' },
}

const SUBJECT_STYLES: Record<Subject, { color: string; bg: string; emoji: string }> = {
  physics: { color: '#2383e2', bg: 'bg-[#2383e2]/10', emoji: '⚡' },
  chemistry: { color: '#0f8a5e', bg: 'bg-[#0f8a5e]/10', emoji: '🧪' },
  maths: { color: '#d9730d', bg: 'bg-[#d9730d]/10', emoji: '📐' },
}

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

function getNextUndone(chapters: Chapter[], progress: Record<string, { status: string }>): Chapter[] {
  const undone = chapters.filter(ch => progress[ch.id]?.status !== 'done')
  return undone.slice(0, 2)
}

export default function RoadmapPage() {
  const [view, setView] = useState<ViewType>('daily')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selSubject1, setSelSubject1] = useState<Subject | null>(null)
  const [selDivision1, setSelDivision1] = useState<string | null>(null)
  const [selChapter1, setSelChapter1] = useState<string | null>(null)
  const [selSubject2, setSelSubject2] = useState<Subject | null>(null)
  const [selDivision2, setSelDivision2] = useState<string | null>(null)
  const [selChapter2, setSelChapter2] = useState<string | null>(null)
  const [todaysPlan, setTodaysPlan] = useState<DailyPlan | null>(null)
  const { progress, setTopicDone, setChapterStatus, loaded } = useProgressStore()
  const { settings } = useSettingsStore()
  const today = new Date()
  const todayStr = formatDate(today)

  useEffect(() => {
    db.dailyPlans.get(todayStr).then(p => setTodaysPlan(p || null))
  }, [todayStr])

  const pace = useMemo(() => calculatePace(syllabus, progress, new Date(settings.examDate), today, settings.freezeDays), [progress, settings])
  const weekDates = useMemo(() => getWeekDates(today), [])
  const monthDays = useMemo(() => getMonthDays(today.getFullYear(), today.getMonth()), [today])
  const phase = PHASES[pace.currentPhase]

  const divisions1 = useMemo(() => selSubject1 ? getDivisions(selSubject1) : [], [selSubject1])
  const divisions2 = useMemo(() => selSubject2 ? getDivisions(selSubject2) : [], [selSubject2])
  const currentDiv1 = divisions1.find(d => d.id === selDivision1)
  const currentDiv2 = divisions2.find(d => d.id === selDivision2)
  const selChObj1 = currentDiv1?.chapters.find(c => c.id === selChapter1) || null
  const selChObj2 = currentDiv2?.chapters.find(c => c.id === selChapter2) || null

  const chStatus = (chId: string) => progress[chId]?.status || 'not_started'

  const monthDetailChapters = useMemo(() => {
    if (!selectedDay) return []
    const subs: Subject[] = (['physics', 'chemistry', 'maths'] as Subject[])
      .sort((a, b) => pace.behindByDays[b] - pace.behindByDays[a])
    const result: { subject: Subject; chapters: Chapter[] }[] = []
    for (const s of subs) {
      const chs = getNextUndone(getDivisions(s).flatMap(d => d.chapters), progress)
      if (chs.length > 0) result.push({ subject: s, chapters: chs })
    }
    return result
  }, [selectedDay, progress, pace])

  const overallPct = useMemo(() => {
    let done = 0, total = 0
    for (const sub of ['physics', 'chemistry', 'maths'] as Subject[]) {
      for (const div of syllabus[sub].divisions) {
        for (const ch of div.chapters) {
          if (ch.deleted) continue
          total++
          if (progress[ch.id]?.status === 'done') done++
        }
      }
    }
    return total > 0 ? Math.round((done / total) * 100) : 0
  }, [progress])

  const planChapters = useMemo(() => {
    if (!todaysPlan?.subjects) return null
    const result: { subject: Subject; chapter: Chapter; topics: { id: string; name: string; done: boolean }[] }[] = []
    for (const ps of todaysPlan.subjects) {
      for (const chName of ps.chapters) {
        for (const div of syllabus[ps.subject].divisions) {
          const ch = div.chapters.find(c => c.name === chName)
          if (ch && !ch.deleted) {
            const chProg = progress[ch.id]
            const customIds = Object.keys(chProg?.customTopics || {})
            const allTopics = [
              ...ch.topics.filter(t => !t.deleted).map(t => ({ id: t.id, name: t.name, done: chProg?.topicStatus[t.id] || false })),
              ...customIds.map(id => ({ id, name: chProg?.customTopics?.[id] || id, done: chProg?.topicStatus[id] || false })),
            ]
            result.push({ subject: ps.subject, chapter: ch, topics: allTopics })
          }
        }
      }
    }
    return result
  }, [todaysPlan, progress])

  const allSubjects: Subject[] = ['physics', 'chemistry', 'maths']

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-page-title text-notion-text-dark mb-1">Roadmap</h1>
            <p className="text-sm text-notion-muted-dark">{phase.desc}</p>
          </div>
          <div className={`text-xs px-2 py-1 rounded-notion font-medium ${Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'bg-[#0f8a5e]/10 text-[#0f8a5e]' : 'bg-[#e03e3e]/10 text-[#e03e3e]'}`}>
            {Object.values(pace.paceStatus).every(s => s === 'on_track') ? '● On Track' : '● Behind'}
          </div>
        </div>

        {/* Progress journey */}
        <div className="notion-card p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">🛣️</span>
            <div>
              <div className="text-sm font-medium text-notion-text-dark">Your Journey</div>
              <div className="text-xs text-notion-muted-dark">{overallPct}% of syllabus completed</div>
            </div>
          </div>
          <div className="relative h-6 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2383e2] to-[#4da6ff] rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 text-lg transition-all duration-500" style={{ left: `${Math.min(overallPct, 95)}%` }}>🚩</div>
          </div>
          <div className="flex justify-between text-[10px] text-notion-muted-dark mt-1">
            <span>Start</span>
            <span>{overallPct >= 50 ? 'Halfway!' : ''}</span>
            <span>JEE Main 2027</span>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="notion-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-notion-text-dark">Macro Phase</span>
            <span className="text-xs text-[#2383e2]">{phase.label}</span>
          </div>
          <div className="flex items-center gap-1">
            {['foundation', 'consolidation', 'sprint'].map((p, i) => (
              <div key={p} className="flex-1 relative">
                <div className={`h-1.5 rounded-full ${pace.currentPhase === p ? 'bg-[#2383e2]' : 'bg-[#2f2f2f]'} ${i > 0 ? 'ml-0.5' : ''}`} />
                <div className="flex justify-center mt-1.5">
                  <span className={`text-[10px] ${pace.currentPhase === p ? 'text-[#2383e2] font-medium' : 'text-notion-muted-dark'}`}>
                    {p === 'foundation' ? 'Foundation' : p === 'consolidation' ? 'Consolidation' : 'Sprint'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-notion-border-dark pb-0">
          {(['daily', 'weekly', 'monthly'] as ViewType[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 text-sm border-b-2 -mb-[1px] transition-colors ${
                view === v ? 'border-[#2383e2] text-[#2383e2] font-medium' : 'border-transparent text-notion-muted-dark hover:text-notion-text-dark'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {view === 'daily' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-title text-notion-text-dark">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
              <span className="text-xs text-notion-muted-dark">Day {Math.floor((today.getTime() - new Date('2025-12-01').getTime()) / 86400000) + 1}</span>
            </div>

            {/* Planned chapters from DailyPlan */}
            {planChapters && planChapters.length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="text-xs text-notion-muted-dark uppercase tracking-wider font-medium">Today&apos;s Plan</h3>
                {planChapters.map(({ subject, chapter, topics }, idx) => (
                  <div key={chapter.id} className="notion-card p-4 border-l-[3px]" style={{ borderLeftColor: SUBJECT_STYLES[subject].color }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{SUBJECT_STYLES[subject].emoji}</span>
                      <span className="text-xs font-medium capitalize text-notion-text-dark">{subject}</span>
                      <span className="text-xs text-notion-muted-dark">· {chapter.name}</span>
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${
                        chStatus(chapter.id) === 'done' ? 'bg-[#0f8a5e]/10 text-[#0f8a5e]' : chStatus(chapter.id) === 'in_progress' ? 'bg-[#2383e2]/10 text-[#2383e2]' : 'bg-white/[0.04] text-notion-muted-dark'
                      }`}>
                        {chStatus(chapter.id) === 'done' ? '✓ Done' : chStatus(chapter.id) === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                    {topics.length > 0 && (
                      <div className="space-y-1 ml-4 mb-3">
                        {topics.map(t => (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] px-1 py-0.5 rounded">
                            <input
                              type="checkbox"
                              checked={t.done}
                              onChange={e => setTopicDone(chapter.id, t.id, e.target.checked)}
                              className="w-3 h-3 rounded-sm border-white/[0.08] text-[#2383e2] focus:ring-[#2383e2]"
                            />
                            <span className={`text-xs ${t.done ? 'line-through text-notion-muted-dark' : 'text-notion-text-dark'}`}>{t.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 ml-4">
                      {chStatus(chapter.id) !== 'done' && (
                        <button onClick={() => setChapterStatus(chapter.id, 'done')} className="notion-btn-ghost text-xs text-[#0f8a5e]">Mark Complete ✓</button>
                      )}
                      {chStatus(chapter.id) === 'done' && (
                        <button onClick={() => setChapterStatus(chapter.id, 'not_started')} className="notion-btn-ghost text-xs text-notion-muted-dark">Undo</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Item 1 — subject/division/chapter selector */}
            <div className="notion-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#2383e2]" />
                <div className="flex flex-wrap gap-1 flex-1">
                  {/* Subject buttons */}
                  {allSubjects.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelSubject1(s); setSelDivision1(null); setSelChapter1(null) }}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        selSubject1 === s ? 'text-white border-transparent' : 'text-notion-muted-dark border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                      style={{ backgroundColor: selSubject1 === s ? SUBJECT_STYLES[s].color : 'transparent' }}
                    >
                      {SUBJECT_STYLES[s].emoji} {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Division buttons */}
              {selSubject1 && (
                <div className="flex flex-wrap gap-1 mb-3 ml-1">
                  {divisions1.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { setSelDivision1(d.id); setSelChapter1(null) }}
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                        selDivision1 === d.id ? 'bg-white/[0.1] text-notion-text-dark font-medium' : 'text-notion-muted-dark hover:bg-white/[0.04]'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Chapters list */}
              {currentDiv1 && (
                <div className="space-y-1 mb-3 ml-1">
                  {currentDiv1.chapters.map(ch => {
                    const status = chStatus(ch.id)
                    const isSelected = selChapter1 === ch.id
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setSelChapter1(isSelected ? null : ch.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-white/[0.04] ${
                          isSelected ? 'bg-white/[0.06] border-l-2 border-[#2383e2]' : 'border-l-2 border-transparent'
                        }`}
                      >
                        <span className={`text-xs ${status === 'done' ? 'text-[#0f8a5e]' : 'text-notion-muted-dark'}`}>
                          {status === 'done' ? '✓' : status === 'in_progress' ? '🔄' : '○'}
                        </span>
                        <span className={`text-xs flex-1 ${status === 'done' ? 'line-through text-notion-muted-dark' : 'text-notion-text-dark'}`}>
                          {ch.name}
                        </span>
                        <span className="text-[10px] text-notion-muted-dark">{ch.topics.filter(t => !t.deleted).length} topics</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Selected chapter detail */}
              {selChObj1 && (
                <>
                  <div className="text-sm font-medium text-notion-text-dark mb-0.5">{selChObj1.name}</div>
                  <p className="text-xs text-notion-muted-dark mb-3">Class {selChObj1.class} · {selChObj1.weightage} weightage</p>
                  <div className="space-y-1 mb-3 ml-1">
                    {selChObj1.topics.filter(t => !t.deleted).map(t => {
                      const done = progress[selChObj1.id]?.topicStatus[t.id] || false
                      return (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] px-1 py-0.5 rounded">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={e => setTopicDone(selChObj1.id, t.id, e.target.checked)}
                            className="w-3 h-3 rounded-sm border-white/[0.08] text-[#2383e2] focus:ring-[#2383e2]"
                          />
                          <span className={`text-xs ${done ? 'line-through text-notion-muted-dark' : 'text-notion-text-dark'}`}>{t.name}</span>
                        </label>
                      )
                    })}
                  </div>
                  <button onClick={() => setChapterStatus(selChObj1.id, 'done')} className="notion-btn-ghost text-xs text-[#0f8a5e]">Mark Complete ✓</button>
                </>
              )}
              {selSubject1 && !selChapter1 && (
                <p className="text-xs text-notion-muted-dark italic">Select a chapter above to see its topics</p>
              )}
            </div>

            {/* Item 2 */}
            <div className="notion-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#0f8a5e]" />
                <div className="flex flex-wrap gap-1 flex-1">
                  {allSubjects.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelSubject2(s); setSelDivision2(null); setSelChapter2(null) }}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        selSubject2 === s ? 'text-white border-transparent' : 'text-notion-muted-dark border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                      style={{ backgroundColor: selSubject2 === s ? SUBJECT_STYLES[s].color : 'transparent' }}
                    >
                      {SUBJECT_STYLES[s].emoji} {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {selSubject2 && (
                <div className="flex flex-wrap gap-1 mb-3 ml-1">
                  {divisions2.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { setSelDivision2(d.id); setSelChapter2(null) }}
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                        selDivision2 === d.id ? 'bg-white/[0.1] text-notion-text-dark font-medium' : 'text-notion-muted-dark hover:bg-white/[0.04]'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}

              {currentDiv2 && (
                <div className="space-y-1 mb-3 ml-1">
                  {currentDiv2.chapters.map(ch => {
                    const status = chStatus(ch.id)
                    const isSelected = selChapter2 === ch.id
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setSelChapter2(isSelected ? null : ch.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-white/[0.04] ${
                          isSelected ? 'bg-white/[0.06] border-l-2 border-[#0f8a5e]' : 'border-l-2 border-transparent'
                        }`}
                      >
                        <span className={`text-xs ${status === 'done' ? 'text-[#0f8a5e]' : 'text-notion-muted-dark'}`}>
                          {status === 'done' ? '✓' : status === 'in_progress' ? '🔄' : '○'}
                        </span>
                        <span className={`text-xs flex-1 ${status === 'done' ? 'line-through text-notion-muted-dark' : 'text-notion-text-dark'}`}>
                          {ch.name}
                        </span>
                        <span className="text-[10px] text-notion-muted-dark">{ch.topics.filter(t => !t.deleted).length} topics</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {selChObj2 && (
                <>
                  <div className="text-sm font-medium text-notion-text-dark mb-0.5">{selChObj2.name}</div>
                  <p className="text-xs text-notion-muted-dark mb-3">Class {selChObj2.class} · {selChObj2.weightage} weightage</p>
                  <div className="space-y-1 mb-3 ml-1">
                    {selChObj2.topics.filter(t => !t.deleted).map(t => {
                      const done = progress[selChObj2.id]?.topicStatus[t.id] || false
                      return (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] px-1 py-0.5 rounded">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={e => setTopicDone(selChObj2.id, t.id, e.target.checked)}
                            className="w-3 h-3 rounded-sm border-white/[0.08] text-[#0f8a5e] focus:ring-[#0f8a5e]"
                          />
                          <span className={`text-xs ${done ? 'line-through text-notion-muted-dark' : 'text-notion-text-dark'}`}>{t.name}</span>
                        </label>
                      )
                    })}
                  </div>
                  <button onClick={() => setChapterStatus(selChObj2.id, 'done')} className="notion-btn-ghost text-xs text-[#0f8a5e]">Mark Complete ✓</button>
                </>
              )}
              {selSubject2 && !selChapter2 && (
                <p className="text-xs text-notion-muted-dark italic">Select a chapter above to see its topics</p>
              )}
            </div>

            <div className="notion-card p-3 flex items-center gap-3 border-l-[3px] border-l-[#e03e3e]">
              <span>🎯</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-notion-text-dark">Daily Drill — 50 MCQs</div>
                <div className="text-xs text-notion-muted-dark">Check the Tests page to log your daily practice</div>
              </div>
            </div>
          </div>
        )}

        {view === 'weekly' && (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDates.map((date, i) => {
                const isToday = date.toDateString() === today.toDateString()
                return (
                  <div key={i} className={`notion-card p-2 text-center ${isToday ? 'border-[#2383e2]' : ''}`}>
                    <div className="text-caption text-notion-muted-dark">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-lg font-semibold text-notion-text-dark mt-1">{date.getDate()}</div>
                    <div className="mt-2 flex justify-center gap-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${i < today.getDay() ? 'bg-[#0f8a5e]' : i === today.getDay() ? 'bg-[#2383e2]' : 'bg-[#2f2f2f]'}`} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="notion-card p-3 flex items-center justify-between">
              <div>
                <span className="text-sm text-notion-muted-dark">Chapters completed this week</span>
                <div className="text-lg font-semibold text-notion-text-dark">Track in Syllabus</div>
              </div>
              <a href="/syllabus" className="notion-btn-primary text-xs">Go to Syllabus →</a>
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div>
            <h2 className="section-title text-notion-text-dark mb-3">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <div className="notion-card p-4 mb-4">
              <div className="grid grid-cols-7 gap-0.5">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-caption text-notion-muted-dark text-center py-1">{d}</div>
                ))}
                {monthDays.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(selectedDay?.toDateString() === day.toDateString() ? null : day)}
                    className={`text-sm text-center py-1.5 rounded-notion ${
                      day && day.toDateString() === today.toDateString()
                        ? 'bg-[#2383e2] text-white font-medium'
                        : day && selectedDay && day.toDateString() === selectedDay.toDateString()
                        ? 'bg-[#2383e2]/20 text-[#2383e2] font-medium'
                        : day ? 'text-notion-text-dark hover:bg-notion-sidebar-hover-dark cursor-pointer' : ''
                    }`}
                  >
                    {day?.getDate() || ''}
                  </div>
                ))}
              </div>
            </div>

            {selectedDay && (
              <div className="notion-card p-4 mb-4">
                <h3 className="text-sm font-medium text-notion-text-dark mb-3">
                  Targets for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                {monthDetailChapters.length > 0 ? (
                  <div className="space-y-2">
                    {monthDetailChapters.map(({ subject, chapters }) => (
                      <div key={subject} className="flex items-start gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          subject === 'physics' ? 'bg-[#2383e2]' : subject === 'chemistry' ? 'bg-[#0f8a5e]' : 'bg-[#d9730d]'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-notion-text-dark capitalize">{subject}</span>
                          <div className="text-xs text-notion-muted-dark">
                            {chapters.map(ch => ch.name).join(', ') || 'All chapters done'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-notion-muted-dark italic">All caught up! No pending chapters.</p>
                )}
              </div>
            )}

            <div className="notion-card p-3">
              <span className="text-xs text-[#2383e2] font-medium">Monthly Target</span>
              <p className="text-sm text-notion-text-dark mt-0.5">Focus on your weakest subjects from the pace analysis above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
