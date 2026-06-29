'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { db } from '@/lib/db'
import { getMonthDays, formatDate } from '@/lib/utils'
import syllabusData from '@/data/syllabus.json'
import type { Subject, Chapter, QuestionsEntry, PomodoroSession, DailyLog } from '@/types'

const syllabus = syllabusData as unknown as { [key in Subject]: { divisions: { chapters: Chapter[] }[] } }

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
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])

  useEffect(() => {
    db.progress.toArray().then(setProgressEntries)
    db.questions.toArray().then(setQuestionEntries)
    db.pomodoro.toArray().then(setPomodoroSessions)
    db.dailyLogs.toArray().then(setDailyLogs)
  }, [])

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

    for (const s of pomodoroSessions) {
      const day = addDay(s.date)
      day.studySeconds += s.duration
    }

    for (const log of dailyLogs) {
      const day = addDay(log.date)
      if (log.studyMinutes > 0) {
        day.studySeconds = Math.max(day.studySeconds, log.studyMinutes * 60)
      }
    }

    return map
  }, [progressEntries, questionEntries, pomodoroSessions, dailyLogs])

  const selKey = selectedDate ? formatDate(selectedDate) : null
  const selActivity = selKey ? activityByDate[selKey] : null

  const selQuestions = useMemo(() => {
    if (!selKey) return []
    return questionEntries.filter(q => q.date === selKey)
  }, [questionEntries, selKey])

  const selPomodoro = useMemo(() => {
    if (!selKey) return []
    return pomodoroSessions.filter(s => s.date === selKey)
  }, [pomodoroSessions, selKey])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Activity Journal</h1>
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
              {selPomodoro.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selPomodoro.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--c-muted)' }}>
                        {new Date(s.start).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true })} &rarr; {s.end ? new Date(s.end).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'now'}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--c-text)' }}>
                        {Math.floor(s.duration / 60)}m {s.duration % 60}s
                      </span>
                    </div>
                  ))}
                </div>
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
          </div>
        )}

        {!selectedDate && (
          <div className="rounded-[18px] p-8 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Click on a date above to see your activity breakdown.</p>
          </div>
        )}
      </div>
    </div>
  )
}
