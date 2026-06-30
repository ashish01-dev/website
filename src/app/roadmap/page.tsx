'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculatePace } from '@/lib/pacing'
import { formatDate, getDaysBetween } from '@/lib/utils'
import { db } from '@/lib/db'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, Chapter, DailyPlan, RoadmapStage } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

type ViewType = 'journey' | 'daily' | 'monthly'

const SUBJECT_STYLES: Record<Subject, { color: string; emoji: string }> = {
  physics: { color: 'var(--c-blue)', emoji: '⚡' },
  chemistry: { color: 'var(--c-green)', emoji: '🧪' },
  maths: { color: 'var(--c-orange)', emoji: '📐' },
}

function getDivisions(subject: Subject) {
  return syllabus[subject].divisions.map(d => ({
    id: d.id,
    name: d.name,
    chapters: d.chapters.filter(c => !c.deleted),
  }))
}

function getNextUndone(chapters: Chapter[], progress: Record<string, { status: string }>): Chapter[] {
  return chapters.filter(ch => progress[ch.id]?.status !== 'done').slice(0, 2)
}

export default function RoadmapPage() {
  const [view, setView] = useState<ViewType>('journey')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [todaysPlan, setTodaysPlan] = useState<DailyPlan | null>(null)
  const [selSubject1, setSelSubject1] = useState<Subject | null>(null)
  const [selDivision1, setSelDivision1] = useState<string | null>(null)
  const [selChapter1, setSelChapter1] = useState<string | null>(null)
  const [selSubject2, setSelSubject2] = useState<Subject | null>(null)
  const [selDivision2, setSelDivision2] = useState<string | null>(null)
  const [selChapter2, setSelChapter2] = useState<string | null>(null)
  const { progress, setTopicDone, setChapterStatus, loaded } = useProgressStore()
  const { settings } = useSettingsStore()
  const today = new Date()
  const todayStr = formatDate(today)

  useEffect(() => { db.dailyPlans.get(todayStr).then(p => setTodaysPlan(p || null)) }, [todayStr])

  const pace = useMemo(() => calculatePace(syllabus, progress, new Date(settings.examDate), today, settings.freezeDays), [progress, settings])
  const examDate = new Date(settings.examDate)
  const daysRemaining = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / 86400000))
  const totalChapters = useMemo(() => {
    let t = 0
    for (const sub of ['physics', 'chemistry', 'maths'] as Subject[])
      for (const div of syllabus[sub].divisions)
        for (const ch of div.chapters) if (!ch.deleted) t++
    return t
  }, [])

  const stages: RoadmapStage[] = useMemo(() => {
    const progressPct = pace.overallProgress
    const remainingPct = 100 - progressPct
    return [
      {
        id: 'foundation',
        name: 'Foundation',
        description: 'First pass through all syllabus chapters',
        icon: '🌱',
        estimatedWeeks: Math.ceil(totalChapters / 8),
        remainingWeeks: Math.ceil((remainingPct / 100) * (totalChapters / 8)),
        progress: Math.min(100, progressPct * 1.5),
        chaptersPending: Math.max(0, totalChapters - Math.floor((progressPct / 100) * totalChapters)),
      },
      {
        id: 'core',
        name: 'Core Preparation',
        description: 'In-depth practice and numerical solving',
        icon: '📚',
        estimatedWeeks: 16,
        remainingWeeks: Math.max(0, Math.ceil((remainingPct / 100) * 16)),
        progress: Math.min(100, progressPct * 1.2),
        chaptersPending: Math.max(0, totalChapters - Math.floor((progressPct / 100) * totalChapters)),
      },
      {
        id: 'pyq',
        name: 'PYQ Phase',
        description: 'Previous year questions chapter-wise',
        icon: '📝',
        estimatedWeeks: 10,
        remainingWeeks: Math.ceil((remainingPct / 100) * 10),
        progress: Math.min(100, progressPct),
        chaptersPending: Math.max(0, totalChapters - Math.floor((progressPct / 100) * totalChapters)),
      },
      {
        id: 'mock',
        name: 'Mock Test Phase',
        description: 'Full-length tests with analysis',
        icon: '🎯',
        estimatedWeeks: 8,
        remainingWeeks: Math.max(1, Math.ceil(daysRemaining / 7) - 6),
        progress: Math.min(100, Math.max(0, 100 - (daysRemaining / 30) * 100)),
        chaptersPending: Math.max(0, totalChapters - Math.floor((progressPct / 100) * totalChapters)),
      },
      {
        id: 'revision',
        name: 'Final Revision',
        description: 'Formula sheets, error log, quick revisions',
        icon: '🔄',
        estimatedWeeks: 4,
        remainingWeeks: Math.min(4, Math.ceil(daysRemaining / 7)),
        progress: Math.min(100, Math.max(0, 100 - (daysRemaining / 14) * 100)),
        chaptersPending: 0,
      },
      {
        id: 'last30',
        name: 'Last 30 Days',
        description: 'Peak performance, sleep discipline, mock mocks',
        icon: '🔥',
        estimatedWeeks: 4,
        remainingWeeks: Math.min(4, Math.ceil(daysRemaining / 7)),
        progress: Math.min(100, Math.max(0, 100 - (daysRemaining / 30) * 100)),
        chaptersPending: 0,
      },
    ]
  }, [pace, totalChapters, daysRemaining])

  const overallPct = useMemo(() => {
    let done = 0, total = 0
    for (const sub of ['physics', 'chemistry', 'maths'] as Subject[])
      for (const div of syllabus[sub].divisions)
        for (const ch of div.chapters) { if (ch.deleted) continue; total++; if (progress[ch.id]?.status === 'done') done++ }
    return total > 0 ? Math.round((done / total) * 100) : 0
  }, [progress])

  const weekDates = useMemo(() => {
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) { const d = new Date(today); d.setDate(d.getDate() + i); dates.push(d) }
    return dates
  }, [])

  const monthDays = useMemo(() => {
    const days: (Date | null)[] = []
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    for (let i = 0; i < first.getDay(); i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(today.getFullYear(), today.getMonth(), d))
    return days
  }, [])

  const planChapters = useMemo(() => {
    if (!todaysPlan?.subjects) return null
    return todaysPlan.subjects.flatMap(ps =>
      ps.chapters.map(chName => {
        for (const div of syllabus[ps.subject].divisions) {
          const ch = div.chapters.find(c => c.name === chName)
          if (ch && !ch.deleted) {
            const chProg = progress[ch.id]
            const customIds = Object.keys(chProg?.customTopics || {})
            return {
              subject: ps.subject,
              chapter: ch,
              topics: [
                ...ch.topics.filter(t => !t.deleted).map(t => ({ id: t.id, name: t.name, done: chProg?.topicStatus[t.id] || false })),
                ...customIds.map(id => ({ id, name: chProg?.customTopics?.[id] || id, done: chProg?.topicStatus[id] || false })),
              ],
            }
          }
        }
        return null
      }).filter(Boolean) as { subject: Subject; chapter: Chapter; topics: { id: string; name: string; done: boolean }[] }[]
    )
  }, [todaysPlan, progress])

  const divisions1 = useMemo(() => selSubject1 ? getDivisions(selSubject1) : [], [selSubject1])
  const divisions2 = useMemo(() => selSubject2 ? getDivisions(selSubject2) : [], [selSubject2])
  const currentDiv1 = divisions1.find(d => d.id === selDivision1)
  const currentDiv2 = divisions2.find(d => d.id === selDivision2)

  const chStatus = useCallback((chId: string) => progress[chId]?.status || 'not_started', [progress])

  const monthDetailChapters = useMemo(() => {
    if (!selectedDay) return []
    return (['physics', 'chemistry', 'maths'] as Subject[])
      .sort((a, b) => (pace.behindByDays[b] || 0) - (pace.behindByDays[a] || 0))
      .map(s => ({ subject: s, chapters: getNextUndone(getDivisions(s).flatMap(d => d.chapters), progress) }))
      .filter(({ chapters }) => chapters.length > 0)
  }, [selectedDay, progress, pace])

  return (
    <div className="min-h-screen pb-[100px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8 animate-page-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px]" style={{ color: 'var(--c-text)' }}>Roadmap</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--c-muted)' }}>{daysRemaining} days until JEE · {overallPct}% syllabus done</p>
          </div>
          <div className="text-xs px-2.5 py-1 rounded-[10px] font-medium" style={{
            color: Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'var(--c-green)' : 'var(--c-red)',
            background: Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'rgba(15,138,94,0.1)' : 'rgba(224,62,62,0.1)',
          }}>
            {Object.values(pace.paceStatus).every(s => s === 'on_track') ? '● On Track' : '● Behind'}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-[14px]" style={{ background: 'var(--c-card-alt)', border: '1px solid var(--c-border-card)' }}>
          {([
            { value: 'journey' as ViewType, label: 'Overall Journey' },
            { value: 'daily' as ViewType, label: 'Daily Plan' },
            { value: 'monthly' as ViewType, label: 'Monthly View' },
          ]).map(v => (
            <button key={v.value} onClick={() => setView(v.value)}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-[12px] transition-all"
              style={{
                background: view === v.value ? 'var(--c-card)' : 'transparent',
                color: view === v.value ? 'var(--c-text)' : 'var(--c-muted)',
                boxShadow: view === v.value ? 'var(--c-shadow)' : 'none',
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* ─── OVERALL JOURNEY ─── */}
        {view === 'journey' && (
          <div className="space-y-3">
            <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🛣️</span>
                <div>
                  <div className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>Your JEE Journey</div>
                  <div className="text-xs" style={{ color: 'var(--c-muted)' }}>{overallPct}% complete · {totalChapters} total chapters</div>
                </div>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden mb-2" style={{ background: 'var(--c-progress-bg)' }}>
                <div className="h-full bg-gradient-to-r from-[#2383e2] to-[#4da6ff] rounded-full transition-all duration-1000" style={{ width: `${overallPct}%` }} />
              </div>
              <div className="flex justify-between text-[11px]" style={{ color: 'var(--c-muted)' }}>
                <span>Start</span>
                <span>{overallPct >= 50 ? '🏁 Halfway!' : ''}</span>
                <span>JEE Main {new Date(settings.examDate).getFullYear()}</span>
              </div>
            </div>

            {stages.map((stage, idx) => {
              const isActive = stage.progress < 100 && stage.progress > 0
              const isDone = stage.progress >= 100
              return (
                <div key={stage.id}
                  className="rounded-[18px] p-4 transition-all duration-200 hover:-translate-y-[1px]"
                  style={{
                    background: 'var(--c-card)',
                    border: `1px solid ${isActive ? 'var(--c-blue)' : 'var(--c-border-card)'}`,
                    boxShadow: isActive ? 'var(--c-shadow-hover)' : 'var(--c-shadow)',
                    borderLeft: `3px solid ${isDone ? 'var(--c-green)' : isActive ? 'var(--c-blue)' : 'var(--c-border)'}`,
                  }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{stage.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold" style={{ color: isDone ? 'var(--c-green)' : 'var(--c-text)' }}>
                          {isDone ? '✓ ' : ''}{stage.name}
                        </span>
                        {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>In Progress</span>}
                        {isDone && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(15,138,94,0.15)', color: 'var(--c-green)' }}>Completed</span>}
                      </div>
                      <p className="text-[12px] mb-3" style={{ color: 'var(--c-muted)' }}>{stage.description}</p>
                      <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--c-caption)' }}>
                        <span>📅 Est. {stage.estimatedWeeks} weeks</span>
                        <span>⏱️ {stage.remainingWeeks} weeks left</span>
                        {stage.chaptersPending > 0 && <span>📖 {stage.chaptersPending} ch. pending</span>}
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--c-caption)' }}>
                          <span>Progress</span>
                          <span>{Math.round(stage.progress)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                          <div className={`h-full rounded-full transition-all duration-700`}
                            style={{
                              width: `${Math.min(100, stage.progress)}%`,
                              background: isDone ? 'var(--c-green)' : isActive ? 'var(--c-blue)' : 'var(--c-caption)',
                            }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── DAILY PLAN ─── */}
        {view === 'daily' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h2>
              <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
                Day {Math.floor((today.getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)}
              </span>
            </div>

            {planChapters && planChapters.length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--c-muted)' }}>Today&apos;s Plan</h3>
                {planChapters.map(({ subject, chapter, topics }) => (
                  <div key={chapter.id} className="rounded-[18px] p-4" style={{
                    background: 'var(--c-card)', border: '1px solid var(--c-border-card)',
                    borderLeft: `3px solid ${SUBJECT_STYLES[subject].color}`,
                    boxShadow: 'var(--c-shadow)',
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{SUBJECT_STYLES[subject].emoji}</span>
                      <span className="text-xs font-medium capitalize" style={{ color: 'var(--c-text)' }}>{subject}</span>
                      <span className="text-xs" style={{ color: 'var(--c-muted)' }}>· {chapter.name}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{
                        color: chStatus(chapter.id) === 'done' ? 'var(--c-green)' : chStatus(chapter.id) === 'in_progress' ? 'var(--c-blue)' : 'var(--c-muted)',
                        background: chStatus(chapter.id) === 'done' ? 'rgba(15,138,94,0.1)' : chStatus(chapter.id) === 'in_progress' ? 'rgba(35,131,226,0.1)' : 'var(--c-progress-bg)',
                      }}>
                        {chStatus(chapter.id) === 'done' ? '✓ Done' : chStatus(chapter.id) === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                    {topics.length > 0 && (
                      <div className="space-y-1 ml-4 mb-3">
                        {topics.map(t => (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-black/[0.02]">
                            <input type="checkbox" checked={t.done}
                              onChange={e => setTopicDone(chapter.id, t.id, e.target.checked)}
                              className="w-3 h-3 rounded-sm text-[var(--c-blue)]" />
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

            {/* Chapter Selector 1 */}
            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--c-blue)]" />
                <div className="flex gap-1 flex-1 flex-wrap">
                  {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                    <button key={s} onClick={() => { setSelSubject1(s); setSelDivision1(null); setSelChapter1(null) }}
                      className="text-xs px-2 py-0.5 rounded-full border transition-colors" style={{
                        color: selSubject1 === s ? '#fff' : 'var(--c-muted)',
                        borderColor: selSubject1 === s ? 'transparent' : 'var(--c-border-input)',
                        background: selSubject1 === s ? SUBJECT_STYLES[s].color : 'transparent',
                      }}>
                      {SUBJECT_STYLES[s].emoji} {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {selSubject1 && (
                <div className="flex flex-wrap gap-1 mb-3 ml-1">
                  {divisions1.map(d => (
                    <button key={d.id} onClick={() => { setSelDivision1(d.id); setSelChapter1(null) }}
                      className="text-[10px] px-2 py-0.5 rounded-full transition-colors" style={{
                        color: selDivision1 === d.id ? 'var(--c-text)' : 'var(--c-muted)',
                        background: selDivision1 === d.id ? 'var(--c-progress-bg)' : 'transparent',
                      }}>
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
              {currentDiv1 && (
                <div className="space-y-1 mb-2 ml-1">
                  {currentDiv1.chapters.map(ch => {
                    const st = chStatus(ch.id)
                    const isSel = selChapter1 === ch.id
                    return (
                      <div key={ch.id} onClick={() => setSelChapter1(isSel ? null : ch.id)}
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer" style={{
                          background: isSel ? 'var(--c-tag)' : 'transparent',
                          borderLeft: isSel ? '2px solid var(--c-blue)' : '2px solid transparent',
                        }}>
                        <span className="text-xs" style={{ color: st === 'done' ? 'var(--c-green)' : 'var(--c-muted)' }}>
                          {st === 'done' ? '✓' : st === 'in_progress' ? '🔄' : '○'}
                        </span>
                        <span className="text-xs flex-1" style={{ color: st === 'done' ? 'var(--c-muted)' : 'var(--c-text)', textDecoration: st === 'done' ? 'line-through' : 'none' }}>
                          {ch.name}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{ch.topics.filter(t => !t.deleted).length} topics</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Chapter Selector 2 */}
            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--c-green)]" />
                <div className="flex gap-1 flex-1 flex-wrap">
                  {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                    <button key={s} onClick={() => { setSelSubject2(s); setSelDivision2(null); setSelChapter2(null) }}
                      className="text-xs px-2 py-0.5 rounded-full border transition-colors" style={{
                        color: selSubject2 === s ? '#fff' : 'var(--c-muted)',
                        borderColor: selSubject2 === s ? 'transparent' : 'var(--c-border-input)',
                        background: selSubject2 === s ? SUBJECT_STYLES[s].color : 'transparent',
                      }}>
                      {SUBJECT_STYLES[s].emoji} {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {selSubject2 && (
                <div className="flex flex-wrap gap-1 mb-3 ml-1">
                  {divisions2.map(d => (
                    <button key={d.id} onClick={() => { setSelDivision2(d.id); setSelChapter2(null) }}
                      className="text-[10px] px-2 py-0.5 rounded-full transition-colors" style={{
                        color: selDivision2 === d.id ? 'var(--c-text)' : 'var(--c-muted)',
                        background: selDivision2 === d.id ? 'var(--c-progress-bg)' : 'transparent',
                      }}>
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
              {currentDiv2 && (
                <div className="space-y-1 mb-2 ml-1">
                  {currentDiv2.chapters.map(ch => {
                    const st = chStatus(ch.id)
                    const isSel = selChapter2 === ch.id
                    return (
                      <div key={ch.id} onClick={() => setSelChapter2(isSel ? null : ch.id)}
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer" style={{
                          background: isSel ? 'var(--c-tag)' : 'transparent',
                          borderLeft: isSel ? '2px solid var(--c-green)' : '2px solid transparent',
                        }}>
                        <span className="text-xs" style={{ color: st === 'done' ? 'var(--c-green)' : 'var(--c-muted)' }}>
                          {st === 'done' ? '✓' : st === 'in_progress' ? '🔄' : '○'}
                        </span>
                        <span className="text-xs flex-1" style={{ color: st === 'done' ? 'var(--c-muted)' : 'var(--c-text)', textDecoration: st === 'done' ? 'line-through' : 'none' }}>
                          {ch.name}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{ch.topics.filter(t => !t.deleted).length} topics</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── MONTHLY VIEW ─── */}
        {view === 'monthly' && (
          <div>
            <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="rounded-[18px] p-4 mb-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="grid grid-cols-7 gap-0.5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-[10px] font-semibold uppercase tracking-wider text-center py-1" style={{ color: 'var(--c-muted)' }}>{d}</div>
                ))}
                {monthDays.map((day, i) => (
                  <div key={i} onClick={() => day && setSelectedDay(selectedDay?.toDateString() === day.toDateString() ? null : day)}
                    className="text-sm text-center py-1.5 rounded-[10px] cursor-pointer transition-colors" style={{
                      color: day?.toDateString() === today.toDateString() ? '#fff' : day && selectedDay && day.toDateString() === selectedDay.toDateString() ? 'var(--c-blue)' : day ? 'var(--c-text)' : undefined,
                      background: day?.toDateString() === today.toDateString() ? 'var(--c-blue)' : day && selectedDay && day.toDateString() === selectedDay.toDateString() ? 'rgba(35,131,226,0.15)' : undefined,
                    }}>
                    {day?.getDate() || ''}
                  </div>
                ))}
              </div>
            </div>
            {selectedDay && (
              <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--c-text)' }}>
                  Targets for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                {monthDetailChapters.length > 0 ? (
                  <div className="space-y-2">
                    {monthDetailChapters.map(({ subject, chapters }) => (
                      <div key={subject} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: SUBJECT_STYLES[subject].color }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium capitalize" style={{ color: 'var(--c-text)' }}>{subject}</span>
                          <div className="text-xs" style={{ color: 'var(--c-muted)' }}>{chapters.map(ch => ch.name).join(', ') || 'All done'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic" style={{ color: 'var(--c-muted)' }}>All caught up! No pending chapters.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
