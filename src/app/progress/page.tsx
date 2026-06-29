'use client'

import { useMemo, useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculatePace } from '@/lib/pacing'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, TestEntry, PomodoroSession } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

export default function ProgressPage() {
  const { progress, getSubjectChapters, getProgress } = useProgressStore()
  const { settings } = useSettingsStore()
  const [tests, setTests] = useState<TestEntry[]>([])
  const [sessions, setSessions] = useState<PomodoroSession[]>([])

  useEffect(() => {
    db.tests.toArray().then(setTests)
    db.pomodoro.toArray().then(setSessions)
  }, [])

  const pace = useMemo(() => calculatePace(syllabus, progress, new Date(settings.examDate), new Date(), settings.freezeDays), [progress, settings.examDate, settings.freezeDays])

  const subjects = (['physics', 'chemistry', 'maths'] as Subject[]).map(s => ({
    id: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
    chapters: getSubjectChapters(s),
    percent: getProgress(s),
    color: s === 'physics' ? 'var(--c-blue)' : s === 'chemistry' ? 'var(--c-green)' : 'var(--c-orange)',
  }))

  const overall = Math.round(subjects.reduce((a, s) => a + s.chapters.done, 0) / Math.max(1, subjects.reduce((a, s) => a + s.chapters.total, 0)) * 100)

  const heatmapData = useMemo(() => {
    const days: { hours: number }[] = []
    for (let i = 181; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = formatDate(d)
      const daySessions = sessions.filter(s => s.date === ds)
      const totalSec = daySessions.reduce((a, s) => a + s.duration, 0)
      days.push({ hours: totalSec / 3600 })
    }
    return days
  }, [sessions])

  const heatLevel = (hours: number) => {
    if (hours === 0) return 0
    if (hours < 2) return 1
    if (hours < 4) return 2
    if (hours < 7) return 3
    return 4
  }

  const sortedTests = useMemo(() => {
    return [...tests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [tests])

  const MAX_SCORE = 300
  const chartPoints = useMemo(() => {
    if (sortedTests.length === 0) return null
    const points = sortedTests.map(t => ({
      score: t.score,
      y: 100 - (t.score / MAX_SCORE) * 85,
      label: t.date.slice(5),
    }))
    return points
  }, [sortedTests])

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Progress</h1>
            <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Analytics and metrics</p>
          </div>
          <div className="text-xs px-2 py-1 rounded-[10px] font-medium" style={{
            color: Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'var(--c-green)' : 'var(--c-red)',
            background: Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'rgba(15,138,94,0.1)' : 'rgba(224,62,62,0.1)',
          }}>
            {Object.values(pace.paceStatus).every(s => s === 'on_track') ? '● On Track' : `● ${Math.round(Object.values(pace.behindByDays).reduce((a, b) => a + b, 0) / 3)}d behind`}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {subjects.map(s => (
            <div key={s.id} className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{s.label}</span>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--c-text)' }}>{s.percent}%</div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--c-progress-bg)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${s.percent}%`, backgroundColor: s.color }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{s.chapters.done}/{s.chapters.total} chapters</span>
            </div>
          ))}
        </div>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid rgba(35,131,226,0.3)', boxShadow: 'var(--c-shadow)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Total JEE Syllabus</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--c-blue)' }}>{overall}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
            <div className="h-full rounded-full bg-[var(--c-blue)] transition-all" style={{ width: `${overall}%` }} />
          </div>
        </div>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Test Score Trend</h2>
          {chartPoints && chartPoints.length > 0 ? (
            <div className="w-full h-48 relative border-l border-b pb-5 pl-8" style={{ borderColor: 'var(--c-border-input)' }}>
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-mono pb-5" style={{ color: 'var(--c-muted)' }}>
                <span>{MAX_SCORE}</span><span>{Math.round(MAX_SCORE * 0.75)}</span><span>{Math.round(MAX_SCORE * 0.5)}</span><span>{Math.round(MAX_SCORE * 0.25)}</span><span>0</span>
              </div>
              <div className="absolute inset-0 pl-8 pb-5 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} />
                <div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} />
                <div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} />
                <div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} />
                <div className="w-full" />
              </div>
              <svg className="w-full h-full absolute inset-0 pl-8 pb-5 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="blueGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2383e2" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2383e2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`M${chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (chartPoints.length - 1)) * 100},${p.y}`).join(' ').replace(/^M/, '')} L100,100 L0,100Z`} fill="url(#blueGlow)" />
                <path d={chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (chartPoints.length - 1)) * 100},${p.y}`).join(' ')} fill="none" stroke="#2383e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {chartPoints.map((p, i) => (
                  <circle key={i} cx={(i / (chartPoints.length - 1)) * 100} cy={p.y} fill="#fff" r="2" stroke="#2383e2" strokeWidth="1.5" />
                ))}
                <circle cx="100" cy={chartPoints[chartPoints.length - 1].y} fill="#2383e2" r="3" stroke="#fff" strokeWidth="1.5" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full pl-8 flex justify-between text-[10px] font-mono pt-1 overflow-hidden" style={{ color: 'var(--c-muted)' }}>
                {chartPoints.filter((_, i) => i % Math.max(1, Math.floor(chartPoints.length / 5)) === 0 || i === chartPoints.length - 1).map((p, i) => (
                  <span key={i} className={i > 0 && p === chartPoints[chartPoints.length - 1] ? 'font-medium' : ''} style={i > 0 && p === chartPoints[chartPoints.length - 1] ? { color: 'var(--c-blue)' } : undefined}>{p.label}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-sm" style={{ color: 'var(--c-muted)' }}>
              No tests logged yet. Start taking tests to see your trend.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subjects.map(s => (
            <div key={s.id} className="rounded-[18px] p-3 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>{s.label}</div>
              <div className="text-xl font-bold mt-0.5" style={{ color: 'var(--c-text)' }}>{s.percent}%</div>
              <div className="text-xs" style={{ color: 'var(--c-muted)' }}>complete</div>
            </div>
          ))}
          <div className="rounded-[18px] p-3 text-center" style={{ background: 'var(--c-card)', border: '1px solid rgba(35,131,226,0.3)', boxShadow: 'var(--c-shadow)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-blue)' }}>Total</div>
            <div className="text-xl font-bold mt-0.5" style={{ color: 'var(--c-blue)' }}>{overall}%</div>
            <div className="text-xs" style={{ color: 'var(--c-muted)' }}>complete</div>
          </div>
        </div>

        <div className="rounded-[18px] p-4 mt-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Consistency</h2>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(26, 1fr)' }}>
            {heatmapData.map((d, i) => (
              <div key={i} className="aspect-square rounded-sm" style={{
                backgroundColor: d.hours === 0 ? 'var(--heat-0)' : d.hours < 2 ? 'var(--heat-1)' : d.hours < 4 ? 'var(--heat-2)' : d.hours < 7 ? 'var(--heat-3)' : 'var(--c-blue)',
              }} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--c-muted)' }}>
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
