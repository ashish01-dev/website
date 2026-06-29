'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { db } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'
import syllabusData from '@/data/syllabus.json'
import type { Subject, QuestionsEntry, Chapter } from '@/types'

const syllabus = syllabusData as unknown as { [key in Subject]: { divisions: { chapters: Chapter[] }[] } }

function getChapters(subject: Subject): Chapter[] {
  const out: Chapter[] = []
  for (const div of syllabus[subject].divisions) {
    for (const ch of div.chapters) {
      if (!ch.deleted) out.push(ch)
    }
  }
  return out
}

export default function QuestionsPage() {
  const [entries, setEntries] = useState<QuestionsEntry[]>([])
  const [subject, setSubject] = useState<Subject>('physics')
  const [chapter, setChapter] = useState('')
  const [chapterSearch, setChapterSearch] = useState('')
  const [count, setCount] = useState(0)
  const [expandedSubj, setExpandedSubj] = useState<Subject | null>(null)
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const subjectRef = useRef<HTMLDivElement>(null)

  const chapters = useMemo(() => getChapters(subject), [subject])
  const filteredChapters = chapters.filter(ch => ch.name.toLowerCase().includes(chapterSearch.toLowerCase()))

  useEffect(() => { db.questions.toArray().then(setEntries) }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target as Node)) setShowSubjectDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addEntry = async () => {
    if (!chapter || count <= 0) return
    const entry: QuestionsEntry = {
      id: generateId(),
      date: formatDate(new Date()),
      subject,
      chapter,
      count,
      correct: 0,
    }
    await db.questions.add(entry)
    setEntries(prev => [...prev, entry])
    setChapter('')
    setChapterSearch('')
    setCount(0)
  }

  const perChapter = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    for (const e of entries) {
      if (!map[e.subject]) map[e.subject] = {}
      map[e.subject][e.chapter] = (map[e.subject][e.chapter] || 0) + e.count
    }
    return map
  }, [entries])

  const totals = useMemo(() => {
    const perSubj: Record<string, number> = {}
    let total = 0
    for (const e of entries) {
      perSubj[e.subject] = (perSubj[e.subject] || 0) + e.count
      total += e.count
    }
    return { perSubj, total }
  }, [entries])

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Questions</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Log questions practiced per chapter</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Log Questions</h2>
            <div className="space-y-3">
              <div ref={subjectRef} className="relative">
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>SUBJECT</label>
                <button onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px] text-left flex items-center justify-between overflow-hidden"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}>
                  <span>{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                  <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>▼</span>
                </button>
                {showSubjectDropdown && (
                  <div className="absolute z-10 mt-1 left-0 right-0 rounded-[12px] overflow-hidden" style={{ border: '1px solid var(--c-border)', background: 'var(--c-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                    {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                      <button key={s}
                        onMouseDown={() => { setSubject(s); setChapter(''); setChapterSearch(''); setShowSubjectDropdown(false) }}
                        className="block w-full text-left px-3 py-2 text-sm transition-colors hover:bg-black/[0.02]"
                        style={{ color: subject === s ? 'var(--c-blue)' : 'var(--c-text)' }}
                      >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>CHAPTER</label>
                <input
                  value={chapterSearch}
                  onChange={e => setChapterSearch(e.target.value)}
                  placeholder="Search chapter..."
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)'; setChapterSearch(chapterSearch || ' ') }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
                />
                {chapterSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-[10px]" style={{ border: '1px solid var(--c-border)', background: 'var(--c-card)' }}>
                    {filteredChapters.map(ch => (
                      <button
                        key={ch.id}
                        onMouseDown={() => { setChapter(ch.name); setChapterSearch('') }}
                        className="block w-full text-left px-2 py-1 text-xs hover:bg-black/[0.02]"
                        style={{ color: 'var(--c-text)' }}
                      >
                        {ch.name}
                        {chapter === ch.name && <span className="float-right text-[var(--c-blue)]">✓</span>}
                      </button>
                    ))}
                    {filteredChapters.length === 0 && <div className="px-2 py-1 text-xs" style={{ color: 'var(--c-muted)' }}>No matches</div>}
                  </div>
                )}
                {chapter && !chapterSearch && (
                  <div className="mt-1 px-2 py-1 text-xs rounded-[10px]" style={{ color: 'var(--c-blue)', background: 'rgba(35,131,226,0.1)' }}>{chapter}</div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>QUESTIONS DONE</label>
                <input type="number" min={0} value={count || ''} onChange={e => setCount(parseInt(e.target.value, 10) || 0)} placeholder="0"
                  className="w-full max-w-[120px] px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
              </div>
              <button onClick={addEntry} disabled={!chapter || count <= 0}
                className="w-full flex items-center justify-center text-sm font-medium px-4 py-2 rounded-[40px] text-white disabled:opacity-40"
                style={{ background: 'var(--c-btn-primary)' }}>Log</button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Breakdown</h2>
              {entries.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--c-muted)' }}>No questions logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => {
                    const chapters = perChapter[s]
                    if (!chapters || Object.keys(chapters).length === 0) return null
                    const subjTotal = Object.values(chapters).reduce((a, b) => a + b, 0)
                    const isOpen = expandedSubj === s
                    return (
                      <div key={s}>
                        <button
                          onClick={() => setExpandedSubj(isOpen ? null : s)}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-[10px] hover:bg-black/[0.02] text-left"
                        >
                          <span className="text-sm font-medium capitalize" style={{ color: 'var(--c-text)' }}>{s}</span>
                          <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{subjTotal} questions {isOpen ? '▲' : '▼'}</span>
                        </button>
                        {isOpen && (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {Object.entries(chapters).map(([ch, ct]) => {
                              const isChOpen = expandedChapter === ch
                              return (
                                <div key={ch}>
                                  <button
                                    onClick={() => setExpandedChapter(isChOpen ? null : ch)}
                                    className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-black/[0.02] text-left"
                                  >
                                    <span className="text-xs" style={{ color: 'var(--c-text)' }}>{ch}</span>
                                    <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{ct} {isChOpen ? '▲' : '▼'}</span>
                                  </button>
                                  {isChOpen && (
                                    <div className="ml-4 mt-0.5 space-y-0.5">
                                      {entries.filter(e => e.subject === s && e.chapter === ch).map(e => (
                                        <div key={e.id} className="flex items-center justify-between px-2 py-0.5">
                                          <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{e.date}</span>
                                          <span className="text-[10px]" style={{ color: 'var(--c-text)' }}>{e.count}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Master Totals</h2>
              <div className="space-y-2">
                {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                  <div key={s} className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm capitalize" style={{ color: 'var(--c-text)' }}>{s}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{totals.perSubj[s] || 0}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-2 py-2 mt-1 border-t" style={{ borderColor: 'var(--c-border)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>Total</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--c-blue)' }}>{totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
