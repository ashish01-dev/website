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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="notion-card p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-notion-text-dark mb-1">Plan Your Day</h2>
        <p className="text-sm text-notion-muted-dark mb-4">Set today&apos;s study targets</p>

        <div className="mb-4">
          <label className="text-caption text-notion-muted-dark block mb-1">HOURS GOAL</label>
          <input type="number" min={1} max={16} value={hoursInput} onChange={e => { setHoursInput(e.target.value); const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setHoursGoal(v) }} className="notion-input max-w-[100px]" />
        </div>

        {/* Selected subjects */}
        {subjects.length > 0 && (
          <div className="space-y-3 mb-4">
            {subjects.map(s => (
              <div key={s.subject} className="p-3 rounded-notion bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-notion-text-dark capitalize">{s.subject}</span>
                  <button onClick={() => removeSubject(s.subject)} className="text-[10px] text-[#e03e3e] hover:underline">Remove</button>
                </div>
                <div className="mb-2">
                  <input
                    value={selectedSubject === s.subject ? chapterSearch : ''}
                    onFocus={() => setSelectedSubject(s.subject)}
                    onChange={e => { setSelectedSubject(s.subject); setChapterSearch(e.target.value) }}
                    placeholder="Search chapters..."
                    className="w-full px-2 py-1 text-xs bg-transparent border border-white/[0.08] rounded-notion text-notion-text-dark placeholder:text-notion-muted-dark outline-none focus:border-[#2383e2]"
                  />
                  {selectedSubject === s.subject && chapterSearch && (
                    <div className="mt-1 max-h-28 overflow-y-auto border border-white/[0.06] rounded-notion bg-black/30">
                      {filteredChapters.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => { toggleChapter(s.subject, ch.name); setChapterSearch('') }}
                          className="block w-full text-left px-2 py-1 text-xs text-notion-text-dark hover:bg-white/[0.06]"
                        >
                          {slotUsed(s.subject, ch.name) && <span className="text-[#2383e2] mr-1">✓</span>}
                          {ch.name}
                        </button>
                      ))}
                      {filteredChapters.length === 0 && <div className="px-2 py-1 text-xs text-notion-muted-dark">No matches</div>}
                    </div>
                  )}
                </div>
                {s.chapters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {s.chapters.map(ch => (
                      <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-[#2383e2]/10 text-[#2383e2]">
                        {ch}
                        <button onClick={() => toggleChapter(s.subject, ch)} className="hover:text-[#e03e3e]">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-notion-muted-dark">Questions:</label>
                  <input type="number" min={0} value={s.questions} onChange={e => setQuestions(s.subject, parseInt(e.target.value) || 0)} className="w-16 px-1.5 py-0.5 text-xs bg-transparent border border-white/[0.08] rounded-notion text-notion-text-dark outline-none focus:border-[#2383e2]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add subject button */}
        <div className="relative mb-4">
          <input
            ref={subjectInputRef}
            value={subjectSearch}
            onFocus={() => setShowSubjectDropdown(true)}
            onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
            onChange={e => { setSubjectSearch(e.target.value); setShowSubjectDropdown(true) }}
            placeholder="Add a subject..."
            className="w-full px-2 py-1.5 text-sm bg-transparent border border-white/[0.08] rounded-notion text-notion-text-dark placeholder:text-notion-muted-dark outline-none focus:border-[#2383e2]"
          />
          {showSubjectDropdown && (
            <div className="mt-1 border border-white/[0.06] rounded-notion bg-black/30 overflow-hidden">
              {filteredSubjects.length > 0 ? filteredSubjects.map(s => (
                <button
                  key={s}
                  onMouseDown={() => addSubject(s)}
                  className="block w-full text-left px-2 py-1.5 text-sm text-notion-text-dark hover:bg-white/[0.06] capitalize"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )) : (
                <div className="px-2 py-1 text-xs text-notion-muted-dark">All subjects added</div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="notion-btn-glass text-xs">Skip</button>
          <button onClick={save} disabled={subjects.length === 0} className="notion-btn-primary text-xs">Save Plan</button>
        </div>
      </div>
    </div>
  )
}
