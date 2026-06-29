'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { db } from '@/lib/db'
import syllabusData from '@/data/syllabus.json'
import { formatDate } from '@/lib/utils'
import type { Subject, DailyPlan, DailyPlanSubject, Chapter } from '@/types'

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

interface DailyPlanModalProps {
  open: boolean
  onClose: () => void
  onSave: (plan: DailyPlan) => void
  presetSubjects?: Subject[]
}

const SUBJECT_LABELS: Record<Subject, string> = { physics: 'Physics', chemistry: 'Chemistry', maths: 'Maths' }
const SUBJECT_COLORS: Record<Subject, string> = { physics: '#2383e2', chemistry: '#0f8a5e', maths: '#d9730d' }

export default function DailyPlanModal({ open, onClose, onSave, presetSubjects }: DailyPlanModalProps) {
  const [hoursGoal, setHoursGoal] = useState(8)
  const [hoursInput, setHoursInput] = useState('8')
  const [subjects, setSubjects] = useState<DailyPlanSubject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [chapterSearch, setChapterSearch] = useState('')
  const [subjectSearch, setSubjectSearch] = useState('')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const subjectInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (presetSubjects && subjects.length === 0) {
      setSubjects(presetSubjects.map(s => ({ subject: s, chapters: [], questions: 0 })))
    }
  }, [open, presetSubjects])

  const availableSubjects: Subject[] = ['physics', 'chemistry', 'maths']
  const filteredSubjects = availableSubjects.filter(s => !subjects.find(sub => sub.subject === s) && s.includes(subjectSearch))

  const chapters = selectedSubject ? getChapters(selectedSubject) : []
  const filteredChapters = chapters.filter(ch => ch.name.toLowerCase().includes(chapterSearch.toLowerCase()))

  const addSubject = (subject: Subject) => {
    setSubjects(prev => [...prev, { subject, chapters: [], questions: 0 }])
    setSelectedSubject(subject)
    setSubjectSearch('')
    setShowSubjectDropdown(false)
  }

  const removeSubject = (subject: Subject) => {
    setSubjects(prev => prev.filter(s => s.subject !== subject))
    if (selectedSubject === subject) setSelectedSubject(null)
  }

  const toggleChapter = (subject: Subject, chapterName: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.subject !== subject) return s
      const has = s.chapters.includes(chapterName)
      return { ...s, chapters: has ? s.chapters.filter(c => c !== chapterName) : [...s.chapters, chapterName] }
    }))
  }

  const setQuestions = (subject: Subject, q: number) => {
    setSubjects(prev => prev.map(s => s.subject === subject ? { ...s, questions: q } : s))
  }

  const save = async () => {
    if (subjects.length === 0) return
    const plan: DailyPlan = { date: formatDate(new Date()), hoursGoal, subjects }
    await db.dailyPlans.put(plan)
    onSave(plan)
    onClose()
  }

  const slotUsed = (subject: Subject, chapterName: string) =>
    subjects.find(s => s.subject === subject)?.chapters.includes(chapterName) || false

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto rounded-[18px] px-[26px] py-[28px]" style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <h2 className="text-[18px] font-semibold tracking-[-0.3px] mb-1" style={{ color: '#0f0f0f' }}>Plan Your Day</h2>
        <p className="text-[13px] mb-5" style={{ color: '#888' }}>Set today&apos;s study targets</p>

        <div className="mb-5">
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#888' }}>HOURS GOAL</label>
          <input type="number" min={1} max={16} value={hoursInput} onChange={e => { setHoursInput(e.target.value); const v = parseInt(e.target.value, 10); if (!isNaN(v) && v > 0) setHoursGoal(v) }}
            className="w-full max-w-[100px] px-3 py-2 text-sm outline-none rounded-[40px]"
            style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* Selected subjects */}
        {subjects.length > 0 && (
          <div className="space-y-3 mb-4">
            {subjects.map(s => (
              <div key={s.subject} className="rounded-[12px] p-3" style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#0f0f0f' }}>{SUBJECT_LABELS[s.subject]}</span>
                  <button onClick={() => removeSubject(s.subject)} className="text-[10px] font-medium hover:underline" style={{ color: '#e03e3e' }}>Remove</button>
                </div>
                <div className="mb-2">
                  <input
                    value={selectedSubject === s.subject ? chapterSearch : ''}
                    onChange={e => { setSelectedSubject(s.subject); setChapterSearch(e.target.value) }}
                    placeholder="Search chapters..."
                    className="w-full px-3 py-1.5 text-xs outline-none rounded-[40px]"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fff' }}
                    onFocus={e => { e.currentTarget.style.borderColor = SUBJECT_COLORS[s.subject]; setSelectedSubject(s.subject) }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
                  {selectedSubject === s.subject && chapterSearch && (
                    <div className="mt-1 max-h-28 overflow-y-auto rounded-[12px]" style={{ border: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
                      {filteredChapters.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => { toggleChapter(s.subject, ch.name); setChapterSearch('') }}
                          className="block w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-black/[0.02]"
                          style={{ color: '#555' }}
                        >
                          {slotUsed(s.subject, ch.name) && <span className="text-[#2383e2] mr-1">✓</span>}
                          {ch.name}
                        </button>
                      ))}
                      {filteredChapters.length === 0 && <div className="px-3 py-1.5 text-xs" style={{ color: '#aaa' }}>No matches</div>}
                    </div>
                  )}
                </div>
                {s.chapters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {s.chapters.map(ch => (
                      <span key={ch} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ background: `${SUBJECT_COLORS[s.subject]}12`, color: SUBJECT_COLORS[s.subject] }}>
                        {ch}
                        <button onClick={() => toggleChapter(s.subject, ch)} className="hover:opacity-60">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-medium" style={{ color: '#888' }}>Questions:</label>
                  <input type="number" min={0} value={s.questions} onChange={e => setQuestions(s.subject, parseInt(e.target.value, 10) || 0)}
                    className="w-16 px-2 py-1 text-xs outline-none rounded-[40px]"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fff' }}
                    onFocus={e => { e.currentTarget.style.borderColor = SUBJECT_COLORS[s.subject] }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add subject */}
        <div className="relative mb-5">
          <input
            ref={subjectInputRef}
            value={subjectSearch}
            onChange={e => { setSubjectSearch(e.target.value); setShowSubjectDropdown(true) }}
            placeholder="Add a subject..."
            className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
            style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2383e2'; setShowSubjectDropdown(true) }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; setTimeout(() => setShowSubjectDropdown(false), 200) }} />
          {showSubjectDropdown && (
            <div className="mt-1 rounded-[12px] overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {filteredSubjects.length > 0 ? filteredSubjects.map(s => (
                <button
                  key={s}
                  onMouseDown={() => addSubject(s)}
                  className="block w-full text-left px-3 py-2 text-sm transition-colors hover:bg-black/[0.02]"
                  style={{ color: '#555' }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )) : (
                <div className="px-3 py-2 text-xs" style={{ color: '#aaa' }}>All subjects added</div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose}
            className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
            style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#555' }}
          >Skip</button>
          <button onClick={save} disabled={subjects.length === 0}
            className="text-xs font-medium px-5 py-2 rounded-[40px] text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)' }}
          >Save Plan</button>
        </div>
      </div>
    </div>
  )
}
