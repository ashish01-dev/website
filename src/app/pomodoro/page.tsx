'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { db } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'
import type { PomodoroSession } from '@/types'

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(formatDate(d))
  }
  return days
}

export default function PomodoroPage() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const startTsRef = useRef<number>(0)
  const pauseOffsetRef = useRef<number>(0)

  const today = formatDate(new Date())

  useEffect(() => {
    db.pomodoro.toArray().then(setSessions)
  }, [])

  useEffect(() => {
    if (!running) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [running])

  const tick = useCallback(() => {
    setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000) + pauseOffsetRef.current)
  }, [])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const startSession = useCallback(() => {
    stopTimer()
    startTimeRef.current = Date.now()
    startTsRef.current = Date.now()
    pauseOffsetRef.current = 0
    setElapsed(0)
    setRunning(true)
    setPaused(false)
    intervalRef.current = setInterval(tick, 200)
  }, [stopTimer, tick])

  const pauseSession = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    pauseOffsetRef.current += Math.floor((Date.now() - startTsRef.current) / 1000)
    startTsRef.current = Date.now()
    setPaused(true)
  }, [])

  const resumeSession = useCallback(() => {
    startTsRef.current = Date.now()
    setPaused(false)
    intervalRef.current = setInterval(tick, 200)
  }, [tick])

  const endSession = useCallback(async () => {
    stopTimer()
    const totalElapsed = Math.floor((Date.now() - startTsRef.current) / 1000) + pauseOffsetRef.current
    if (totalElapsed < 5) { setRunning(false); setPaused(false); setElapsed(0); return }
    const session: PomodoroSession = {
      id: generateId(),
      date: today,
      start: startTimeRef.current || Date.now(),
      end: Date.now(),
      duration: totalElapsed,
      completed: true,
    }
    await db.pomodoro.add(session)

    const existing = await db.dailyLogs.get(today)
    await db.dailyLogs.put({
      date: today,
      studyMinutes: (existing?.studyMinutes || 0) + Math.floor(totalElapsed / 60),
      chaptersCompleted: existing?.chaptersCompleted || [],
      questionsAttempted: existing?.questionsAttempted || 0,
      pomodoroSessions: (existing?.pomodoroSessions || 0) + 1,
    })

    setSessions(prev => [...prev, session])
    setRunning(false)
    setPaused(false)
    setElapsed(0)
    startTimeRef.current = null
    startTsRef.current = 0
    pauseOffsetRef.current = 0
  }, [stopTimer, today])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  const weekDays = useMemo(() => getLast7Days(), [])
  const weekData = useMemo(() => {
    return weekDays.map(date => {
      const daySessions = sessions.filter(s => s.date === date)
      const totalSeconds = daySessions.reduce((a, s) => a + s.duration, 0)
      const hours = totalSeconds / 3600
      return { date, hours, label: new Date(date).toLocaleDateString('en', { weekday: 'short' }) }
    })
  }, [sessions, weekDays])

  const todayTotal = useMemo(() => {
    const daySessions = sessions.filter(s => s.date === today)
    return daySessions.reduce((a, s) => a + s.duration, 0)
  }, [sessions, today])

  const maxHours = useMemo(() => Math.max(1, ...weekData.map(d => d.hours)), [weekData])
  const avgHours = useMemo(() => weekData.reduce((a, d) => a + d.hours, 0) / 7, [weekData])

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[700px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Pomodoro</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Study timer with session tracking</p>

        <div className="rounded-[18px] p-8 mb-6 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="text-6xl font-mono font-bold mb-6 tabular-nums tracking-wider" style={{ color: 'var(--c-text)' }}>
            {fmt(elapsed)}
          </div>
          <div className="flex items-center justify-center gap-3">
            {!running && !paused && (
              <button onClick={startSession} className="text-sm font-medium px-6 py-2 rounded-[40px] text-white" style={{ background: 'var(--c-btn-primary)' }}>Start</button>
            )}
            {running && !paused && (
              <button onClick={pauseSession} className="text-sm font-medium px-4 py-2 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>Pause</button>
            )}
            {running && paused && (
              <button onClick={resumeSession} className="text-sm font-medium px-6 py-2 rounded-[40px] text-white" style={{ background: 'var(--c-btn-primary)' }}>Continue</button>
            )}
            {running && (
              <button onClick={endSession} className="text-sm font-medium px-4 py-2 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}>Stop & Log</button>
            )}
          </div>
        </div>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--c-muted)' }}>Today&apos;s study time</span>
            <span className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{fmt(todayTotal)}</span>
          </div>
        </div>

        <div className="rounded-[18px] p-4 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Last 7 Days</h2>
          <div className="flex items-end gap-2 h-32 mb-2">
            {weekData.map(d => {
              const pct = maxHours > 0 ? (d.hours / maxHours) * 100 : 0
              const isToday = d.date === today
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-mono" style={{ color: 'var(--c-muted)' }}>{d.hours.toFixed(1)}h</span>
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${Math.max(pct, 3)}%`,
                      backgroundColor: isToday ? 'var(--c-blue)' : 'rgba(35,131,226,0.5)',
                    }}
                  />
                  <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{d.label}</span>
                </div>
              )
            })}
          </div>
          <div className="text-center text-xs pt-2 border-t" style={{ color: 'var(--c-muted)', borderColor: 'var(--c-border)' }}>
            Average: <span className="font-medium" style={{ color: 'var(--c-text)' }}>{avgHours.toFixed(1)}h</span> / day
          </div>
        </div>

        <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Recent Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--c-muted)' }}>No sessions logged yet. Start the timer above!</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {[...sessions].reverse().slice(0, 20).map(s => (
                <div key={s.id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-black/[0.02]">
                  <div className="text-xs" style={{ color: 'var(--c-muted)' }}>
                    {new Date(s.start).toLocaleDateString('en', { month: 'short', day: 'numeric' })} &middot; {fmtTime(s.start)} &rarr; {fmtTime(s.end || s.start)}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>{fmt(s.duration)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
