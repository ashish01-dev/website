'use client'

import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { usePYQStore } from '@/store/pyqStore'
import { useProgressStore } from '@/store/progressStore'
import syllabusData from '@/data/syllabus.json'
import type { Subject, PYQAttempt } from '@/types'

const syllabus = syllabusData as unknown as { physics: { divisions: { chapters: { id: string; name: string }[] }[] }; chemistry: { divisions: { chapters: { id: string; name: string }[] }[] }; maths: { divisions: { chapters: { id: string; name: string }[] }[] } }

const SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']
const SUBJECT_META: Record<Subject, { emoji: string; color: string }> = {
  physics: { emoji: '⚡', color: 'var(--c-blue)' },
  chemistry: { emoji: '🧪', color: 'var(--c-green)' },
  maths: { emoji: '📐', color: 'var(--c-orange)' },
}

const SAMPLE_PYQS: Record<string, { question: string; options: string[]; answer: number }[]> = {
  kinematics: [
    { question: 'A car starts from rest and accelerates at 2 m/s² for 5 seconds. What distance does it cover?', options: ['10 m', '25 m', '50 m', '100 m'], answer: 1 },
    { question: 'If a ball is thrown vertically upward with velocity 20 m/s, what is the maximum height reached? (g = 10 m/s²)', options: ['10 m', '20 m', '30 m', '40 m'], answer: 1 },
  ],
  'newtons-laws-of-motion': [
    { question: 'A 5 kg object experiences a net force of 20 N. What is its acceleration?', options: ['2 m/s²', '4 m/s²', '5 m/s²', '10 m/s²'], answer: 1 },
  ],
  thermodynamics: [
    { question: 'In an isothermal process, which of the following remains constant?', options: ['Pressure', 'Volume', 'Temperature', 'Internal energy'], answer: 2 },
  ],
}

function getSampleQuestions(chapterId: string): { question: string; options: string[]; answer: number }[] {
  for (const [key, qs] of Object.entries(SAMPLE_PYQS)) {
    if (chapterId.toLowerCase().includes(key) || key.includes(chapterId)) return qs
  }
  return [
    { question: `Sample PYQ for: ${chapterId}`, options: ['Option A', 'Option B', 'Option C', 'Option D'], answer: 0 },
    { question: 'A common JEE-level problem based on this chapter.', options: ['4', '8', '12', '16'], answer: 2 },
  ]
}

export default function PYQPage() {
  const { attempts, loaded, recordAttempt, getStats } = usePYQStore()
  const { progress, loaded: progressLoaded } = useProgressStore()
  const [subject, setSubject] = useState<Subject>('physics')
  const [chapterId, setChapterId] = useState('')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const chapters = useMemo(() => {
    const all: { id: string; name: string }[] = []
    const divs = (syllabus as any)[subject].divisions
    for (const d of divs) {
      for (const ch of d.chapters) {
        if (!ch.deleted) all.push({ id: ch.id, name: ch.name })
      }
    }
    return all
  }, [subject])

  useEffect(() => {
    if (!chapterId && chapters.length > 0) setChapterId(chapters[0].id)
  }, [chapters, chapterId])

  const currentChapter = chapters.find(c => c.id === chapterId)
  const questions = currentChapter ? getSampleQuestions(chapterId) : []
  const currentQ = questions[currentIdx]
  const stats = getStats()

  const handleAnswer = (idx: number) => {
    if (showResult) return
    setSelectedAnswer(idx)
    setShowResult(true)
    if (currentQ) {
      recordAttempt({
        year: 2025,
        session: 'april',
        subject,
        chapterId,
        chapterName: currentChapter?.name || '',
        question: currentQ.question,
        options: currentQ.options,
        correctAnswer: currentQ.options[currentQ.answer],
        userAnswer: currentQ.options[idx],
        status: idx === currentQ.answer ? 'correct' : 'wrong',
      })
    }
  }

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    }
    setSelectedAnswer(null)
    setShowResult(false)
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
          <div className="flex items-center justify-between mb-6" data-tour="tour-pyq">
          <div>
            <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px]" style={{ color: 'var(--c-text)' }}>📝 PYQ Practice</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>Topic-wise & year-wise previous year questions</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--c-muted)' }}>
            <span>✅ {stats.correct}</span>
            <span>❌ {stats.wrong}</span>
            <span>🔖 {stats.bookmarked}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="rounded-[18px] px-4 py-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex gap-1.5 mb-3">
                {SUBJECTS.map(s => (
                  <button key={s} onClick={() => { setSubject(s); setChapterId(''); setCurrentIdx(0); setSelectedAnswer(null); setShowResult(false) }}
                    className={`flex-1 text-[10px] font-medium py-1.5 rounded-[40px] transition-all`}
                    style={{ background: subject === s ? SUBJECT_META[s].color : 'var(--c-tag)', color: subject === s ? '#fff' : 'var(--c-muted)' }}
                  >{SUBJECT_META[s].emoji}</button>
                ))}
              </div>
              <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
                {chapters.map(ch => (
                  <button key={ch.id} onClick={() => { setChapterId(ch.id); setCurrentIdx(0); setSelectedAnswer(null); setShowResult(false) }}
                    className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-[10px] transition-all ${chapterId === ch.id ? 'font-medium' : ''}`}
                    style={{
                      color: chapterId === ch.id ? 'var(--c-text)' : 'var(--c-text-secondary)',
                      background: chapterId === ch.id ? 'var(--c-tag)' : 'transparent',
                    }}
                  >{ch.name}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {currentQ ? (
              <div className="rounded-[18px] px-6 py-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${SUBJECT_META[subject].color}15`, color: SUBJECT_META[subject].color }}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--c-caption)' }}>{currentChapter?.name}</span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>{currentIdx + 1}/{questions.length}</span>
                </div>

                <p className="text-sm font-medium mb-4 leading-relaxed" style={{ color: 'var(--c-text)' }}>{currentQ.question}</p>

                <div className="space-y-2">
                  {currentQ.options.map((opt, idx) => {
                    let optStyle: React.CSSProperties = { border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }
                    if (showResult) {
                      if (idx === currentQ.answer) {
                        optStyle = { border: '1px solid var(--c-green)', color: 'var(--c-green)', background: 'rgba(15,138,94,0.08)' }
                      } else if (idx === selectedAnswer && idx !== currentQ.answer) {
                        optStyle = { border: '1px solid var(--c-red)', color: 'var(--c-red)', background: 'rgba(224,62,62,0.08)' }
                      } else {
                        optStyle = { border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)', opacity: 0.5 }
                      }
                    }
                    return (
                      <button key={idx} onClick={() => handleAnswer(idx)}
                        disabled={showResult}
                        className="w-full text-left text-xs px-4 py-2.5 rounded-[40px] transition-all"
                        style={optStyle}
                      >{String.fromCharCode(65 + idx)}. {opt}</button>
                    )
                  })}
                </div>

                {showResult && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: selectedAnswer === currentQ.answer ? 'var(--c-green)' : 'var(--c-red)' }}>
                      {selectedAnswer === currentQ.answer ? '✅ Correct!' : `❌ Wrong! Correct: ${currentQ.options[currentQ.answer]}`}
                    </span>
                    <button onClick={nextQuestion}
                      className="text-xs font-medium px-4 py-1.5 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]"
                      style={{ background: 'var(--c-btn-primary)' }}
                    >{currentIdx < questions.length - 1 ? 'Next →' : 'Done ✓'}</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[18px] px-6 py-12 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Select a chapter to begin practicing PYQs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
