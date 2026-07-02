'use client'

import { useEffect, useState, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useBacklogStore } from '@/store/backlogStore'
import { useProgressStore } from '@/store/progressStore'
import syllabusData from '@/data/syllabus.json'
import type { Subject } from '@/types'

const syllabus = syllabusData as unknown as { physics: { divisions: { chapters: { id: string; name: string }[] }[] }; chemistry: { divisions: { chapters: { id: string; name: string }[] }[] }; maths: { divisions: { chapters: { id: string; name: string }[] }[] } }

const SUBJECT_META: Record<Subject, { emoji: string; color: string }> = {
  physics: { emoji: '⚡', color: 'var(--c-blue)' },
  chemistry: { emoji: '🧪', color: 'var(--c-green)' },
  maths: { emoji: '📐', color: 'var(--c-orange)' },
}

const BACKLOG_TYPES = [
  { value: 'theory' as const, label: 'Theory', emoji: '📖' },
  { value: 'pyq' as const, label: 'PYQs', emoji: '📝' },
  { value: 'dpp' as const, label: 'DPP', emoji: '📋' },
  { value: 'revision' as const, label: 'Revision', emoji: '🔄' },
]

export default function BacklogPage() {
  const { items, loaded, load, add, clear, remove } = useBacklogStore()
  const { progress, loaded: progressLoaded } = useProgressStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newSubject, setNewSubject] = useState<Subject>('physics')
  const [newChapter, setNewChapter] = useState('')
  const [newType, setNewType] = useState<'theory' | 'pyq' | 'dpp' | 'revision'>('theory')
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => { load() }, [load])

  const chapters = useMemo(() => {
    const all: { id: string; name: string }[] = []
    const divs = (syllabus as any)[newSubject].divisions
    for (const d of divs) {
      for (const ch of d.chapters) {
        if (!ch.deleted) all.push(ch)
      }
    }
    return all
  }, [newSubject])

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      if (filterSubject !== 'all' && i.subject !== filterSubject) return false
      if (filterType !== 'all' && i.type !== filterType) return false
      return true
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [items, filterSubject, filterType])

  const pendingCount = items.filter(i => !i.clearedAt).length
  const dueToday = items.filter(i => !i.clearedAt && i.dueDate <= new Date().toISOString().slice(0, 10)).length

  const handleAdd = async () => {
    if (!newChapter) return
    const ch = chapters.find(c => c.id === newChapter)
    await add({
      chapterId: newChapter,
      chapterName: ch?.name || newChapter,
      subject: newSubject,
      type: newType,
      dueDate: new Date().toISOString().slice(0, 10),
    })
    setShowAdd(false)
    setNewChapter('')
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px]" style={{ color: 'var(--c-text)' }}>📋 Backlog Tracker</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>
              {pendingCount} pending {dueToday > 0 && `· ${dueToday} due today`}
            </p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]"
            style={{ background: 'var(--c-btn-primary)' }}
          >+ Add Backlog</button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex gap-1 p-0.5 rounded-[12px]" style={{ background: 'var(--c-card-alt)', border: '1px solid var(--c-border-card)' }}>
            <button onClick={() => setFilterSubject('all')}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-[10px] transition-all ${filterSubject === 'all' ? 'text-white' : ''}`}
              style={{ background: filterSubject === 'all' ? 'var(--c-blue)' : 'transparent', color: filterSubject === 'all' ? '#fff' : 'var(--c-muted)' }}
            >All Subjects</button>
            {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
              <button key={s} onClick={() => setFilterSubject(s)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-[10px] transition-all capitalize ${filterSubject === s ? 'text-white' : ''}`}
                style={{ background: filterSubject === s ? SUBJECT_META[s].color : 'transparent', color: filterSubject === s ? '#fff' : 'var(--c-muted)' }}
              >{s}</button>
            ))}
          </div>
          <div className="flex gap-1 p-0.5 rounded-[12px]" style={{ background: 'var(--c-card-alt)', border: '1px solid var(--c-border-card)' }}>
            <button onClick={() => setFilterType('all')}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-[10px] transition-all ${filterType === 'all' ? 'text-white' : ''}`}
              style={{ background: filterType === 'all' ? 'var(--c-blue)' : 'transparent', color: filterType === 'all' ? '#fff' : 'var(--c-muted)' }}
            >All</button>
            {BACKLOG_TYPES.map(t => (
              <button key={t.value} onClick={() => setFilterType(t.value)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-[10px] transition-all ${filterType === t.value ? 'text-white' : ''}`}
                style={{ background: filterType === t.value ? 'var(--c-blue)' : 'transparent', color: filterType === t.value ? '#fff' : 'var(--c-muted)' }}
              >{t.emoji} {t.label}</button>
            ))}
          </div>
        </div>

        {showAdd && (
          <div className="rounded-[18px] px-5 py-5 mb-4" data-tour="tour-backlog" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-3">
              {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                <button key={s} onClick={() => setNewSubject(s)}
                  className={`text-[10px] font-medium px-3 py-1 rounded-[40px] capitalize transition-all`}
                  style={{ background: newSubject === s ? SUBJECT_META[s].color : 'var(--c-tag)', color: newSubject === s ? '#fff' : 'var(--c-muted)' }}
                >{SUBJECT_META[s].emoji} {s}</button>
              ))}
            </div>
            <div className="flex gap-1.5 mb-3">
              <select value={newChapter} onChange={e => setNewChapter(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs outline-none rounded-[40px]"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
              >
                <option value="">Select chapter</option>
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1.5 mb-4">
              {BACKLOG_TYPES.map(t => (
                <button key={t.value} onClick={() => setNewType(t.value)}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-[40px] transition-all`}
                  style={{ background: newType === t.value ? 'var(--c-blue)' : 'var(--c-tag)', color: newType === t.value ? '#fff' : 'var(--c-muted)' }}
                >{t.emoji} {t.label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd}
                className="text-xs font-medium px-4 py-1.5 rounded-[40px] text-white transition-all"
                style={{ background: 'var(--c-btn-primary)' }}
              >Add to Backlog</button>
              <button onClick={() => setShowAdd(false)}
                className="text-xs font-medium px-4 py-1.5 rounded-[40px]"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
              >Cancel</button>
            </div>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="rounded-[18px] px-6 py-12 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Zero backlogs! Keep the streak going.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => {
              const isOverdue = !item.clearedAt && item.dueDate < new Date().toISOString().slice(0, 10)
              return (
                <div key={item.id} className="rounded-[14px] px-4 py-3 flex items-center gap-3" style={{
                  background: 'var(--c-card)',
                  border: `1px solid ${item.clearedAt ? 'var(--c-green)' : isOverdue ? 'var(--c-red)' : 'var(--c-border-card)'}`,
                  opacity: item.clearedAt ? 0.6 : 1,
                }}>
                  <span className="text-lg">{SUBJECT_META[item.subject].emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--c-text)' }}>{item.chapterName}</div>
                    <div className="text-[10px] flex items-center gap-2" style={{ color: 'var(--c-muted)' }}>
                      <span className="capitalize">{item.subject}</span>
                      <span>·</span>
                      <span>{BACKLOG_TYPES.find(t => t.value === item.type)?.emoji} {item.type.toUpperCase()}</span>
                      {!item.clearedAt && (
                        <><span>·</span><span style={{ color: isOverdue ? 'var(--c-red)' : 'var(--c-caption)' }}>Due: {item.dueDate}</span></>
                      )}
                      {item.clearedAt && <><span>·</span><span style={{ color: 'var(--c-green)' }}>Cleared ✓</span></>}
                    </div>
                  </div>
                  {!item.clearedAt ? (
                    <button onClick={() => clear(item.id)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-[40px] transition-all whitespace-nowrap"
                      style={{ border: '1px solid var(--c-green)', color: 'var(--c-green)' }}
                    >Clear</button>
                  ) : (
                    <button onClick={() => remove(item.id)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-[40px] transition-all whitespace-nowrap"
                      style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-muted)' }}
                    >Remove</button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
