'use client'

import { useState, useEffect, useMemo } from 'react'
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

  const chapters = useMemo(() => getChapters(subject), [subject])
  const filteredChapters = chapters.filter(ch => ch.name.toLowerCase().includes(chapterSearch.toLowerCase()))

  useEffect(() => { db.questions.toArray().then(setEntries) }, [])

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
    <div className="min-h-screen pb-[100px] md:pb-[90px]">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-page-title text-notion-text-dark mb-1">Questions</h1>
        <p className="text-sm text-notion-muted-dark mb-6">Log questions practiced per chapter</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logger */}
          <div className="notion-card p-4">
            <h2 className="section-title text-notion-text-dark mb-4">Log Questions</h2>
            <div className="space-y-3">
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">SUBJECT</label>
                <select value={subject} onChange={e => { setSubject(e.target.value as Subject); setChapter(''); setChapterSearch('') }} className="notion-input">
                  {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">CHAPTER</label>
                <input
                  value={chapterSearch}
                  onChange={e => setChapterSearch(e.target.value)}
                  onFocus={() => setChapterSearch(chapterSearch || ' ')}
                  placeholder="Search chapter..."
                  className="notion-input"
                />
                {chapterSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto border border-white/[0.06] rounded-notion bg-black/30">
                    {filteredChapters.map(ch => (
                      <button
                        key={ch.id}
                        onMouseDown={() => { setChapter(ch.name); setChapterSearch('') }}
                        className="block w-full text-left px-2 py-1 text-xs text-notion-text-dark hover:bg-white/[0.06]"
                      >
                        {ch.name}
                        {chapter === ch.name && <span className="float-right text-[#2383e2]">✓</span>}
                      </button>
                    ))}
                    {filteredChapters.length === 0 && <div className="px-2 py-1 text-xs text-notion-muted-dark">No matches</div>}
                  </div>
                )}
                {chapter && !chapterSearch && (
                  <div className="mt-1 px-2 py-1 text-xs text-[#2383e2] bg-[#2383e2]/10 rounded-notion">{chapter}</div>
                )}
              </div>
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">QUESTIONS DONE</label>
                <input type="number" min={0} value={count || ''} onChange={e => setCount(parseInt(e.target.value, 10) || 0)} placeholder="0" className="notion-input max-w-[120px]" />
              </div>
              <button onClick={addEntry} disabled={!chapter || count <= 0} className="notion-btn-primary w-full justify-center text-sm">Log</button>
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-2 space-y-4">
            {/* Per-subject / per-chapter breakdown */}
            <div className="notion-card p-4">
              <h2 className="section-title text-notion-text-dark mb-4">Breakdown</h2>
              {entries.length === 0 ? (
                <p className="text-sm text-notion-muted-dark text-center py-6">No questions logged yet.</p>
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
                          className="flex items-center justify-between w-full px-3 py-2 rounded-notion hover:bg-white/[0.04] text-left"
                        >
                          <span className="text-sm font-medium text-notion-text-dark capitalize">{s}</span>
                          <span className="text-xs text-notion-muted-dark">{subjTotal} questions {isOpen ? '▲' : '▼'}</span>
                        </button>
                        {isOpen && (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {Object.entries(chapters).map(([ch, ct]) => {
                              const isChOpen = expandedChapter === ch
                              return (
                                <div key={ch}>
                                  <button
                                    onClick={() => setExpandedChapter(isChOpen ? null : ch)}
                                    className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-white/[0.03] text-left"
                                  >
                                    <span className="text-xs text-notion-text-dark">{ch}</span>
                                    <span className="text-xs text-notion-muted-dark">{ct} {isChOpen ? '▲' : '▼'}</span>
                                  </button>
                                  {isChOpen && (
                                    <div className="ml-4 mt-0.5 space-y-0.5">
                                      {entries.filter(e => e.subject === s && e.chapter === ch).map(e => (
                                        <div key={e.id} className="flex items-center justify-between px-2 py-0.5">
                                          <span className="text-[10px] text-notion-muted-dark">{e.date}</span>
                                          <span className="text-[10px] text-notion-text-dark">{e.count}</span>
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

            {/* Master totals */}
            <div className="notion-card p-4">
              <h2 className="section-title text-notion-text-dark mb-4">Master Totals</h2>
              <div className="space-y-2">
                {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                  <div key={s} className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm capitalize text-notion-text-dark">{s}</span>
                    <span className="text-sm font-medium text-notion-text-dark">{totals.perSubj[s] || 0}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-2 py-2 mt-1 border-t border-white/[0.06]">
                  <span className="text-sm font-bold text-notion-text-dark">Total</span>
                  <span className="text-sm font-bold text-[#2383e2]">{totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
