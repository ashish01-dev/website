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
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to top left, #F5F5F5, #F7F7F7)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: '#0f0f0f' }}>Tests</h1>
        <p className="text-sm mb-6" style={{ color: '#888' }}>Log and track your mock tests</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[18px] p-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: '#0f0f0f' }}>Log a Test</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#888' }}>DATE</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#888' }}>SUBJECTS</label>
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
                    onChange={e => { setSubjectSearch(e.target.value); setShowSubjectDropdown(true) }}
                    placeholder="Search subjects..."
                    className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#2383e2'; setShowSubjectDropdown(true) }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; setTimeout(() => setShowSubjectDropdown(false), 200) }} />
                  {showSubjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-10 w-full rounded-[10px] shadow-lg" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)' }}>
                      {ALL_SUBJECTS.filter(s => !selectedSubjects.includes(s) && s.includes(subjectSearch)).map(s => (
                        <button
                          key={s}
                          onMouseDown={() => { toggleSubject(s); setSubjectSearch('') }}
                          className="block w-full text-left px-2 py-1 text-xs capitalize hover:bg-black/[0.02]"
                          style={{ color: '#0f0f0f' }}
                        >
                          {s}
                        </button>
                      ))}
                      {ALL_SUBJECTS.filter(s => !selectedSubjects.includes(s) && s.includes(subjectSearch)).length === 0 && (
                        <div className="px-2 py-1 text-xs" style={{ color: '#888' }}>All subjects selected</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#888' }}>CHAPTERS</label>
                {selectedChapters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {selectedChapters.map(ch => (
                      <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'rgba(35,131,226,0.1)', color: '#2383e2' }}>
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
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
                {chapterSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-[10px]" style={{ border: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
                    {filteredChapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => { toggleChapter(ch.name); setChapterSearch('') }}
                        className="block w-full text-left px-2 py-1 text-xs hover:bg-black/[0.02]"
                        style={{ color: '#0f0f0f' }}
                      >
                        {ch.name}
                        {selectedChapters.includes(ch.name) && <span className="float-right text-[#2383e2]">✓</span>}
                      </button>
                    ))}
                    {filteredChapters.length === 0 && (
                      <div className="px-2 py-1 text-xs" style={{ color: '#888' }}>No matching chapters</div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#888' }}>SCORE</label>
                  <input type="number" value={formScore} onChange={e => setFormScore(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#888' }}>TOTAL</label>
                  <input type="number" value={formTotal} onChange={e => setFormTotal(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#888' }}>TIME (min)</label>
                <input type="number" value={formTime} onChange={e => setFormTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
              </div>
              <button onClick={addTest} className="w-full flex items-center justify-center text-sm font-medium px-4 py-2 rounded-[40px] text-white" style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)' }}>Log Test</button>
            </div>
          </div>

          <div className="md:col-span-2 rounded-[18px] p-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: '#0f0f0f' }}>History</h2>
            {tests.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#888' }}>No tests logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: '#888' }}>Date</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: '#888' }}>Subjects</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: '#888' }}>Score</th>
                      <th className="hidden md:table-cell text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: '#888' }}>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.slice().reverse().map(t => (
                      <tr key={t.id}>
                        <td className="text-sm p-2" style={{ color: '#0f0f0f' }}>{t.date}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {(t.subjects || [t.subject]).map(s => (
                              <span key={s} className="text-[10px] font-medium uppercase px-1 py-0.5 rounded" style={{
                                color: s === 'physics' ? '#2383e2' : s === 'chemistry' ? '#0f8a5e' : '#d9730d',
                                backgroundColor: `${s === 'physics' ? '#2383e2' : s === 'chemistry' ? '#0f8a5e' : '#d9730d'}15`
                              }}>{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="text-sm font-medium p-2" style={{ color: '#0f0f0f' }}>{t.score}/{t.total}</td>
                        <td className={`text-sm hidden md:table-cell p-2`} style={{
                          color: t.accuracy >= 80 ? '#0f8a5e' : t.accuracy >= 60 ? '#d9730d' : '#e03e3e',
                        }}>
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
