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
  physics: { color: 'var(--c-blue)', bg: 'bg-[var(--c-blue)]/10', emoji: '⚡' },
  chemistry: { color: 'var(--c-green)', bg: 'bg-[var(--c-green)]/10', emoji: '🧪' },
  maths: { color: 'var(--c-orange)', bg: 'bg-[#d9730d]/10', emoji: '📐' },
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
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Roadmap</h1>
            <p className="text-sm" style={{ color: 'var(--c-muted)' }}>{phase.desc}</p>
          </div>
          <div className="text-xs px-2 py-1 rounded-[10px] font-medium" style={{
            color: Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'var(--c-green)' : 'var(--c-red)',
            background: Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'rgba(15,138,94,0.1)' : 'rgba(224,62,62,0.1)',
          }}>
            {Object.values(pace.paceStatus).every(s => s === 'on_track') ? '● On Track' : '● Behind'}
          </div>
        </div>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">🛣️</span>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Your Journey</div>
              <div className="text-xs" style={{ color: 'var(--c-muted)' }}>{overallPct}% of syllabus completed</div>
            </div>
          </div>
          <div className="relative h-6 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
            <div className="h-full bg-gradient-to-r from-[#2383e2] to-[#4da6ff] rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 text-lg transition-all duration-500" style={{ left: `${Math.min(overallPct, 95)}%` }}>🚩</div>
          </div>
          <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--c-muted)' }}>
            <span>Start</span>
            <span>{overallPct >= 50 ? 'Halfway!' : ''}</span>
            <span>JEE Main 2027</span>
          </div>
        </div>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Macro Phase</span>
            <span className="text-xs" style={{ color: 'var(--c-blue)' }}>{phase.label}</span>
          </div>
          <div className="flex items-center gap-1">
            {['foundation', 'consolidation', 'sprint'].map((p, i) => (
              <div key={p} className="flex-1 relative">
                <div className={`h-1.5 rounded-full ${pace.currentPhase === p ? 'bg-[var(--c-blue)]' : ''}`} style={{ background: pace.currentPhase !== p ? '#e0e0e0' : undefined }} />
                <div className="flex justify-center mt-1.5">
                  <span className={`text-[10px] ${pace.currentPhase === p ? 'text-[var(--c-blue)] font-medium' : ''}`} style={{ color: pace.currentPhase !== p ? 'var(--c-muted)' : undefined }}>
                    {p === 'foundation' ? 'Foundation' : p === 'consolidation' ? 'Consolidation' : 'Sprint'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-4 border-b pb-0" style={{ borderColor: 'var(--c-border)' }}>
          {(['daily', 'weekly', 'monthly'] as ViewType[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 text-sm border-b-2 -mb-[1px] transition-colors ${
                view === v ? 'border-[var(--c-blue)] text-[var(--c-blue)] font-medium' : 'border-transparent hover:text-[var(--c-text)]'
              }`}
              style={{ color: view !== v ? 'var(--c-muted)' : undefined }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {view === 'daily' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
              <span className="text-xs" style={{ color: 'var(--c-muted)' }}>Day {Math.floor((today.getTime() - new Date('2025-12-01').getTime()) / 86400000) + 1}</span>
            </div>

            {planChapters && planChapters.length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--c-muted)' }}>Today&apos;s Plan</h3>
                {planChapters.map(({ subject, chapter, topics }, idx) => (
                  <div key={chapter.id} className="rounded-[18px] p-4 border-l-[3px]" style={{
                    background: 'var(--c-card)',
                    border: '1px solid var(--c-border-card)',
                    borderLeftColor: SUBJECT_STYLES[subject].color,
                    borderLeftWidth: '3px',
                    boxShadow: 'var(--c-shadow)',
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{SUBJECT_STYLES[subject].emoji}</span>
                      <span className="text-xs font-medium capitalize" style={{ color: 'var(--c-text)' }}>{subject}</span>
                      <span className="text-xs" style={{ color: 'var(--c-muted)' }}>· {chapter.name}</span>
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded`} style={{
                        color: chStatus(chapter.id) === 'done' ? 'var(--c-green)' : chStatus(chapter.id) === 'in_progress' ? 'var(--c-blue)' : 'var(--c-muted)',
                        background: chStatus(chapter.id) === 'done' ? 'rgba(15,138,94,0.1)' : chStatus(chapter.id) === 'in_progress' ? 'rgba(35,131,226,0.1)' : 'var(--c-progress-bg)',
                      }}>
                        {chStatus(chapter.id) === 'done' ? '✓ Done' : chStatus(chapter.id) === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                    {topics.length > 0 && (
                      <div className="space-y-1 ml-4 mb-3">
                        {topics.map(t => (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-black/[0.02] px-1 py-0.5 rounded">
                            <input
                              type="checkbox"
                              checked={t.done}
                              onChange={e => setTopicDone(chapter.id, t.id, e.target.checked)}
                              className="w-3 h-3 rounded-sm text-[var(--c-blue)] focus:ring-[#2383e2]"
                              style={{ borderColor: 'rgba(0,0,0,0.15)' }}
                            />
                            <span className={`text-xs ${t.done ? 'line-through' : ''}`} style={{ color: t.done ? 'var(--c-muted)' : 'var(--c-text)' }}>{t.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 ml-4">
                      {chStatus(chapter.id) !== 'done' && (
                        <button onClick={() => setChapterStatus(chapter.id, 'done')} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-green)' }}>Mark Complete ✓</button>
                      )}
                      {chStatus(chapter.id) === 'done' && (
                        <button onClick={() => setChapterStatus(chapter.id, 'not_started')} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-muted)' }}>Undo</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--c-blue)]" />
                <div className="flex flex-wrap gap-1 flex-1">
                  {allSubjects.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelSubject1(s); setSelDivision1(null); setSelChapter1(null) }}
                      className="text-xs px-2 py-0.5 rounded-full border transition-colors"
                      style={{
                        color: selSubject1 === s ? '#fff' : 'var(--c-muted)',
                        borderColor: selSubject1 === s ? 'transparent' : 'var(--c-border-input)',
                        backgroundColor: selSubject1 === s ? SUBJECT_STYLES[s].color : 'transparent',
                      }}
                    >
                      {SUBJECT_STYLES[s].emoji} {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {selSubject1 && (
                <div className="flex flex-wrap gap-1 mb-3 ml-1">
                  {divisions1.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { setSelDivision1(d.id); setSelChapter1(null) }}
                      className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                      style={{
                        color: selDivision1 === d.id ? 'var(--c-text)' : 'var(--c-muted)',
                        background: selDivision1 === d.id ? 'var(--c-progress-bg)' : 'transparent',
                      }}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}

              {currentDiv1 && (
                <div className="space-y-1 mb-3 ml-1">
                  {currentDiv1.chapters.map(ch => {
                    const status = chStatus(ch.id)
                    const isSelected = selChapter1 === ch.id
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setSelChapter1(isSelected ? null : ch.id)}
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-black/[0.02]"
                        style={{
                          background: isSelected ? 'var(--c-tag)' : 'transparent',
                          borderLeft: isSelected ? '2px solid var(--c-blue)' : '2px solid transparent',
                        }}
                      >
                        <span className="text-xs" style={{ color: status === 'done' ? 'var(--c-green)' : 'var(--c-muted)' }}>
                          {status === 'done' ? '✓' : status === 'in_progress' ? '🔄' : '○'}
                        </span>
                        <span className="text-xs flex-1" style={{ color: status === 'done' ? 'var(--c-muted)' : 'var(--c-text)', textDecoration: status === 'done' ? 'line-through' : 'none' }}>
                          {ch.name}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{ch.topics.filter(t => !t.deleted).length} topics</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {selChObj1 && (
                <>
                  <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--c-text)' }}>{selChObj1.name}</div>
                  <p className="text-xs mb-3" style={{ color: 'var(--c-muted)' }}>Class {selChObj1.class} · {selChObj1.weightage} weightage</p>
                  <div className="space-y-1 mb-3 ml-1">
                    {selChObj1.topics.filter(t => !t.deleted).map(t => {
                      const done = progress[selChObj1.id]?.topicStatus[t.id] || false
                      return (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-black/[0.02] px-1 py-0.5 rounded">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={e => setTopicDone(selChObj1.id, t.id, e.target.checked)}
                            className="w-3 h-3 rounded-sm text-[var(--c-blue)] focus:ring-[#2383e2]"
                            style={{ borderColor: 'rgba(0,0,0,0.15)' }}
                          />
                          <span className="text-xs" style={{ color: done ? 'var(--c-muted)' : 'var(--c-text)', textDecoration: done ? 'line-through' : 'none' }}>{t.name}</span>
                        </label>
                      )
                    })}
                  </div>
                  <button onClick={() => setChapterStatus(selChObj1.id, 'done')} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-green)' }}>Mark Complete ✓</button>
                </>
              )}
              {selSubject1 && !selChapter1 && (
                <p className="text-xs italic" style={{ color: 'var(--c-muted)' }}>Select a chapter above to see its topics</p>
              )}
            </div>

            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--c-green)]" />
                <div className="flex flex-wrap gap-1 flex-1">
                  {allSubjects.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelSubject2(s); setSelDivision2(null); setSelChapter2(null) }}
                      className="text-xs px-2 py-0.5 rounded-full border transition-colors"
                      style={{
                        color: selSubject2 === s ? '#fff' : 'var(--c-muted)',
                        borderColor: selSubject2 === s ? 'transparent' : 'var(--c-border-input)',
                        backgroundColor: selSubject2 === s ? SUBJECT_STYLES[s].color : 'transparent',
                      }}
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
                      className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                      style={{
                        color: selDivision2 === d.id ? 'var(--c-text)' : 'var(--c-muted)',
                        background: selDivision2 === d.id ? 'var(--c-progress-bg)' : 'transparent',
                      }}
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
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-black/[0.02]"
                        style={{
                          background: isSelected ? 'var(--c-tag)' : 'transparent',
                          borderLeft: isSelected ? '2px solid var(--c-green)' : '2px solid transparent',
                        }}
                      >
                        <span className="text-xs" style={{ color: status === 'done' ? 'var(--c-green)' : 'var(--c-muted)' }}>
                          {status === 'done' ? '✓' : status === 'in_progress' ? '🔄' : '○'}
                        </span>
                        <span className="text-xs flex-1" style={{ color: status === 'done' ? 'var(--c-muted)' : 'var(--c-text)', textDecoration: status === 'done' ? 'line-through' : 'none' }}>
                          {ch.name}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{ch.topics.filter(t => !t.deleted).length} topics</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {selChObj2 && (
                <>
                  <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--c-text)' }}>{selChObj2.name}</div>
                  <p className="text-xs mb-3" style={{ color: 'var(--c-muted)' }}>Class {selChObj2.class} · {selChObj2.weightage} weightage</p>
                  <div className="space-y-1 mb-3 ml-1">
                    {selChObj2.topics.filter(t => !t.deleted).map(t => {
                      const done = progress[selChObj2.id]?.topicStatus[t.id] || false
                      return (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-black/[0.02] px-1 py-0.5 rounded">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={e => setTopicDone(selChObj2.id, t.id, e.target.checked)}
                            className="w-3 h-3 rounded-sm text-[var(--c-green)] focus:ring-[#0f8a5e]"
                            style={{ borderColor: 'rgba(0,0,0,0.15)' }}
                          />
                          <span className="text-xs" style={{ color: done ? 'var(--c-muted)' : 'var(--c-text)', textDecoration: done ? 'line-through' : 'none' }}>{t.name}</span>
                        </label>
                      )
                    })}
                  </div>
                  <button onClick={() => setChapterStatus(selChObj2.id, 'done')} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-green)' }}>Mark Complete ✓</button>
                </>
              )}
              {selSubject2 && !selChapter2 && (
                <p className="text-xs italic" style={{ color: 'var(--c-muted)' }}>Select a chapter above to see its topics</p>
              )}
            </div>

            <div className="rounded-[18px] p-3 flex items-center gap-3 border-l-[3px]" style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-card)',
              borderLeftColor: 'var(--c-red)',
              borderLeftWidth: '3px',
              boxShadow: 'var(--c-shadow)',
            }}>
              <span>🎯</span>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Daily Drill — 50 MCQs</div>
                <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Check the Tests page to log your daily practice</div>
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
                  <div key={i} className="rounded-[18px] p-2 text-center" style={{
                    background: 'var(--c-card)',
                    border: `1px solid ${isToday ? 'var(--c-blue)' : 'var(--c-border-card)'}`,
                    boxShadow: 'var(--c-shadow)',
                  }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-lg font-semibold mt-1" style={{ color: 'var(--c-text)' }}>{date.getDate()}</div>
                    <div className="mt-2 flex justify-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: i < today.getDay() ? 'var(--c-green)' : i === today.getDay() ? 'var(--c-blue)' : '#e0e0e0' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="rounded-[18px] p-3 flex items-center justify-between" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div>
                <span className="text-sm" style={{ color: 'var(--c-muted)' }}>Chapters completed this week</span>
                <div className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>Track in Syllabus</div>
              </div>
              <a href="/syllabus" className="text-sm font-medium px-4 py-2 rounded-[40px] text-white" style={{ background: 'var(--c-btn-primary)' }}>Go to Syllabus &rarr;</a>
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div>
            <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <div className="rounded-[18px] p-4 mb-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="grid grid-cols-7 gap-0.5">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-[10px] font-semibold uppercase tracking-wider text-center py-1" style={{ color: 'var(--c-muted)' }}>{d}</div>
                ))}
                {monthDays.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(selectedDay?.toDateString() === day.toDateString() ? null : day)}
                    className="text-sm text-center py-1.5 rounded-[10px] cursor-pointer"
                    style={{
                      color: day && day.toDateString() === today.toDateString() ? '#fff' : day && selectedDay && day.toDateString() === selectedDay.toDateString() ? 'var(--c-blue)' : day ? 'var(--c-text)' : undefined,
                      background: day && day.toDateString() === today.toDateString() ? 'var(--c-blue)' : day && selectedDay && day.toDateString() === selectedDay.toDateString() ? 'rgba(35,131,226,0.2)' : day ? 'transparent' : undefined,
                      fontWeight: day && selectedDay && day.toDateString() === selectedDay.toDateString() ? '500' : undefined,
                    }}
                    onMouseEnter={e => { if (day && day.toDateString() !== today.toDateString()) e.currentTarget.style.background = 'var(--c-progress-bg)' }}
                    onMouseLeave={e => { if (day && day.toDateString() !== today.toDateString() && !(selectedDay && day.toDateString() === selectedDay.toDateString())) e.currentTarget.style.background = 'transparent' }}
                  >
                    {day?.getDate() || ''}
                  </div>
                ))}
              </div>
            </div>

            {selectedDay && (
              <div className="rounded-[18px] p-4 mb-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--c-text)' }}>
                  Targets for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                {monthDetailChapters.length > 0 ? (
                  <div className="space-y-2">
                    {monthDetailChapters.map(({ subject, chapters }) => (
                      <div key={subject} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{
                          background: subject === 'physics' ? 'var(--c-blue)' : subject === 'chemistry' ? 'var(--c-green)' : 'var(--c-orange)',
                        }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium capitalize" style={{ color: 'var(--c-text)' }}>{subject}</span>
                          <div className="text-xs" style={{ color: 'var(--c-muted)' }}>
                            {chapters.map(ch => ch.name).join(', ') || 'All chapters done'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic" style={{ color: 'var(--c-muted)' }}>All caught up! No pending chapters.</p>
                )}
              </div>
            )}

            <div className="rounded-[18px] p-3" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--c-blue)' }}>Monthly Target</span>
              <p className="text-sm mt-0.5" style={{ color: 'var(--c-text)' }}>Focus on your weakest subjects from the pace analysis above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
