'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { useGamificationStore } from '@/store/gamificationStore'
import type { Subject } from '@/types'

const SUBJECTS: { value: Subject | ''; label: string; emoji: string }[] = [
  { value: '', label: 'General', emoji: '📚' },
  { value: 'physics', label: 'Physics', emoji: '⚡' },
  { value: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { value: 'maths', label: 'Maths', emoji: '📐' },
]

export default function StudyTimer() {
  const [mode, setMode] = useState<'idle' | 'focus' | 'break'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [subject, setSubject] = useState<Subject | ''>('')
  const [expanded, setExpanded] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<number>(0)
  const { recordStudy } = useGamificationStore()

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const startTimer = (isFocus: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setMode(isFocus ? 'focus' : 'break')
    setSeconds(isFocus ? focusMinutes * 60 : breakMinutes * 60)
    startRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          if (isFocus) {
            const elapsed = Math.round((Date.now() - startRef.current) / 60000)
            const today = formatDate(new Date())

            const existing = db.dailyLogs.get(today).then(log => {
              const updated = {
                date: today,
                studyMinutes: (log?.studyMinutes || 0) + elapsed,
                chaptersCompleted: log?.chaptersCompleted || [],
                questionsAttempted: log?.questionsAttempted || 0,
                pomodoroSessions: (log?.pomodoroSessions || 0) + 1,
              }
              db.dailyLogs.put(updated)
            })

            db.studySessions.add({
              id: `ss_${Date.now()}`,
              date: today,
              startTime: startRef.current,
              duration: elapsed,
              subject: (subject || 'physics') as Subject,
              type: 'practice',
            })

            recordStudy(elapsed, subject || undefined)
            setMode('idle')
            setSeconds(0)
          } else {
            setMode('idle')
            setSeconds(0)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    if (mode === 'focus') {
      const elapsed = Math.round((Date.now() - startRef.current) / 60000)
      if (elapsed > 0) {
        const today = formatDate(new Date())
        db.dailyLogs.get(today).then(log => {
          db.dailyLogs.put({
            date: today,
            studyMinutes: (log?.studyMinutes || 0) + elapsed,
            chaptersCompleted: log?.chaptersCompleted || [],
            questionsAttempted: log?.questionsAttempted || 0,
            pomodoroSessions: (log?.pomodoroSessions || 0) + 1,
          })
        })
        db.studySessions.add({
          id: `ss_${Date.now()}`,
          date: today,
          startTime: startRef.current,
          duration: elapsed,
          subject: (subject || 'physics') as Subject,
          type: 'practice',
        })
        recordStudy(elapsed, subject || undefined)
      }
    }
    setMode('idle')
    setSeconds(0)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const totalFocusSeconds = focusMinutes * 60

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!expanded ? (
        <button onClick={() => setExpanded(true)}
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: mode === 'focus' ? 'var(--c-green)' : mode === 'break' ? 'var(--c-orange)' : 'var(--c-blue)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      ) : (
        <div className="rounded-[18px] p-4 w-[260px] shadow-xl" style={{
          background: 'var(--c-card)',
          border: '1px solid var(--c-border-card)',
        }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--c-text)' }}>
              {mode === 'focus' ? '🔴 Focus' : mode === 'break' ? '🟢 Break' : '⏱️ Study Timer'}
            </span>
            <button onClick={() => { stopTimer(); setExpanded(false) }}
              className="text-[16px] leading-none" style={{ color: 'var(--c-muted)' }}>✕</button>
          </div>

          {mode === 'idle' && (
            <>
              <div className="flex gap-2 mb-3">
                {SUBJECTS.map(s => (
                  <button key={s.value} onClick={() => setSubject(s.value as Subject | '')}
                    className="text-[10px] px-2 py-1 rounded-[40px] transition-all"
                    style={{
                      background: subject === s.value ? 'var(--c-blue)' : 'var(--c-tag)',
                      color: subject === s.value ? '#fff' : 'var(--c-muted)',
                    }}
                  >{s.emoji}</button>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-[9px] font-semibold uppercase block mb-0.5" style={{ color: 'var(--c-caption)' }}>Focus</label>
                  <input type="number" min={1} max={120} value={focusMinutes} onChange={e => setFocusMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-[40px] outline-none"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }} />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-semibold uppercase block mb-0.5" style={{ color: 'var(--c-caption)' }}>Break</label>
                  <input type="number" min={1} max={30} value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-[40px] outline-none"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }} />
                </div>
              </div>
              <button onClick={() => startTimer(true)}
                className="w-full text-xs font-medium py-2 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]"
                style={{ background: 'var(--c-btn-primary)' }}
              >Start Focus</button>
            </>
          )}

          {mode !== 'idle' && (
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--c-text)' }}>
                {formatTime(seconds)}
              </div>
              {mode === 'focus' && (
                <div className="w-full h-1 rounded-full mb-3 overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{
                    width: `${((totalFocusSeconds - seconds) / totalFocusSeconds) * 100}%`,
                    background: 'var(--c-green)',
                  }} />
                </div>
              )}
              <button onClick={stopTimer}
                className="text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}
              >{mode === 'focus' ? 'Stop' : 'Skip'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
