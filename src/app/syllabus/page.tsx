'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useProgressStore } from '@/store/progressStore'
import type { Subject, ChapterFilter, SortOption, Chapter } from '@/types'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData } from '@/types'
import { db } from '@/lib/db'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ContextMenu from '@/components/shapes/ContextMenu'

const syllabus = syllabusData as unknown as SyllabusData

const SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']

const FILTERS: { value: ChapterFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All Chapters', icon: 'list' },
  { value: 'not_started', label: 'Not Started', icon: 'radio_button_unchecked' },
  { value: 'in_progress', label: 'In Progress', icon: 'progress_activity' },
  { value: 'done', label: 'Completed', icon: 'check_circle' },
  { value: 'revision_pending', label: 'Revision Pending', icon: 'refresh' },
  { value: 'high_weightage', label: 'High Weightage', icon: 'whatshot' },
  { value: 'weak', label: 'Weak Chapters', icon: 'sentiment_dissatisfied' },
  { value: 'high_priority', label: 'High Priority', icon: 'priority_high' },
]

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'progress', label: 'Progress' },
  { value: 'weightage', label: 'Weightage' },
  { value: 'revision_gap', label: 'Revision Gap' },
]

function AddChapterModal({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const addChapter = useProgressStore(s => s.addChapter)
  const [name, setName] = useState('')
  const [weightage, setWeightage] = useState('medium')

  const handleSubmit = async () => {
    if (!name.trim()) return
    const id = `custom_${Date.now()}`
    await addChapter({
      id,
      name: name.trim(),
      class: 12,
      weightage,
      topics: [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rounded-[18px] p-6 w-full max-w-sm mx-4 animate-scale-in"
        style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--c-text)' }}>Add Chapter</h3>
        <input
          autoFocus
          placeholder="Chapter name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full px-3 py-2 text-sm rounded-[12px] mb-3 outline-none"
          style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}
        />
        <select
          value={weightage}
          onChange={e => setWeightage(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-[12px] mb-4 outline-none"
        >
          <option value="low">Low Weightage</option>
          <option value="medium">Medium Weightage</option>
          <option value="high">High Weightage</option>
        </select>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-[40px]" style={{ color: 'var(--c-muted)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim()}
            className="px-5 py-2 text-sm font-semibold rounded-[40px] text-white disabled:opacity-40"
            style={{ background: 'var(--c-btn-primary)' }}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function RenameModal({ currentName, onSave, onClose }: { currentName: string; onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState(currentName)
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-[18px] p-6 w-full max-w-sm mx-4 animate-scale-in"
        style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--c-text)' }}>Rename Chapter</h3>
        <input autoFocus placeholder="Chapter name" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && (onSave(name.trim()), onClose())}
          className="w-full px-3 py-2 text-sm rounded-[12px] mb-4 outline-none"
          style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }} />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-[40px]" style={{ color: 'var(--c-muted)' }}>Cancel</button>
          <button onClick={() => name.trim() && (onSave(name.trim()), onClose())}
            className="px-5 py-2 text-sm font-semibold rounded-[40px] text-white" style={{ background: 'var(--c-btn-primary)' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onClose }: { message: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-[18px] p-6 w-full max-w-sm mx-4 animate-scale-in"
        style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }}
        onClick={e => e.stopPropagation()}>
        <p className="text-sm mb-5" style={{ color: 'var(--c-text)' }}>{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-[40px]" style={{ color: 'var(--c-muted)' }}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }}
            className="px-5 py-2 text-sm font-semibold rounded-[40px] text-white" style={{ background: 'var(--c-red)' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function ProgressDot({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    done: 'var(--c-green)',
    in_progress: 'var(--c-blue)',
    not_started: 'var(--c-caption)',
  }
  return (
    <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: colors[status || 'not_started'] || 'var(--c-caption)' }} />
  )
}

function WeightageBadge({ weightage }: { weightage: string }) {
  const colors: Record<string, string> = {
    high: 'var(--c-red)',
    medium: 'var(--c-orange)',
    low: 'var(--c-caption)',
  }
  return (
    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full" style={{ background: colors[weightage] + '20', color: colors[weightage] || 'var(--c-caption)' }}>
      {weightage}
    </span>
  )
}

export default function SyllabusPage() {
  const { progress, loaded, setTopicDone, setChapterStatus, markAllTopics, addCustomTopic, incrementRevision, deleteChapter, load, loadCustomChapters, customChapters, getTotalChapters } = useProgressStore()

  const [subject, setSubject] = useState<Subject>('physics')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ChapterFilter>('all')
  const [sort, setSort] = useState<SortOption>('default')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chapterId: string; chapterName: string } | null>(null)
  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { load(); loadCustomChapters() }, [load, loadCustomChapters])

  const allChapters = useMemo(() => {
    const data = syllabus[subject]
    const builtIn: Chapter[] = []
    for (const div of data.divisions) {
      for (const ch of div.chapters) {
        if (!ch.deleted) builtIn.push({ ...ch })
      }
    }
    for (const cc of customChapters) {
      if (!cc.deleted) builtIn.push(cc)
    }
    return builtIn
  }, [subject, customChapters])

  const filteredChapters = useMemo(() => {
    let chs = [...allChapters]
    if (search) {
      const q = search.toLowerCase()
      chs = chs.filter(ch => ch.name.toLowerCase().includes(q))
    }
    switch (filter) {
      case 'not_started':
        chs = chs.filter(ch => (progress[ch.id]?.status ?? 'not_started') === 'not_started'); break
      case 'in_progress':
        chs = chs.filter(ch => progress[ch.id]?.status === 'in_progress'); break
      case 'done':
        chs = chs.filter(ch => progress[ch.id]?.status === 'done'); break
      case 'revision_pending': {
        const thirtyDays = Date.now() - 30 * 86400000
        chs = chs.filter(ch => {
          const p = progress[ch.id]
          if (!p || p.status !== 'done') return false
          return p.lastRevised ? new Date(p.lastRevised).getTime() < thirtyDays : true
        })
        break
      }
      case 'high_weightage':
        chs = chs.filter(ch => ch.weightage === 'high'); break
      case 'weak':
        chs = chs.filter(ch => {
          const p = progress[ch.id]
          if (!p || p.status !== 'in_progress') return false
          const chTopics = ch.topics.filter(t => !t.deleted)
          if (!chTopics.length) return false
          return chTopics.filter(t => p.topicStatus[t.id]).length / chTopics.length < 0.4
        })
        break
      case 'high_priority':
        chs.sort((a, b) => {
          const pA = progress[a.id], pB = progress[b.id]
          const w = { high: 3, medium: 2, low: 1 }
          const gapA = pA?.lastRevised ? (Date.now() - new Date(pA.lastRevised).getTime()) / 86400000 : 30
          const gapB = pB?.lastRevised ? (Date.now() - new Date(pB.lastRevised).getTime()) / 86400000 : 30
          return (w[b.weightage as keyof typeof w] * gapB) - (w[a.weightage as keyof typeof w] * gapA)
        })
        break
    }
    switch (sort) {
      case 'name':
        chs.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'progress':
        chs.sort((a, b) => {
          const dA = progress[a.id] ? Object.values(progress[a.id].topicStatus).filter(Boolean).length : 0
          const dB = progress[b.id] ? Object.values(progress[b.id].topicStatus).filter(Boolean).length : 0
          return dB - dA
        })
        break
      case 'weightage': {
        const wO = { high: 0, medium: 1, low: 2 }
        chs.sort((a, b) => (wO[a.weightage as keyof typeof wO] ?? 3) - (wO[b.weightage as keyof typeof wO] ?? 3))
        break
      }
      case 'revision_gap':
        chs.sort((a, b) => {
          const gA = progress[a.id]?.lastRevised ? Date.now() - new Date(progress[a.id].lastRevised!).getTime() : Infinity
          const gB = progress[b.id]?.lastRevised ? Date.now() - new Date(progress[b.id].lastRevised!).getTime() : Infinity
          return gB - gA
        })
        break
    }
    return chs
  }, [allChapters, search, filter, sort, progress])

  const { total, done } = getTotalChapters()

  const handleContextMenu = useCallback((e: React.MouseEvent, chapterId: string, chapterName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, chapterId, chapterName })
  }, [])

  const handleDragStart = useCallback((chapterId: string) => setDragId(chapterId), [])
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), [])
  const handleDrop = useCallback(async (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const ids = filteredChapters.map(ch => ch.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    ids.splice(from, 1)
    ids.splice(to, 0, dragId)
    setDragId(null)
    const subjectData = syllabus[subject]
    const userOrder = [...ids]
    localStorage.setItem(`syllabus_order_${subject}`, JSON.stringify(userOrder))
  }, [dragId, filteredChapters, subject])

  const handleRename = async (newName: string) => {
    if (!renameTarget) return
    const ch = await db.customChapters.get(renameTarget)
    if (ch) { ch.name = newName; await db.customChapters.put(ch) }
    setRenameTarget(null)
  }

  const subjectInfo = syllabus[subject]
  const subjectProgress = useMemo(() => {
    const s = subjectInfo
    let d = 0, t = 0
    for (const div of s.divisions) {
      for (const ch of div.chapters) {
        if (ch.deleted) continue
        t++
        if (progress[ch.id]?.status === 'done') d++
      }
    }
    for (const cc of customChapters) {
      if (!cc.deleted) { t++; if (progress[cc.id]?.status === 'done') d++ }
    }
    return t > 0 ? Math.round((d / t) * 100) : 0
  }, [subject, subjectInfo, progress, customChapters])

  const handleChapterStatus = (ch: Chapter) => {
    const current = progress[ch.id]?.status ?? 'not_started'
    if (current === 'done') setChapterStatus(ch.id, 'not_started')
    else if (current === 'not_started') setChapterStatus(ch.id, 'in_progress')
    else setChapterStatus(ch.id, 'done')
  }

  const handleChapterClick = (chId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setExpandedId(expandedId === chId ? null : chId)
  }

  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <div className="max-w-[900px] mx-auto px-5 pt-[17px] pb-24" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-1px]" style={{ color: 'var(--c-text)' }}>Syllabus</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]"
              style={{ background: 'var(--c-btn-primary)' }}>
              <span className="material-symbols-rounded text-[18px]">add</span>
              <span className="hidden sm:inline">Add Chapter</span>
            </button>
          </div>
        </div>
        <p className="text-[13px] mb-8" style={{ color: 'var(--c-muted)' }}>
          <span style={{ color: 'var(--c-green)' }}>{done} / {total}</span> chapters completed across all subjects
        </p>

        {/* Subject Tabs */}
        <div className="flex gap-1.5 mb-6 p-1 rounded-[14px]" data-tour="tour-syllabus-filter" style={{ background: 'var(--c-card-alt)', border: '1px solid var(--c-border-card)' }}>
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => { setSubject(s); setSearch(''); setFilter('all'); setSort('default') }}
              className="flex-1 py-2 text-sm font-medium rounded-[12px] capitalize transition-all"
              style={{ background: subject === s ? 'var(--c-card)' : 'transparent', color: subject === s ? 'var(--c-text)' : 'var(--c-muted)', boxShadow: subject === s ? 'var(--c-shadow)' : 'none' }}>
              <span className="hidden sm:inline">{s}</span>
              <span className="sm:hidden">{s[0].toUpperCase() + s.slice(1, 4)}</span>
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: 'var(--c-caption)' }}>search</span>
            <input placeholder="Search chapters..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-[12px] outline-none transition-all"
              style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }} />
          </div>
          <div className="relative">
            <button onClick={() => { setShowFilter(!showFilter); setShowSort(false) }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-[12px] transition-all"
              style={{ background: filter !== 'all' ? 'var(--c-tag)' : 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[18px]">filter_list</span>
              <span className="hidden sm:inline text-[13px]">{FILTERS.find(f => f.value === filter)?.label ?? 'Filter'}</span>
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[190px] rounded-[12px] py-1.5 border shadow-xl"
                style={{ background: 'var(--c-card)', borderColor: 'var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }}>
                <div className="max-h-[60vh] overflow-y-auto animate-slide-up">
                  {FILTERS.map(f => (
                    <button key={f.value} onClick={() => { setFilter(f.value); setShowFilter(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors hover:opacity-80"
                      style={{ color: filter === f.value ? 'var(--c-blue)' : 'var(--c-text)', background: filter === f.value ? 'var(--c-sidebar-hover)' : 'transparent' }}>
                      <span className="material-symbols-rounded text-[16px]" style={{ color: 'var(--c-muted)' }}>{f.icon}</span>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setShowSort(!showSort); setShowFilter(false) }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-[12px]"
              style={{ background: sort !== 'default' ? 'var(--c-tag)' : 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[18px]">sort</span>
              <span className="hidden sm:inline text-[13px]">{SORTS.find(s => s.value === sort)?.label}</span>
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-[12px] py-1.5 border shadow-xl animate-slide-up"
                style={{ background: 'var(--c-card)', borderColor: 'var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }}>
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => { setSort(s.value); setShowSort(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors hover:opacity-80"
                    style={{ color: sort === s.value ? 'var(--c-blue)' : 'var(--c-text)', background: sort === s.value ? 'var(--c-sidebar-hover)' : 'transparent' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subject Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--c-muted)' }}>
            <span className="capitalize">{subject} Progress</span>
            <span>{subjectProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${subjectProgress}%`, background: 'var(--c-blue)' }} />
          </div>
        </div>

        {/* Chapter List */}
        {filteredChapters.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-rounded text-[48px]" style={{ color: 'var(--c-caption)' }}>search_off</span>
            <p className="text-sm mt-2" style={{ color: 'var(--c-muted)' }}>No chapters match your filters</p>
          </div>
        ) : (
          <div className="space-y-1.5" data-tour="tour-syllabus-chapters">
            {filteredChapters.map(ch => {
              const p = progress[ch.id]
              const chTopics = ch.topics.filter(t => !t.deleted)
              const doneTopics = chTopics.filter(t => p?.topicStatus[t.id]).length
              const totalTopics = chTopics.length
              const pct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0
              const chStatus = p?.status ?? 'not_started'
              const isCustom = ch.id.startsWith('custom_')

              return (
                <div key={ch.id}>
                  <div
                    draggable
                    onDragStart={() => handleDragStart(ch.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(ch.id)}
                    onClick={e => handleChapterClick(ch.id, e)}
                    onContextMenu={e => handleContextMenu(e, ch.id, ch.name)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all cursor-pointer group"
                    style={{
                      background: expandedId === ch.id ? 'var(--c-card-alt)' : 'var(--c-card)',
                      border: `1px solid ${expandedId === ch.id ? 'var(--c-blue)' : 'var(--c-border-card)'}`,
                      boxShadow: expandedId === ch.id ? 'var(--c-shadow-hover)' : 'var(--c-shadow)',
                      opacity: dragId === ch.id ? 0.4 : 1,
                    }}
                  >
                    {/* Drag Handle */}
                    <span className="material-symbols-rounded text-[18px] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ color: 'var(--c-caption)' }} onMouseDown={handleDragMouseDown}>drag_indicator</span>

                    <ProgressDot status={chStatus} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{ch.name}</span>
                        <WeightageBadge weightage={ch.weightage} />
                        {isCustom && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--c-orange)20', color: 'var(--c-orange)' }}>Custom</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {totalTopics > 0 && (
                          <div className="flex-1 max-w-[120px] h-1 rounded-full" style={{ background: 'var(--c-progress-bg)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: chStatus === 'done' ? 'var(--c-green)' : 'var(--c-blue)' }} />
                          </div>
                        )}
                        <span className="text-[11px]" style={{ color: 'var(--c-caption)' }}>
                          {totalTopics > 0 ? `${doneTopics}/${totalTopics}` : 'No topics'}
                          {chStatus === 'done' && p?.completedOn && ` · ${p.completedOn}`}
                          {chStatus === 'done' && (p?.revisionCount ?? 0) > 0 && ` · Rev ${p?.revisionCount}`}
                        </span>
                        <span className={`material-symbols-rounded text-[16px] transition-transform ${expandedId === ch.id ? 'rotate-180' : ''}`}
                          style={{ color: 'var(--c-caption)' }}>expand_more</span>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleChapterStatus(ch)}
                        className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                        style={{ color: chStatus === 'done' ? 'var(--c-green)' : 'var(--c-caption)' }}
                        title={chStatus === 'done' ? 'Mark incomplete' : 'Toggle progress'}>
                        <span className="material-symbols-rounded text-[18px]">
                          {chStatus === 'done' ? 'check_circle' : chStatus === 'in_progress' ? 'radio_button_partial' : 'radio_button_unchecked'}
                        </span>
                      </button>
                    </div>

                    {/* Mobile quick status */}
                    <button onClick={() => handleChapterStatus(ch)}
                      className="sm:hidden p-1 rounded-lg"
                      style={{ color: chStatus === 'done' ? 'var(--c-green)' : 'var(--c-blue)' }}>
                      <span className="material-symbols-rounded text-[20px]">
                        {chStatus === 'done' ? 'check_circle' : chStatus === 'in_progress' ? 'hourglass_top' : 'circle'}
                      </span>
                    </button>
                  </div>

                  {/* Expanded Topics */}
                  {expandedId === ch.id && (
                    <div className="ml-[46px] mt-1 mb-2 p-3 rounded-[12px] animate-slide-up" style={{ background: 'var(--c-card-alt)', border: '1px solid var(--c-border-card)' }}>
                      <div className="space-y-1">
                        {chTopics.length > 0 ? chTopics.map(t => {
                          const done = p?.topicStatus[t.id] ?? false
                          return (
                            <label key={t.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-[8px] cursor-pointer hover:opacity-80 transition-colors">
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={e => setTopicDone(ch.id, t.id, e.target.checked)}
                                className="w-3.5 h-3.5 rounded-[3px]"
                                style={{ accentColor: 'var(--c-blue)' }}
                              />
                              <span className={`text-[13px] ${done ? 'line-through' : ''}`}
                                style={{ color: done ? 'var(--c-muted)' : 'var(--c-text)' }}>
                                {t.name}
                              </span>
                              {t.id.startsWith('custom_') && (
                                <span className="text-[9px] ml-auto px-1.5 py-0.5 rounded-full" style={{ background: 'var(--c-orange)20', color: 'var(--c-orange)' }}>Custom</span>
                              )}
                            </label>
                          )
                        }) : (
                          <p className="text-xs text-center py-3" style={{ color: 'var(--c-caption)' }}>No topics. Add one from the context menu.</p>
                        )}
                      </div>
                      {chTopics.length > 0 && chStatus !== 'done' && (
                        <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--c-border)' }}>
                          <button onClick={() => markAllTopics(ch.id)}
                            className="text-[11px] font-medium px-3 py-1.5 rounded-[40px] text-white"
                            style={{ background: 'var(--c-btn-primary)' }}>
                            Mark All Done
                          </button>
                          <button onClick={() => {
                            const customName = prompt('Topic name:')
                            if (customName?.trim()) addCustomTopic(ch.id, customName.trim())
                          }}
                            className="text-[11px] font-medium px-3 py-1.5 rounded-[40px]"
                            style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>
                            + Add Topic
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            items={[
              { label: 'Rename', icon: 'edit', onClick: () => { setRenameTarget(contextMenu.chapterId); setContextMenu(null) } },
              { label: 'Mark Complete', icon: 'check_circle', onClick: () => { setChapterStatus(contextMenu.chapterId, 'done'); setContextMenu(null) } },
              { label: 'Increment Revision', icon: 'refresh', onClick: () => { incrementRevision(contextMenu.chapterId); setContextMenu(null) } },
              { label: 'Add Topic', icon: 'playlist_add', onClick: () => { setContextMenu(null) } },
              { divider: true, label: '', icon: '', onClick: () => {} },
              { label: 'Delete', icon: 'delete', danger: true, onClick: () => { setDeleteTarget(contextMenu.chapterId); setContextMenu(null) } },
            ].filter(i => {
              if (i.label === 'Delete' && !contextMenu.chapterId.startsWith('custom_')) return false
              return true
            }) as any}
          />
        )}

        {/* Modals */}
        {showAddModal && <AddChapterModal subject={subject} onClose={() => setShowAddModal(false)} />}
        {renameTarget && <RenameModal currentName={filteredChapters.find(ch => ch.id === renameTarget)?.name ?? ''}
          onSave={handleRename} onClose={() => setRenameTarget(null)} />}
        {deleteTarget && <ConfirmModal message="Delete this chapter? This action cannot be undone."
          onConfirm={() => deleteChapter(deleteTarget)} onClose={() => setDeleteTarget(null)} />}
      </div>
    </div>
  )
}
