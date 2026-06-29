'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ConfettiOverlay from '@/components/ConfettiOverlay'
import { db } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'
import syllabusData from '@/data/syllabus.json'
import type { TestEntry, Subject, Chapter } from '@/types'

const syllabus = syllabusData as unknown as { [key in Subject]: { divisions: { chapters: Chapter[] }[] } }

function getFlatChapters(subject: Subject): Chapter[] {
  const out: Chapter[] = []
  for (const div of syllabus[subject].divisions) {
    for (const ch of div.chapters) {
      if (!ch.deleted) out.push(ch)
    }
  }
  return out
}

const ALL_SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']

export default function TestsPage() {
  const { settings } = useSettingsStore()
  const [tests, setTests] = useState<TestEntry[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [formDate, setFormDate] = useState(formatDate(new Date()))
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [subjectSearch, setSubjectSearch] = useState('')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [chapterSearch, setChapterSearch] = useState('')
  const [formScore, setFormScore] = useState('')
  const [formTotal, setFormTotal] = useState('50')
  const [formTime, setFormTime] = useState('')

  const activeSubjects = selectedSubjects.length > 0 ? selectedSubjects : ['physics' as Subject]

  const allChapters = useMemo(() => {
    const chs: Chapter[] = []
    for (const sub of activeSubjects) {
      chs.push(...getFlatChapters(sub))
    }
    return chs
  }, [activeSubjects])

  const filteredChapters = allChapters.filter(ch => ch.name.toLowerCase().includes(chapterSearch.toLowerCase()))

  useEffect(() => { db.tests.toArray().then(setTests) }, [])

  const toggleSubject = (s: Subject) => {
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const toggleChapter = (name: string) => {
    setSelectedChapters(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    )
  }

  const addTest = async () => {
    if (!formScore || !formTotal || selectedChapters.length === 0) return
    const primary = selectedSubjects[0] || 'physics'
    const entry: TestEntry = {
      id: generateId(), date: formDate, subject: primary,
      subjects: selectedSubjects.length > 0 ? [...selectedSubjects] : undefined,
      chapters: [...selectedChapters],
      score: parseInt(formScore, 10), total: parseInt(formTotal, 10),
      accuracy: Math.round((parseInt(formScore, 10) / parseInt(formTotal, 10)) * 100),
      timeTaken: formTime ? parseInt(formTime, 10) : undefined,
    }
    await db.tests.add(entry)
    setTests(prev => [...prev, entry])
    setFormScore(''); setFormTime('')
    setSelectedChapters([]); setChapterSearch('')
    setSelectedSubjects([])
    if (entry.accuracy >= 80) setShowConfetti(true)
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-page-title text-notion-text-dark mb-1">Tests</h1>
        <p className="text-sm text-notion-muted-dark mb-6">Log and track your mock tests</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="notion-card p-4">
            <h2 className="section-title text-notion-text-dark mb-4">Log a Test</h2>
            <div className="space-y-3">
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">DATE</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="notion-input" />
              </div>
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">SUBJECTS</label>
                {selectedSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {selectedSubjects.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded text-white" style={{ backgroundColor: s === 'physics' ? '#2383e2' : s === 'chemistry' ? '#0f8a5e' : '#d9730d' }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                        <button onClick={() => toggleSubject(s)} className="hover:opacity-70">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    value={subjectSearch}
                    onFocus={() => setShowSubjectDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                    onChange={e => { setSubjectSearch(e.target.value); setShowSubjectDropdown(true) }}
                    placeholder="Search subjects..."
                    className="notion-input"
                  />
                  {showSubjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-10 w-full bg-notion-bg-dark border border-notion-border-dark rounded-notion shadow-lg">
                      {ALL_SUBJECTS.filter(s => !selectedSubjects.includes(s) && s.includes(subjectSearch)).map(s => (
                        <button
                          key={s}
                          onMouseDown={() => { toggleSubject(s); setSubjectSearch('') }}
                          className="block w-full text-left px-2 py-1 text-xs text-notion-text-dark hover:bg-notion-sidebar-hover-dark capitalize"
                        >
                          {s}
                        </button>
                      ))}
                      {ALL_SUBJECTS.filter(s => !selectedSubjects.includes(s) && s.includes(subjectSearch)).length === 0 && (
                        <div className="px-2 py-1 text-xs text-notion-muted-dark">All subjects selected</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">CHAPTERS</label>
                {selectedChapters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {selectedChapters.map(ch => (
                      <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-[#2383e2]/10 text-[#2383e2]">
                        {ch}
                        <button onClick={() => toggleChapter(ch)} className="hover:text-[#e03e3e]">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={chapterSearch}
                  onChange={e => setChapterSearch(e.target.value)}
                  placeholder="Search and select chapters..."
                  className="notion-input"
                />
                {chapterSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto border border-notion-border-dark rounded-notion bg-notion-bg-dark">
                    {filteredChapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => { toggleChapter(ch.name); setChapterSearch('') }}
                        className="block w-full text-left px-2 py-1 text-xs text-notion-text-dark hover:bg-notion-sidebar-hover-dark"
                      >
                        {ch.name}
                        {selectedChapters.includes(ch.name) && <span className="float-right text-[#2383e2]">✓</span>}
                      </button>
                    ))}
                    {filteredChapters.length === 0 && (
                      <div className="px-2 py-1 text-xs text-notion-muted-dark">No matching chapters</div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-caption text-notion-muted-dark block mb-1">SCORE</label>
                  <input type="number" value={formScore} onChange={e => setFormScore(e.target.value)} className="notion-input" />
                </div>
                <div>
                  <label className="text-caption text-notion-muted-dark block mb-1">TOTAL</label>
                  <input type="number" value={formTotal} onChange={e => setFormTotal(e.target.value)} className="notion-input" />
                </div>
              </div>
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">TIME (min)</label>
                <input type="number" value={formTime} onChange={e => setFormTime(e.target.value)} className="notion-input" />
              </div>
              <button onClick={addTest} className="notion-btn-primary w-full justify-center text-sm">Log Test</button>
            </div>
          </div>

          <div className="md:col-span-2 notion-card p-4">
            <h2 className="section-title text-notion-text-dark mb-4">History</h2>
            {tests.length === 0 ? (
              <p className="text-sm text-notion-muted-dark text-center py-8">No tests logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="notion-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subjects</th>
                      <th>Score</th>
                      <th className="hidden md:table-cell">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.slice().reverse().map(t => (
                      <tr key={t.id}>
                        <td className="text-sm">{t.date}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {(t.subjects || [t.subject]).map(s => (
                              <span key={s} className="text-[10px] font-medium uppercase px-1 py-0.5 rounded" style={{
                                color: s === 'physics' ? '#2383e2' : s === 'chemistry' ? '#0f8a5e' : '#d9730d',
                                backgroundColor: `${s === 'physics' ? '#2383e2' : s === 'chemistry' ? '#0f8a5e' : '#d9730d'}15`
                              }}>{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="text-sm font-medium">{t.score}/{t.total}</td>
                        <td className={`text-sm hidden md:table-cell ${t.accuracy >= 80 ? 'text-[#0f8a5e]' : t.accuracy >= 60 ? 'text-[#d9730d]' : 'text-[#e03e3e]'}`}>
                          {t.accuracy}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfettiOverlay fire={showConfetti} message={`Well done ${settings.name || 'champ'}!`} onDone={() => setShowConfetti(false)} />
    </div>
  )
}
