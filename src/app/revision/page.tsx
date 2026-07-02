'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { db } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'
import syllabusData from '@/data/syllabus.json'
import type { Subject, ErrorEntry } from '@/types'

const syllabus = syllabusData as any

function getFlatChapters(subject: Subject) {
  const out: any[] = []
  for (const div of syllabus[subject].divisions) {
    for (const ch of div.chapters) {
      if (!ch.deleted) out.push(ch)
    }
  }
  return out
}

export default function RevisionPage() {
  const [errorSubject, setErrorSubject] = useState<Subject>('physics')
  const [errorChapter, setErrorChapter] = useState('')
  const [errorQuestion, setErrorQuestion] = useState('')
  const [errorReason, setErrorReason] = useState('')
  const [errorEntries, setErrorEntries] = useState<ErrorEntry[]>([])
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [showChapterDropdown, setShowChapterDropdown] = useState(false)
  const [errorWarning, setErrorWarning] = useState('')
  const subjectRef = useRef<HTMLDivElement>(null)
  const chapterRef = useRef<HTMLDivElement>(null)

  const chaptersBySubject = useMemo(() => ({
    physics: getFlatChapters('physics'),
    chemistry: getFlatChapters('chemistry'),
    maths: getFlatChapters('maths'),
  }), [])

  useEffect(() => { db.errors.toArray().then(setErrorEntries) }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target as Node)) setShowSubjectDropdown(false)
      if (chapterRef.current && !chapterRef.current.contains(e.target as Node)) setShowChapterDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Revision Hub</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Track mistakes and manage formula sheets</p>

        <div className="flex items-center gap-1 mb-6">
          <span className="px-3 py-2 text-sm border-b-2 border-[var(--c-blue)] text-[var(--c-blue)] font-medium">Error Log</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Log an Error</h2>
            <div className="space-y-3">
              <div ref={subjectRef} className="relative">
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>SUBJECT</label>
                <button onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px] text-left flex items-center justify-between"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}>
                  <span>{errorSubject.charAt(0).toUpperCase() + errorSubject.slice(1)}</span>
                  <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>▼</span>
                </button>
                {showSubjectDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-[12px] overflow-hidden shadow-lg" style={{ border: '1px solid var(--c-border)', background: 'var(--c-card)' }}>
                    {['physics', 'chemistry', 'maths'].map(s => (
                      <button key={s}
                        onMouseDown={() => { setErrorSubject(s as Subject); setErrorChapter(''); setShowSubjectDropdown(false) }}
                        className="block w-full text-left px-3 py-2 text-sm transition-colors hover:bg-black/[0.02]"
                        style={{ color: errorSubject === s ? 'var(--c-blue)' : 'var(--c-text)' }}
                      >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                    ))}
                  </div>
                )}
              </div>
              <div ref={chapterRef} className="relative">
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>CHAPTER</label>
                <button onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px] text-left flex items-center justify-between"
                  style={{ border: '1px solid var(--c-border-input)', color: errorChapter ? 'var(--c-text)' : 'var(--c-caption)', background: 'var(--c-input)' }}>
                  <span>{errorChapter ? chaptersBySubject[errorSubject].find((ch: any) => ch.id === errorChapter)?.name || 'Select chapter' : 'Select chapter'}</span>
                  <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>▼</span>
                </button>
                {showChapterDropdown && (
                  <div className="absolute z-10 mt-1 left-0 right-0 max-h-48 overflow-y-auto rounded-[12px] shadow-lg" style={{ border: '1px solid var(--c-border)', background: 'var(--c-card)' }}>
                    <button onMouseDown={() => { setErrorChapter(''); setShowChapterDropdown(false) }}
                      className="block w-full text-left px-3 py-2 text-sm transition-colors hover:bg-black/[0.02]"
                      style={{ color: 'var(--c-muted)' }}>Select chapter</button>
                    {chaptersBySubject[errorSubject].map((ch: any) => (
                      <button key={ch.id}
                        onMouseDown={() => { setErrorChapter(ch.id); setShowChapterDropdown(false) }}
                        className="block w-full text-left px-3 py-2 text-sm transition-colors hover:bg-black/[0.02]"
                        style={{ color: errorChapter === ch.id ? 'var(--c-blue)' : 'var(--c-text)' }}
                      >{ch.name}</button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>QUESTION</label>
                <textarea value={errorQuestion} onChange={e => setErrorQuestion(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[18px] resize-none h-16"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  placeholder="Describe the question..." />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>WHY WRONG</label>
                <textarea value={errorReason} onChange={e => setErrorReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[18px] resize-none h-16"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  placeholder="Formula mistake? Silly error?" />
              </div>
              {errorWarning && <p className="text-xs" style={{ color: 'var(--c-red)' }}>{errorWarning}</p>}
              <button onClick={async () => {
                if (!errorChapter || !errorQuestion) { setErrorWarning('Please select a chapter and describe the question.'); return }
                setErrorWarning('')
                const entry: ErrorEntry = { id: generateId(), date: formatDate(new Date()), subject: errorSubject, chapter: errorChapter, question: errorQuestion, reason: errorReason }
                await db.errors.add(entry)
                setErrorEntries(prev => [...prev, entry])
                setErrorChapter(''); setErrorQuestion(''); setErrorReason('')
              }} className="w-full flex items-center justify-center text-sm font-medium px-4 py-2 rounded-[40px] text-white" style={{ background: 'var(--c-btn-primary)' }}>Log Error</button>
            </div>
          </div>
          <div className="md:col-span-2 rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>Recent Errors</h2>
            </div>
            {errorEntries.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--c-muted)' }}>No errors logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {[...errorEntries].reverse().slice(0, 20).map(e => {
                  const chName = chaptersBySubject[e.subject].find((ch: any) => ch.id === e.chapter)?.name || e.chapter
                  return (
                    <div key={e.id} className="p-3 rounded-[12px]" style={{ background: 'var(--c-input)', border: '1px solid var(--c-border)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium uppercase" style={{ color: e.subject === 'physics' ? 'var(--c-blue)' : e.subject === 'chemistry' ? 'var(--c-green)' : 'var(--c-orange)' }}>{e.subject}</span>
                        <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{chName}</span>
                        <span className="text-[10px] ml-auto" style={{ color: 'var(--c-muted)' }}>{e.date}</span>
                      </div>
                      <p className="text-sm mb-0.5" style={{ color: 'var(--c-text)' }}>{e.question}</p>
                      {e.reason && <p className="text-xs" style={{ color: 'var(--c-red)' }}>{e.reason}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-[18px] p-6 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--c-muted)' }}>Need formula sheets, notes, and resources?</p>
          <Link href="/formula-vault" className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2 rounded-[40px] transition-opacity hover:opacity-90" style={{ background: 'var(--c-blue)', color: '#fff' }}>
            Open Formula Vault
          </Link>
        </div>
      </div>
    </div>
  )
}
