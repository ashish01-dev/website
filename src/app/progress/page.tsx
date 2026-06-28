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
    color: s === 'physics' ? '#2383e2' : s === 'chemistry' ? '#0f8a5e' : '#d9730d',
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

  const heatColors = ['bg-[#2f2f2f]', 'bg-[#1a3a5c]', 'bg-[#1a5c8a]', 'bg-[#2383e2]', 'bg-[#4da6ff]']

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
    <div className="min-h-screen pb-16 md:pb-0 md:pl-60">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-page-title text-notion-text-dark mb-1">Progress</h1>
            <p className="text-sm text-notion-muted-dark">Analytics and metrics</p>
          </div>
          <div className={`text-xs px-2 py-1 rounded-notion font-medium ${
            Object.values(pace.paceStatus).every(s => s === 'on_track')
              ? 'bg-[#0f8a5e]/10 text-[#0f8a5e]'
              : 'bg-[#e03e3e]/10 text-[#e03e3e]'
          }`}>
            {Object.values(pace.paceStatus).every(s => s === 'on_track') ? '● On Track' : `● ${Math.round(Object.values(pace.behindByDays).reduce((a, b) => a + b, 0) / 3)}d behind`}
          </div>
        </div>

        {/* Subject cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {subjects.map(s => (
            <div key={s.id} className="notion-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium text-notion-text-dark">{s.label}</span>
              </div>
              <div className="text-3xl font-bold text-notion-text-dark mb-1">{s.percent}%</div>
              <div className="notion-progress-bar mb-2">
                <div className="notion-progress-fill" style={{ width: `${s.percent}%`, backgroundColor: s.color }} />
              </div>
              <span className="text-xs text-notion-muted-dark">{s.chapters.done}/{s.chapters.total} chapters</span>
            </div>
          ))}
        </div>

        {/* Overall */}
        <div className="notion-card p-4 mb-6 border-[#2383e2]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-notion-text-dark">Total JEE Syllabus</span>
            <span className="text-2xl font-bold text-[#2383e2]">{overall}%</span>
          </div>
          <div className="notion-progress-bar">
            <div className="notion-progress-fill" style={{ width: `${overall}%` }} />
          </div>
        </div>

        {/* Trend chart */}
        <div className="notion-card p-4 mb-6">
          <h2 className="section-title text-notion-text-dark mb-3">Test Score Trend</h2>
          {chartPoints && chartPoints.length > 0 ? (
            <div className="w-full h-48 relative border-l border-b border-notion-border-dark pb-5 pl-8">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-notion-muted-dark font-mono pb-5">
                <span>{MAX_SCORE}</span><span>{Math.round(MAX_SCORE * 0.75)}</span><span>{Math.round(MAX_SCORE * 0.5)}</span><span>{Math.round(MAX_SCORE * 0.25)}</span><span>0</span>
              </div>
              <div className="absolute inset-0 pl-8 pb-5 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-notion-border-dark/30" />
                <div className="w-full border-t border-notion-border-dark/30" />
                <div className="w-full border-t border-notion-border-dark/30" />
                <div className="w-full border-t border-notion-border-dark/30" />
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
                  <circle key={i} cx={(i / (chartPoints.length - 1)) * 100} cy={p.y} fill="#191919" r="2" stroke="#2383e2" strokeWidth="1.5" />
                ))}
                <circle cx="100" cy={chartPoints[chartPoints.length - 1].y} fill="#2383e2" r="3" stroke="#fff" strokeWidth="1.5" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full pl-8 flex justify-between text-[10px] text-notion-muted-dark font-mono pt-1 overflow-hidden">
                {chartPoints.filter((_, i) => i % Math.max(1, Math.floor(chartPoints.length / 5)) === 0 || i === chartPoints.length - 1).map((p, i) => (
                  <span key={i} className={i > 0 && p === chartPoints[chartPoints.length - 1] ? 'text-[#2383e2] font-medium' : ''}>{p.label}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-sm text-notion-muted-dark">
              No tests logged yet. Start taking tests to see your trend.
            </div>
          )}
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subjects.map(s => (
            <div key={s.id} className="notion-card p-3 text-center">
              <div className="text-caption text-notion-muted-dark uppercase">{s.label}</div>
              <div className="text-xl font-bold text-notion-text-dark mt-0.5">{s.percent}%</div>
              <div className="text-xs text-notion-muted-dark">complete</div>
            </div>
          ))}
          <div className="notion-card p-3 text-center border-[#2383e2]/30">
            <div className="text-caption text-[#2383e2] uppercase">Total</div>
            <div className="text-xl font-bold text-[#2383e2] mt-0.5">{overall}%</div>
            <div className="text-xs text-notion-muted-dark">complete</div>
          </div>
        </div>

        {/* Consistency heatmap */}
        <div className="notion-card p-4 mt-6">
          <h2 className="section-title text-notion-text-dark mb-3">Consistency</h2>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(26, 1fr)' }}>
            {heatmapData.map((d, i) => (
              <div key={i} className={`aspect-square rounded-sm ${heatColors[heatLevel(d.hours)]}`} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-notion-muted-dark">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#2f2f2f]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#1a3a5c]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#1a5c8a]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#2383e2]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#4da6ff]" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
