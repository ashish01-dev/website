'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { db } from '@/lib/db'
import { getMonthDays, formatDate } from '@/lib/utils'
import { useUser } from '@/lib/useUser'
import syllabusData from '@/data/syllabus.json'
import type { Subject, Chapter, QuestionsEntry, DailyLog, DailyPlan, DailyPlanSubject, SyllabusData } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

function getChapterName(chapterId: string): string | null {
  for (const sub of ['physics', 'chemistry', 'maths'] as Subject[]) {
    for (const div of syllabus[sub].divisions) {
      const ch = div.chapters.find(c => c.id === chapterId)
      if (ch) return ch.name
    }
  }
  return null
}

function getSubjectFromChapter(chapterId: string): Subject | null {
  for (const sub of ['physics', 'chemistry', 'maths'] as Subject[]) {
    for (const div of syllabus[sub].divisions) {
      if (div.chapters.find(c => c.id === chapterId)) return sub
    }
  }
  return null
}

const SUBJECT_STYLES: Record<Subject, { color: string; emoji: string }> = {
  physics: { color: 'var(--c-blue)', emoji: '⚡' },
  chemistry: { color: 'var(--c-green)', emoji: '🧪' },
  maths: { color: 'var(--c-orange)', emoji: '📐' },
}

export default function ActivityPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [progressEntries, setProgressEntries] = useState<any[]>([])
  const [questionEntries, setQuestionEntries] = useState<QuestionsEntry[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const { user } = useUser()
  const isPro = user?.isPro ?? false

  /* Plan editing state */
  const [dayPlan, setDayPlan] = useState<DailyPlan | null>(null)
  const [planHours, setPlanHours] = useState(8)
  const [planSubjects, setPlanSubjects] = useState<DailyPlanSubject[]>([])
  const [selSubject, setSelSubject] = useState<Subject | null>(null)
  const [selDivision, setSelDivision] = useState<string | null>(null)
  const [selChapter, setSelChapter] = useState<string | null>(null)

  const divisions = useMemo(() => {
    if (!selSubject) return []
    return syllabus[selSubject].divisions.map(d => ({
      id: d.id,
      name: d.name,
      chapters: d.chapters.filter(c => !c.deleted),
    }))
  }, [selSubject])

  const currentDiv = divisions.find(d => d.id === selDivision)

  useEffect(() => {
    if (!selectedDate) return
    const key = formatDate(selectedDate)
    db.dailyPlans.get(key).then(p => {
      const plan = p || { date: key, hoursGoal: 8, subjects: [] }
      setDayPlan(plan)
      setPlanHours(plan.hoursGoal || 8)
      setPlanSubjects(plan.subjects || [])
    })
  }, [selectedDate])

  const loadActivity = useCallback(async () => {
    setProgressEntries(await db.progress.toArray())
    setQuestionEntries(await db.questions.toArray())
    setDailyLogs(await db.dailyLogs.toArray())
  }, [])

  useEffect(() => { loadActivity() }, [loadActivity])

  useEffect(() => {
    const onFocus = () => loadActivity()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadActivity])

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth])

  const activityByDate = useMemo(() => {
    const map: Record<string, {
      chapters: { id: string; name: string; subject: Subject }[]
      questions: { count: number; subject: Subject; chapter: string }[]
      studySeconds: number
    }> = {}

    const addDay = (date: string) => {
      if (!map[date]) map[date] = { chapters: [], questions: [], studySeconds: 0 }
      return map[date]
    }

    for (const entry of progressEntries) {
      if (entry.completedOn) {
        const day = addDay(entry.completedOn)
        const name = getChapterName(entry.chapterId)
        const subject = getSubjectFromChapter(entry.chapterId)
        if (name && subject) {
          day.chapters.push({ id: entry.chapterId, name, subject })
        }
      }
    }

    for (const q of questionEntries) {
      const day = addDay(q.date)
      day.questions.push({ count: q.count, subject: q.subject, chapter: q.chapter })
    }

    for (const log of dailyLogs) {
      const day = addDay(log.date)
      if (log.studyMinutes > 0) {
        day.studySeconds = Math.max(day.studySeconds, log.studyMinutes * 60)
      }
    }

    return map
  }, [progressEntries, questionEntries, dailyLogs])

  const selKey = selectedDate ? formatDate(selectedDate) : null
  const selActivity = selKey ? activityByDate[selKey] : null

  const selQuestions = useMemo(() => {
    if (!selKey) return []
    return questionEntries.filter(q => q.date === selKey)
  }, [questionEntries, selKey])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  const addChapterToPlan = (subject: Subject, chapterName: string) => {
    setPlanSubjects(prev => {
      const existing = prev.find(s => s.subject === subject)
      if (existing) {
        if (existing.chapters.includes(chapterName)) return prev
        return prev.map(s => s.subject === subject ? { ...s, chapters: [...s.chapters, chapterName] } : s)
      }
      return [...prev, { subject, chapters: [chapterName], questions: 0 }]
    })
  }

  const removeChapterFromPlan = (subject: Subject, chapterName: string) => {
    setPlanSubjects(prev => prev.map(s => {
      if (s.subject !== subject) return s
      const chs = s.chapters.filter(c => c !== chapterName)
      return { ...s, chapters: chs }
    }).filter(s => s.chapters.length > 0))
  }

  const setSubjectQuestions = (subject: Subject, q: number) => {
    setPlanSubjects(prev => prev.map(s => s.subject === subject ? { ...s, questions: q } : s))
  }

  const savePlan = async () => {
    if (!selKey) return
    const plan: DailyPlan = { date: selKey, hoursGoal: planHours, subjects: planSubjects }
    await db.dailyPlans.put(plan)
    setDayPlan(plan)
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px]" style={{ color: 'var(--c-text)' }}>Activity Journal</h1>
          <button onClick={loadActivity} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-[40px] transition-all hover:-translate-y-[0.5px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>
            <span className="material-symbols-rounded text-[14px]">refresh</span>
            Refresh
          </button>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Daily breakdown of your study progress</p>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>&larr; Prev</button>
            <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
              {new Date(viewYear, viewMonth).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>Next &rarr;</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[10px] text-center py-1 font-medium" style={{ color: 'var(--c-muted)' }}>{d}</div>
            ))}
            {monthDays.map((day, i) => {
              if (!day) return <div key={i} />
              const key = formatDate(day)
              const hasData = !!activityByDate[key]
              const isToday = key === formatDate(today)
              const isSelected = selKey === key
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className="text-sm text-center py-2 rounded-lg transition-all relative"
                  style={{
                    color: isSelected ? '#fff' : isToday ? 'var(--c-blue)' : 'var(--c-text)',
                    background: isSelected ? 'var(--c-blue)' : isToday ? 'transparent' : 'transparent',
                    border: isToday && !isSelected ? '1px solid #2383e2' : '1px solid transparent',
                    fontWeight: isSelected ? '500' : undefined,
                  }}
                  onMouseEnter={e => { if (!isSelected && !isToday) e.currentTarget.style.background = 'var(--c-progress-bg)' }}
                  onMouseLeave={e => { if (!isSelected && !isToday) e.currentTarget.style.background = 'transparent' }}
                >
                  {day.getDate()}
                  {hasData && !isSelected && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--c-blue)]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>

            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">⏱️</span>
                <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Study Time</span>
              </div>
              {selActivity && selActivity.studySeconds > 0 ? (
                <div className="text-2xl font-bold" style={{ color: 'var(--c-blue)' }}>
                  {Math.floor(selActivity.studySeconds / 3600)}h {Math.floor((selActivity.studySeconds % 3600) / 60)}m
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--c-muted)' }}>No study sessions logged for this day.</p>
              )}
            </div>

            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">📚</span>
                <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Chapters Completed</span>
              </div>
              {selActivity && selActivity.chapters.length > 0 ? (
                <div className="space-y-2">
                  {selActivity.chapters.map(ch => {
                    const style = SUBJECT_STYLES[ch.subject]
                    return (
                      <div key={ch.id} className="flex items-center gap-2">
                        <span className="text-xs">{style.emoji}</span>
                        <span className="text-xs" style={{ color: 'var(--c-text)' }}>{ch.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: `${style.color}15`, color: style.color }}>
                          {ch.subject}
                        </span>
                        <span className="text-xs ml-auto" style={{ color: 'var(--c-green)' }}>✓</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--c-muted)' }}>No chapters completed on this day.</p>
              )}
            </div>

            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">❓</span>
                <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Questions Practiced</span>
              </div>
              {selQuestions.length > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    const grouped: Record<string, { subject: Subject; total: number }> = {}
                    for (const q of selQuestions) {
                      const key = `${q.subject}-${q.chapter}`
                      if (!grouped[key]) grouped[key] = { subject: q.subject, total: 0 }
                      grouped[key].total += q.count
                    }
                    const totalQ = selQuestions.reduce((a, q) => a + q.count, 0)
                    return (
                      <>
                        <div className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{totalQ} <span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}>questions</span></div>
                        <div className="space-y-1 mt-2">
                          {Object.values(grouped).map(g => (
                            <div key={g.subject} className="flex items-center gap-2 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUBJECT_STYLES[g.subject].color }} />
                              <span style={{ color: 'var(--c-text)' }}>{g.total} questions</span>
                              <span className="capitalize" style={{ color: 'var(--c-muted)' }}>({g.subject})</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--c-muted)' }}>No questions logged for this day.</p>
              )}
            </div>

            {/* Plan for this day — Pro feature */}
            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-rounded text-[18px]" style={{ color: 'var(--c-blue)' }}>calendar_today</span>
                <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Plan for this Day</span>
                {!isPro && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>Pro</span>}
              </div>
              {!isPro ? (
                <div className="text-center py-4">
                  <p className="text-sm mb-3" style={{ color: 'var(--c-muted)' }}>Planning future study sessions is a Pro feature.</p>
                  <button onClick={() => window.location.href = '/pricing'}
                    className="inline-flex items-center gap-1.5 text-white text-[12px] font-medium rounded-[40px] px-[18px] py-[7px] transition-all duration-200"
                    style={{ background: 'var(--c-btn-primary)' }}>Upgrade to Pro</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium" style={{ color: 'var(--c-muted)' }}>Hours Goal</span>
                    <input type="number" min={1} max={16} value={planHours} onChange={e => setPlanHours(Math.min(16, Math.max(1, Number(e.target.value) || 1)))}
                      className="w-16 px-2 py-1 text-sm outline-none rounded-[40px] text-center"
                      style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }} />
                  </div>

                  {planSubjects.length > 0 && (
                    <div className="space-y-2">
                      {planSubjects.map(s => (
                        <div key={s.subject} className="rounded-[12px] p-3" style={{ background: 'var(--c-input)', border: '1px solid var(--c-border)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{SUBJECT_STYLES[s.subject].emoji}</span>
                            <span className="text-xs font-medium capitalize" style={{ color: 'var(--c-text)' }}>{s.subject}</span>
                            <div className="ml-auto flex items-center gap-2">
                              <label className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Qs:</label>
                              <input type="number" min={0} value={s.questions} onChange={e => setSubjectQuestions(s.subject, parseInt(e.target.value, 10) || 0)}
                                className="w-14 px-2 py-0.5 text-xs outline-none rounded-[40px] text-center"
                                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-card)' }} />
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
                  <div>
                    <div className="flex items-center gap-2 mb-2">
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
                      <div className="flex flex-wrap gap-1 mb-2 ml-1">
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
                      <div className="space-y-1 ml-1">
                        {currentDiv.chapters.map(ch => {
                          const inPlan = planSubjects.some(s => s.subject === selSubject && s.chapters.includes(ch.name))
                          return (
                            <div key={ch.id} onClick={() => {
                              if (inPlan) removeChapterFromPlan(selSubject!, ch.name)
                              else addChapterToPlan(selSubject!, ch.name)
                            }}
                              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer" style={{
                                background: inPlan ? 'var(--c-tag)' : 'transparent',
                                borderLeft: inPlan ? '2px solid var(--c-blue)' : '2px solid transparent',
                              }}>
                              <span className="text-xs" style={{ color: inPlan ? 'var(--c-blue)' : 'var(--c-muted)' }}>
                                {inPlan ? '✓' : '○'}
                              </span>
                              <span className="text-xs flex-1" style={{ color: 'var(--c-text)' }}>{ch.name}</span>
                              <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{ch.topics.filter(t => !t.deleted).length} topics</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button onClick={() => {
                      setPlanSubjects([])
                      setPlanHours(8)
                    }} className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
                      style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>
                      Reset
                    </button>
                    <button onClick={savePlan}
                      className="text-xs font-medium px-5 py-2 rounded-[40px] text-white transition-all"
                      style={{ background: 'var(--c-btn-primary)' }}>
                      Save Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedDate && (
          <div className="rounded-[18px] p-8 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Click on a date above to see your activity breakdown and plan your day.</p>
          </div>
        )}
      </div>
    </div>
  )
}
