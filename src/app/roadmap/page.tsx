'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculatePace } from '@/lib/pacing'
import { formatDate, getDaysBetween } from '@/lib/utils'
import { db } from '@/lib/db'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, Chapter, DailyPlan, DailyPlanSubject, RoadmapStage } from '@/types'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

const syllabus = syllabusData as unknown as SyllabusData

type ViewType = 'journey' | 'daily'

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
  const [planDate, setPlanDate] = useState<string>(formatDate(new Date()))
  const [todaysPlan, setTodaysPlan] = useState<DailyPlan | null>(null)
  const [editPlan, setEditPlan] = useState<DailyPlan | null>(null)
  const [editHours, setEditHours] = useState(8)
  const [editSubjects, setEditSubjects] = useState<DailyPlanSubject[]>([])
  const [selSubject, setSelSubject] = useState<Subject | null>(null)
  const [selDivision, setSelDivision] = useState<string | null>(null)
  const [selChapter, setSelChapter] = useState<string | null>(null)
  const { progress, setTopicDone, setChapterStatus, loaded } = useProgressStore()
  const { settings } = useSettingsStore()
  const today = new Date()
  const todayStr = formatDate(today)

  useEffect(() => { db.dailyPlans.get(todayStr).then(p => setTodaysPlan(p || null)) }, [todayStr])

  useEffect(() => {
    if (view !== 'daily') return
    db.dailyPlans.get(planDate).then(p => {
      const plan = p || { date: planDate, hoursGoal: 8, subjects: [] }
      setEditPlan(plan)
      setEditHours(plan.hoursGoal || 8)
      setEditSubjects(plan.subjects || [])
    })
  }, [view, planDate])

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

  const divisions = useMemo(() => selSubject ? getDivisions(selSubject) : [], [selSubject])
  const currentDiv = divisions.find(d => d.id === selDivision)

  const chStatus = useCallback((chId: string) => progress[chId]?.status || 'not_started', [progress])

  const addChapterToPlan = (subject: Subject, chapterName: string) => {
    setEditSubjects(prev => {
      const existing = prev.find(s => s.subject === subject)
      if (existing) {
        if (existing.chapters.includes(chapterName)) return prev
        return prev.map(s => s.subject === subject ? { ...s, chapters: [...s.chapters, chapterName] } : s)
      }
      return [...prev, { subject, chapters: [chapterName], questions: 0 }]
    })
  }

  const removeChapterFromPlan = (subject: Subject, chapterName: string) => {
    setEditSubjects(prev => prev.map(s => {
      if (s.subject !== subject) return s
      const chs = s.chapters.filter(c => c !== chapterName)
      return { ...s, chapters: chs }
    }).filter(s => s.chapters.length > 0))
  }

  const setSubjectQuestions = (subject: Subject, q: number) => {
    setEditSubjects(prev => prev.map(s => s.subject === subject ? { ...s, questions: q } : s))
  }

  const savePlan = async () => {
    if (!editPlan) return
    const plan: DailyPlan = { date: planDate, hoursGoal: editHours, subjects: editSubjects }
    await db.dailyPlans.put(plan)
    setEditPlan(plan)
    if (planDate === todayStr) setTodaysPlan(plan)
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <div className="max-w-[900px] mx-auto px-4 md:px-6 pt-[17px] pb-6" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
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
            {/* Date picker */}
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>
                Plan for
              </h2>
              <input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-[40px] outline-none"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-card)' }} />
            </div>

            {/* Hours Goal */}
            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-rounded text-[18px]" style={{ color: 'var(--c-blue)' }}>schedule</span>
                <span className="text-[13px] font-medium" style={{ color: 'var(--c-muted)' }}>Hours Goal</span>
                <input type="number" min={1} max={16} value={editHours} onChange={e => setEditHours(Math.min(16, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-16 px-2 py-1 text-sm outline-none rounded-[40px] ml-auto text-center"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }} />
              </div>
            </div>

            {/* Planned subjects */}
            {editSubjects.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--c-muted)' }}>Subjects</h3>
                {editSubjects.map(s => (
                  <div key={s.subject} className="rounded-[18px] p-4" style={{
                    background: 'var(--c-card)', border: '1px solid var(--c-border-card)',
                    borderLeft: `3px solid ${SUBJECT_STYLES[s.subject].color}`,
                    boxShadow: 'var(--c-shadow)',
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{SUBJECT_STYLES[s.subject].emoji}</span>
                      <span className="text-xs font-medium capitalize" style={{ color: 'var(--c-text)' }}>{s.subject}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <label className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Qs:</label>
                        <input type="number" min={0} value={s.questions} onChange={e => setSubjectQuestions(s.subject, parseInt(e.target.value, 10) || 0)}
                          className="w-14 px-2 py-0.5 text-xs outline-none rounded-[40px] text-center"
                          style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.chapters.map(ch => (
                        <span key={ch} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full"
                          style={{ background: `${SUBJECT_STYLES[s.subject].color}15`, color: SUBJECT_STYLES[s.subject].color }}>
                          {ch}
                          <button onClick={() => removeChapterFromPlan(s.subject, ch)} className="hover:opacity-60">&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chapter selector */}
            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--c-blue)]" />
                <span className="text-xs font-medium" style={{ color: 'var(--c-muted)' }}>Add Chapters</span>
                <div className="flex gap-1 flex-1 justify-end flex-wrap">
                  {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                    <button key={s} onClick={() => { setSelSubject(s); setSelDivision(null); setSelChapter(null) }}
                      className="text-xs px-2 py-0.5 rounded-full border transition-colors" style={{
                        color: selSubject === s ? '#fff' : 'var(--c-muted)',
                        borderColor: selSubject === s ? 'transparent' : 'var(--c-border-input)',
                        background: selSubject === s ? SUBJECT_STYLES[s].color : 'transparent',
                      }}>
                      {SUBJECT_STYLES[s].emoji} {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {selSubject && (
                <div className="flex flex-wrap gap-1 mb-3 ml-1">
                  {divisions.map(d => (
                    <button key={d.id} onClick={() => { setSelDivision(d.id); setSelChapter(null) }}
                      className="text-[10px] px-2 py-0.5 rounded-full transition-colors" style={{
                        color: selDivision === d.id ? 'var(--c-text)' : 'var(--c-muted)',
                        background: selDivision === d.id ? 'var(--c-progress-bg)' : 'transparent',
                      }}>
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
              {currentDiv && (
                <div className="space-y-1 mb-2 ml-1">
                  {currentDiv.chapters.map(ch => {
                    const st = chStatus(ch.id)
                    const inPlan = editSubjects.some(s => s.subject === selSubject && s.chapters.includes(ch.name))
                    return (
                      <div key={ch.id} onClick={() => {
                        if (inPlan) removeChapterFromPlan(selSubject!, ch.name)
                        else addChapterToPlan(selSubject!, ch.name)
                      }}
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer" style={{
                          background: inPlan ? 'var(--c-tag)' : 'transparent',
                          borderLeft: inPlan ? '2px solid var(--c-blue)' : '2px solid transparent',
                        }}>
                        <span className="text-xs" style={{ color: inPlan ? 'var(--c-blue)' : st === 'done' ? 'var(--c-green)' : 'var(--c-muted)' }}>
                          {inPlan ? '✓' : st === 'done' ? '✓' : st === 'in_progress' ? '🔄' : '○'}
                        </span>
                        <span className="text-xs flex-1" style={{
                          color: st === 'done' ? 'var(--c-muted)' : 'var(--c-text)',
                          textDecoration: st === 'done' ? 'line-through' : 'none',
                        }}>
                          {ch.name}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{ch.topics.filter(t => !t.deleted).length} topics</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Save / Reset */}
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => {
                setEditSubjects([])
                setEditHours(8)
              }} className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>
                Reset
              </button>
              <button onClick={savePlan} disabled={!editPlan}
                className="text-xs font-medium px-5 py-2 rounded-[40px] text-white transition-all disabled:opacity-40"
                style={{ background: 'var(--c-btn-primary)' }}>
                Save Plan
              </button>
            </div>

            {/* Weekly overview */}
            <div className="rounded-[18px] p-4 mt-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--c-text)' }}>This Week</h3>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {weekDates.map(d => {
                  const ds = formatDate(d)
                  const isToday = ds === todayStr
                  const isSelected = ds === planDate
                  return (
                    <button key={ds} onClick={() => setPlanDate(ds)}
                      className="flex flex-col items-center gap-1 px-3 py-2 rounded-[12px] transition-all min-w-[56px] flex-shrink-0"
                      style={{
                        background: isSelected ? 'var(--c-blue)' : isToday ? 'var(--c-tag)' : 'var(--c-card-alt)',
                        color: isSelected ? '#fff' : 'var(--c-text)',
                      }}>
                      <span className="text-[10px] font-medium">{d.toLocaleDateString('en', { weekday: 'short' })}</span>
                      <span className="text-sm font-bold">{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
