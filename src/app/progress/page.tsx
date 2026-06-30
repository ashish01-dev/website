'use client'

import { useMemo, useState, useEffect } from 'react'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculatePace } from '@/lib/pacing'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, TestEntry, PomodoroSession, Chapter } from '@/types'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

const syllabus = syllabusData as unknown as SyllabusData

const SUBJECT_INFO: Record<Subject, { label: string; color: string; emoji: string }> = {
  physics: { label: 'Physics', color: 'var(--c-blue)', emoji: '⚡' },
  chemistry: { label: 'Chemistry', color: 'var(--c-green)', emoji: '🧪' },
  maths: { label: 'Maths', color: 'var(--c-orange)', emoji: '📐' },
}

const DEFAULT_ACHIEVEMENTS = [
  { id: '7d_streak', name: '7-Day Streak', description: 'Studied for 7 consecutive days', icon: '🔥', unlocked: false, progress: 0, target: 7 },
  { id: '50_chapters', name: 'Chapter Master', description: 'Completed 50 chapters', icon: '📚', unlocked: false, progress: 0, target: 50 },
  { id: '100_hours', name: 'Century', description: 'Studied for 100 hours total', icon: '⏱️', unlocked: false, progress: 0, target: 100 },
  { id: 'first_revision', name: 'Revision Ready', description: 'Completed first full revision cycle', icon: '🔄', unlocked: false, progress: 0, target: 1 },
  { id: '1000_questions', name: 'Question Machine', description: 'Solved 1000 questions', icon: '✍️', unlocked: false, progress: 0, target: 1000 },
  { id: 'full_syllabus', name: 'Syllabus Complete', description: 'Completed 100% of syllabus', icon: '🎯', unlocked: false, progress: 0, target: 100 },
]

function ReadinessCircle({ score }: { score: number }) {
  const r = 72
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative w-[180px] h-[180px] flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--c-progress-bg)" strokeWidth="8" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--c-blue)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
      </svg>
      <div className="text-center">
        <div className="text-[42px] font-bold tracking-[-1px]" style={{ color: 'var(--c-text)' }}>{score}</div>
        <div className="text-[11px]" style={{ color: 'var(--c-muted)' }}>/ 100</div>
      </div>
    </div>
  )
}

function MiniProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-1.5 rounded-full overflow-hidden flex-1" style={{ background: 'var(--c-progress-bg)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function ProgressPage() {
  const { progress, getSubjectChapters, getProgress, loaded } = useProgressStore()
  const { settings } = useSettingsStore()
  const [tests, setTests] = useState<TestEntry[]>([])
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [questionEntries, setQuestionEntries] = useState<{ count: number }[]>([])
  const [dailyLogs, setDailyLogs] = useState<{ date: string; studyMinutes: number }[]>([])
  const [restDays, setRestDays] = useState(1)
  const [dailyHoursInput, setDailyHoursInput] = useState(settings.dailyStudyHours || 6)

  useEffect(() => { db.tests.toArray().then(setTests) }, [])
  useEffect(() => { db.pomodoro.toArray().then(setSessions) }, [])
  useEffect(() => { db.questions.toArray().then(setQuestionEntries) }, [])
  useEffect(() => { db.dailyLogs.toArray().then(setDailyLogs) }, [])

  /* ─── Subject Data ─── */
  const subjectsMeta = useMemo(() =>
    (['physics', 'chemistry', 'maths'] as Subject[]).map(s => ({
      id: s,
      ...SUBJECT_INFO[s],
      chapters: getSubjectChapters(s),
      percent: getProgress(s),
    })), [])

  /* ─── Readiness Score ─── */
  const readinessScore = useMemo(() => {
    const chapterPct = subjectsMeta.reduce((a, s) => a + s.percent, 0) / 3
    const consistencyScore = Math.min(100, (dailyLogs.length / 30) * 100)
    const revisionScore = Math.min(100, Object.values(progress).filter(p => (p.revisionCount || 0) > 0).length * 10)
    const questionScore = Math.min(100, (questionEntries.reduce((a, q) => a + q.count, 0) / 500) * 100)
    return Math.round(chapterPct * 0.4 + consistencyScore * 0.25 + revisionScore * 0.2 + questionScore * 0.15)
  }, [subjectsMeta, progress, dailyLogs, questionEntries])

  /* ─── Calculator ─── */
  const today = new Date()
  const examD = new Date(settings.examDate)
  const daysRemaining = Math.max(1, Math.ceil((examD.getTime() - today.getTime()) / 86400000))
  const totalChapters = useMemo(() => {
    let t = 0
    for (const sub of ['physics', 'chemistry', 'maths'] as Subject[])
      for (const div of syllabus[sub].divisions) for (const ch of div.chapters) if (!ch.deleted) t++
    return t
  }, [])
  const remainingChapters = useMemo(() => {
    let r = 0
    for (const sub of ['physics', 'chemistry', 'maths'] as Subject[])
      for (const div of syllabus[sub].divisions)
        for (const ch of div.chapters) if (!ch.deleted && progress[ch.id]?.status !== 'done') r++
    return r
  }, [progress])
  const estHoursPerChapter = 6
  const remainingHours = remainingChapters * estHoursPerChapter
  const availablePerDay = dailyHoursInput
  const effectiveDays = daysRemaining - Math.floor(daysRemaining / 7) * restDays
  const requiredDaily = Math.ceil(remainingHours / Math.max(1, effectiveDays))
  const bufferDays = Math.max(0, Math.round(effectiveDays - remainingHours / Math.max(1, availablePerDay * 0.8)))

  const overallPct = useMemo(() => {
    const total = subjectsMeta.reduce((a, s) => a + s.chapters.total, 0)
    const done = subjectsMeta.reduce((a, s) => a + s.chapters.done, 0)
    return total > 0 ? Math.round((done / total) * 100) : 0
  }, [subjectsMeta])

  /* ─── Today's Suggested Goal ─── */
  const suggestedGoal = useMemo(() => {
    const undoneChapters: { subject: Subject; chapter: Chapter }[] = []
    for (const sub of ['physics', 'chemistry', 'maths'] as Subject[])
      for (const div of syllabus[sub].divisions)
        for (const ch of div.chapters)
          if (!ch.deleted && progress[ch.id]?.status !== 'done') undoneChapters.push({ subject: sub as Subject, chapter: ch })
    if (undoneChapters.length === 0) return null
    const priorityOrder = ['high', 'medium', 'low']
    undoneChapters.sort((a, b) => priorityOrder.indexOf(a.chapter.weightage) - priorityOrder.indexOf(b.chapter.weightage))
    const pick = undoneChapters[0]
    return {
      subject: pick.subject,
      chapter: pick.chapter,
      tasks: [
        `Complete ${pick.chapter.name} Theory`,
        `Solve 30 PYQs on ${pick.chapter.name}`,
        `Revise related topics`,
      ],
      estHours: Math.round(4 + Math.random() * 2),
      progressGain: 1.8 + Math.random() * 0.5,
    }
  }, [progress])

  /* ─── Average Performance ─── */
  const avgPerformance = useMemo(() => {
    if (dailyLogs.length === 0) return null
    const totalMin = dailyLogs.reduce((a, d) => a + d.studyMinutes, 0)
    const avgHours = totalMin / Math.max(1, dailyLogs.length) / 60
    const byWeek: Record<string, number> = {}
    for (const log of dailyLogs) {
      const d = new Date(log.date)
      const wk = `${d.getFullYear()}-W${Math.ceil((d.getDate() + (new Date(d.getFullYear(), d.getMonth(), 1).getDay())) / 7)}`
      byWeek[wk] = (byWeek[wk] || 0) + log.studyMinutes
    }
    const weeklyHours = Object.values(byWeek).map(m => m / 60)
    const avgWeekly = weeklyHours.length > 0 ? weeklyHours.reduce((a, h) => a + h, 0) / weeklyHours.length : 0
    const trend = weeklyHours.length >= 2 ? (weeklyHours[weeklyHours.length - 1] - weeklyHours[0]) / weeklyHours.length : 0
    return { avgHours: Math.round(avgHours * 10) / 10, avgWeekly: Math.round(avgWeekly * 10) / 10, trend }
  }, [dailyLogs])

  /* ─── Insights ─── */
  const insights = useMemo(() => {
    const list: string[] = []
    if (subjectsMeta.length > 0) {
      const best = subjectsMeta.reduce((a, s) => s.percent > a.percent ? s : a)
      const worst = subjectsMeta.reduce((a, s) => s.percent < a.percent ? s : a)
      if (best.percent > 0) list.push(`You're strongest in ${best.label} with ${best.percent}% completion.`)
      if (worst.percent < 100) list.push(`${worst.label} needs attention — only ${worst.percent}% done.`)
    }
    if (avgPerformance) {
      if (avgPerformance.avgHours > 4) list.push(`You average ${avgPerformance.avgHours}h/day — great consistency!`)
      else if (avgPerformance.avgHours > 2) list.push(`You average ${avgPerformance.avgHours}h/day. Try adding 1 more hour.`)
      else list.push(`Try increasing your daily study time beyond ${avgPerformance.avgHours}h/day.`)
    }
    if (remainingChapters > 0 && requiredDaily > 0) {
      if (requiredDaily <= availablePerDay) list.push(`Your pace is sustainable — ${requiredDaily}h/day needed.`)
      else list.push(`You need ${requiredDaily}h/day to finish. Consider extending your exam date.`)
    }
    if (list.length === 0) list.push('Start studying to see personalized insights!')
    return list
  }, [subjectsMeta, avgPerformance, remainingChapters, requiredDaily, availablePerDay])

  /* ─── Streak ─── */
  const currentStreak = useMemo(() => {
    let count = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      if (dailyLogs.some(l => l.date === formatDate(d) && l.studyMinutes > 0)) count++
      else break
    }
    return count
  }, [dailyLogs])

  /* ─── Achievements ─── */
  const achievements = useMemo(() => {
    const totalDone = subjectsMeta.reduce((a, s) => a + s.chapters.done, 0)
    const totalMinutes = dailyLogs.reduce((a, d) => a + d.studyMinutes, 0)
    const totalHours = Math.round(totalMinutes / 60)
    const totalQuestions = questionEntries.reduce((a, q) => a + q.count, 0)
    return DEFAULT_ACHIEVEMENTS.map(a => {
      let p = 0
      if (a.id === '7d_streak') p = Math.min(7, currentStreak)
      if (a.id === '50_chapters') p = Math.min(50, totalDone)
      if (a.id === '100_hours') p = Math.min(100, totalHours)
      if (a.id === 'first_revision') p = Object.values(progress).filter((pr: any) => (pr.revisionCount || 0) >= 1).length > 0 ? 1 : 0
      if (a.id === '1000_questions') p = Math.min(1000, totalQuestions)
      if (a.id === 'full_syllabus') p = overallPct
      return { ...a, progress: p, unlocked: p >= a.target }
    })
  }, [subjectsMeta, dailyLogs, questionEntries, progress, overallPct, currentStreak])

  /* ─── Heatmap ─── */
  const heatmapData = useMemo(() => {
    const days: { hours: number }[] = []
    for (let i = 181; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const daySessions = sessions.filter(s => s.date === formatDate(d))
      days.push({ hours: daySessions.reduce((a, s) => a + s.duration, 0) / 3600 })
    }
    return days
  }, [sessions])

  const heatLevel = (hours: number) => hours === 0 ? 0 : hours < 2 ? 1 : hours < 4 ? 2 : hours < 7 ? 3 : 4

  /* ─── Tests Chart ─── */
  const sortedTests = useMemo(() => [...tests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [tests])
  const MAX_SCORE = 300
  const chartPoints = useMemo(() => {
    if (sortedTests.length === 0) return null
    return sortedTests.map(t => ({ score: t.score, y: 100 - (t.score / MAX_SCORE) * 85, label: t.date.slice(5) }))
  }, [sortedTests])

  if (!loaded) return null

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <div className="max-w-[960px] mx-auto px-4 md:px-6 pt-[17px] pb-6" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px]" style={{ color: 'var(--c-text)' }}>My Progress</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--c-muted)' }}>Your complete JEE preparation analytics</p>
        </div>

        {/* ─── Readiness + Total Progress ─── */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-[18px] p-6 flex flex-col items-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'var(--c-muted)' }}>JEE Readiness Score</p>
            <ReadinessCircle score={readinessScore} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-4 text-[11px]">
              {[
                { label: 'Syllabus', value: `${overallPct}%`, color: 'var(--c-blue)' },
                { label: 'Consistency', value: `${Math.min(100, dailyLogs.length * 3)}%`, color: 'var(--c-green)' },
                { label: 'Revision', value: `${Math.min(100, Object.values(progress).filter(p => (p.revisionCount || 0) > 0).length * 10)}%`, color: 'var(--c-orange)' },
                { label: 'Practice', value: `${Math.min(100, Math.round(questionEntries.reduce((a, q) => a + q.count, 0) / 5))}%`, color: 'var(--c-red)' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: stat.color }} />
                  <span style={{ color: 'var(--c-muted)' }}>{stat.label}</span>
                  <span className="font-medium" style={{ color: 'var(--c-text)' }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] p-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <p className="text-xs uppercase tracking-wider font-medium mb-4" style={{ color: 'var(--c-muted)' }}>Syllabus Completion</p>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-[56px] font-bold tracking-[-2px] leading-none" style={{ color: 'var(--c-text)' }}>{overallPct}%</span>
              <span className="text-sm pb-1" style={{ color: 'var(--c-muted)' }}>done</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Completed', value: subjectsMeta.reduce((a, s) => a + s.chapters.done, 0), max: totalChapters, color: 'var(--c-green)' },
                { label: 'Remaining', value: totalChapters - subjectsMeta.reduce((a, s) => a + s.chapters.done, 0), max: totalChapters, color: 'var(--c-caption)' },
                { label: 'Revision Pending', value: Object.values(progress).filter(p => p.status === 'done' && (!p.lastRevised || (Date.now() - new Date(p.lastRevised).getTime()) > 14 * 86400000)).length, max: totalChapters, color: 'var(--c-orange)' },
                { label: 'Practice Pending', value: Object.values(progress).filter(p => p.status === 'done' && !p.lastRevised).length, max: totalChapters, color: 'var(--c-blue)' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2 text-[12px]">
                  <span className="w-28" style={{ color: 'var(--c-muted)' }}>{row.label}</span>
                  <MiniProgressBar value={row.value} max={row.max} color={row.color} />
                  <span className="w-8 text-right font-medium" style={{ color: 'var(--c-text)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Subject Breakdown ─── */}
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {subjectsMeta.map(s => (
            <div key={s.id} className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span>{s.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{s.label}</span>
              </div>
              <div className="text-[32px] font-bold mb-1" style={{ color: s.color }}>{s.percent}%</div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--c-progress-bg)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${s.percent}%`, background: s.color }} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: 'var(--c-muted)' }}>
                <span>{s.chapters.done}/{s.chapters.total} chapters</span>
                <span>{Math.max(0, s.chapters.total - s.chapters.done) * 6}h est.</span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Daily Study Hour Calculator ─── */}
        <div className="rounded-[18px] p-5 mb-8" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
            <span className="material-symbols-rounded text-[18px] align-text-bottom mr-1.5" style={{ color: 'var(--c-blue)' }}>calculate</span>
            Daily Study Hour Calculator
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label className="text-[11px] block mb-1" style={{ color: 'var(--c-muted)' }}>Exam Date</label>
              <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{settings.examDate}</span>
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: 'var(--c-muted)' }}>Daily Hours</label>
              <input type="number" min={1} max={16} value={dailyHoursInput}
                onChange={e => setDailyHoursInput(Math.min(16, Math.max(1, Number(e.target.value))))}
                className="w-16 px-2 py-1 text-sm rounded-[8px] outline-none" style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }} />
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: 'var(--c-muted)' }}>Rest Days/Week</label>
              <select value={restDays} onChange={e => setRestDays(Number(e.target.value))}
                className="px-2 py-1 text-sm rounded-[8px] outline-none">
                {[0, 1, 2].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Remaining Days', value: daysRemaining },
              { label: 'Study Days', value: effectiveDays },
              { label: 'Remaining Hours', value: remainingHours },
              { label: 'Required/Day', value: `${requiredDaily}h` },
              { label: 'Buffer Days', value: bufferDays },
            ].map(stat => (
              <div key={stat.label} className="text-center p-2 rounded-[12px]" style={{ background: 'var(--c-card-alt)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--c-blue)' }}>{stat.value}</div>
                <div className="text-[10px]" style={{ color: 'var(--c-caption)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Today's Suggested Goal ─── */}
        {suggestedGoal && (
          <div className="rounded-[18px] p-5 mb-8" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)',
            boxShadow: 'var(--c-shadow-hover)', borderLeft: `4px solid ${SUBJECT_INFO[suggestedGoal.subject].color}`,
          }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[18px] align-text-bottom mr-1.5" style={{ color: SUBJECT_INFO[suggestedGoal.subject].color }}>flag</span>
              Today&apos;s Suggested Goal
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span>{SUBJECT_INFO[suggestedGoal.subject].emoji}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{suggestedGoal.chapter.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--c-tag)', color: 'var(--c-muted)' }}>
                {suggestedGoal.chapter.weightage} weightage
              </span>
            </div>
            <ul className="space-y-1.5 mb-3">
              {suggestedGoal.tasks.map((task, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--c-text-secondary)' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: SUBJECT_INFO[suggestedGoal.subject].color }} />
                  {task}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--c-muted)' }}>
              <span>⏱️ Est. {suggestedGoal.estHours}h</span>
              <span>📈 +{suggestedGoal.progressGain.toFixed(1)}% progress</span>
            </div>
          </div>
        )}

        {/* ─── Insights ─── */}
        <div className="rounded-[18px] p-5 mb-8" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--c-text)' }}>
            <span className="material-symbols-rounded text-[18px] align-text-bottom mr-1.5" style={{ color: 'var(--c-orange)' }}>insights</span>
            Smart Insights
          </h2>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--c-text-secondary)' }}>
                <span className="text-[var(--c-blue)] mt-0.5">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Average Daily Performance ─── */}
        {avgPerformance && (
          <div className="rounded-[18px] p-5 mb-8" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[18px] align-text-bottom mr-1.5" style={{ color: 'var(--c-green)' }}>trending_up</span>
              Average Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-[12px] text-center" style={{ background: 'var(--c-card-alt)' }}>
                <div className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{avgPerformance.avgHours}h</div>
                <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Avg/Day</div>
              </div>
              <div className="p-3 rounded-[12px] text-center" style={{ background: 'var(--c-card-alt)' }}>
                <div className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{avgPerformance.avgWeekly}h</div>
                <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Avg/Week</div>
              </div>
              <div className="p-3 rounded-[12px] text-center" style={{ background: 'var(--c-card-alt)' }}>
                <div className={`text-xl font-bold ${avgPerformance.trend >= 0 ? 'text-[var(--c-green)]' : 'text-[var(--c-red)]'}`}>
                  {avgPerformance.trend >= 0 ? '+' : ''}{avgPerformance.trend.toFixed(1)}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Weekly Trend</div>
              </div>
              <div className="p-3 rounded-[12px] text-center" style={{ background: 'var(--c-card-alt)' }}>
                <div className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{dailyLogs.length}</div>
                <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Days Tracked</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Achievements ─── */}
        <div className="rounded-[18px] p-5 mb-8" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
            <span className="material-symbols-rounded text-[18px] align-text-bottom mr-1.5" style={{ color: 'var(--c-orange)' }}>emoji_events</span>
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map(a => (
              <div key={a.id} className="rounded-[14px] p-3 transition-all" style={{
                background: a.unlocked ? 'var(--c-card-alt)' : 'var(--c-card-alt)',
                border: `1px solid ${a.unlocked ? 'var(--c-orange)' : 'var(--c-border-card)'}`,
                opacity: a.unlocked ? 1 : 0.5,
              }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: a.unlocked ? 'var(--c-text)' : 'var(--c-muted)' }}>{a.name}</span>
                  {a.unlocked && <span className="text-[10px] ml-auto" style={{ color: 'var(--c-orange)' }}>✓</span>}
                </div>
                <p className="text-[10px] mb-2" style={{ color: 'var(--c-caption)' }}>{a.description}</p>
                <MiniProgressBar value={a.progress} max={a.target} color={a.unlocked ? 'var(--c-orange)' : 'var(--c-caption)'} />
                <div className="text-[9px] mt-1 text-right" style={{ color: 'var(--c-caption)' }}>
                  {Math.min(a.target, a.progress)}/{a.target}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Test Score Trend ─── */}
        <div className="rounded-[18px] p-5 mb-8" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
            <span className="material-symbols-rounded text-[18px] align-text-bottom mr-1.5" style={{ color: 'var(--c-blue)' }}>show_chart</span>
            Test Score Trend
          </h2>
          {chartPoints && chartPoints.length > 0 ? (
            <div className="w-full h-48 relative border-l border-b pb-5 pl-8" style={{ borderColor: 'var(--c-border-input)' }}>
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-mono pb-5" style={{ color: 'var(--c-muted)' }}>
                <span>{MAX_SCORE}</span><span>{Math.round(MAX_SCORE * 0.75)}</span><span>{Math.round(MAX_SCORE * 0.5)}</span><span>{Math.round(MAX_SCORE * 0.25)}</span><span>0</span>
              </div>
              <div className="absolute inset-0 pl-8 pb-5 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} /><div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} />
                <div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} /><div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} /><div className="w-full" />
              </div>
              <svg className="w-full h-full absolute inset-0 pl-8 pb-5 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="blueGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2383e2" stopOpacity="0.15" /><stop offset="100%" stopColor="#2383e2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`M${chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (chartPoints.length - 1)) * 100},${p.y}`).join(' ')} L100,100 L0,100Z`} fill="url(#blueGlow)" />
                <path d={chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (chartPoints.length - 1)) * 100},${p.y}`).join(' ')} fill="none" stroke="#2383e2" strokeWidth="1.5" strokeLinecap="round" />
                {chartPoints.map((p, i) => (
                  <circle key={i} cx={(i / (chartPoints.length - 1)) * 100} cy={p.y} fill="#fff" r="2" stroke="#2383e2" strokeWidth="1.5" />
                ))}
                <circle cx="100" cy={chartPoints[chartPoints.length - 1].y} fill="#2383e2" r="3" stroke="#fff" strokeWidth="1.5" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full pl-8 flex justify-between text-[10px] font-mono pt-1" style={{ color: 'var(--c-muted)' }}>
                {chartPoints.filter((_, i) => i % Math.max(1, Math.floor(chartPoints.length / 5)) === 0 || i === chartPoints.length - 1).map((p, i) => (
                  <span key={i} style={i > 0 && p === chartPoints[chartPoints.length - 1] ? { color: 'var(--c-blue)' } : {}}>{p.label}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-sm" style={{ color: 'var(--c-muted)' }}>No tests logged yet.</div>
          )}
        </div>

        {/* ─── Heatmap ─── */}
        <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--c-text)' }}>
            <span className="material-symbols-rounded text-[18px] align-text-bottom mr-1.5" style={{ color: 'var(--c-green)' }}>calendar_month</span>
            Consistency (6 months)
          </h2>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(26, 1fr)' }}>
            {heatmapData.map((d, i) => (
              <div key={i} className="aspect-square rounded-sm" style={{
                backgroundColor: d.hours === 0 ? 'var(--heat-0)' : d.hours < 2 ? 'var(--heat-1)' : d.hours < 4 ? 'var(--heat-2)' : d.hours < 7 ? 'var(--heat-3)' : 'var(--c-blue)',
              }} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: 'var(--c-muted)' }}>
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--heat-0)' }} />
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--heat-1)' }} />
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--heat-2)' }} />
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--heat-3)' }} />
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--c-blue)' }} />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
