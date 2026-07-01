'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useTimetableStore } from '@/store/timetableStore'
import { ACTIVITY_COLORS, ACTIVITY_LABELS, type Activity, type TimetableData } from '@/types'

const DAYS: (keyof TimetableData)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const STORAGE_KEY = 'timetable_custom_tags'

interface CustomTag { id: string; name: string; color: string }

function fmtHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

const ACTIVITIES: Activity[] = ['physics', 'chemistry', 'maths', 'break', 'sleep', 'gym', 'revision', 'mock_test']

function loadCustomTags(): CustomTag[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCustomTags(tags: CustomTag[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
}

export default function TimetablePage() {
  const { timetable, setCell, applyTemplate, clearAll } = useTimetableStore()
  const [activeCell, setActiveCell] = useState<{ day: string; hour: string } | null>(null)
  const [selectedDay, setSelectedDay] = useState(todayIndex())
  const [customTags, setCustomTags] = useState<CustomTag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6366f1')

  useEffect(() => { setCustomTags(loadCustomTags()) }, [])

  function todayIndex() {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  }

  const allTagIds = [...ACTIVITIES, ...customTags.map(t => t.id)]

  const getColor = useCallback((day: string, hour: string) => {
    const a = timetable[day as keyof TimetableData]?.[hour]
    if (!a) return 'transparent'
    if (ACTIVITY_COLORS[a as Activity]) return ACTIVITY_COLORS[a as Activity]
    const ct = customTags.find(t => t.id === a)
    return ct?.color || 'transparent'
  }, [timetable, customTags])

  const getLabel = useCallback((day: string, hour: string) => {
    const a = timetable[day as keyof TimetableData]?.[hour]
    if (!a) return ''
    if (ACTIVITY_LABELS[a as Activity]) return ACTIVITY_LABELS[a as Activity]?.slice(0, 4)
    const ct = customTags.find(t => t.id === a)
    return ct?.name.slice(0, 4) || ''
  }, [timetable, customTags])

  const addCustomTag = () => {
    const name = newTagName.trim()
    if (!name) return
    if (customTags.some(t => t.name.toLowerCase() === name.toLowerCase())) return
    const tag: CustomTag = { id: `custom_${Date.now()}`, name, color: newTagColor }
    const updated = [...customTags, tag]
    setCustomTags(updated)
    saveCustomTags(updated)
    setNewTagName('')
  }

  const deleteCustomTag = (id: string) => {
    if (!confirm('Delete this custom tag? Existing timetable entries with this tag will be cleared.')) return
    const updated = customTags.filter(t => t.id !== id)
    setCustomTags(updated)
    saveCustomTags(updated)
    // Clear cells using this tag
    for (const day of DAYS) {
      for (let h = 0; h < 24; h++) {
        if (timetable[day]?.[String(h)] === id) setCell(day, String(h), '')
      }
    }
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-8" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Timetable</h1>
            <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Plan your week hour by hour</p>
          </div>
          <div className="flex gap-2">
            {(['gym', 'full_study', 'test_day'] as const).map(t => (
              <button key={t} onClick={() => applyTemplate(t)} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}>
                {t === 'gym' ? '💪 Gym' : t === 'full_study' ? '📚 Full Study' : '📝 Test Day'}
              </button>
            ))}
            <button onClick={() => { if (confirm('Clear all timetable entries?')) clearAll() }} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}>
              🗑 Clear All
            </button>
          </div>
        </div>

        <div className="flex md:hidden gap-2 mb-3 overflow-x-auto">
          {DAYS.map((day, i) => (
            <button key={day} onClick={() => setSelectedDay(i)}
              className={`px-3 py-1.5 rounded-[10px] text-xs whitespace-nowrap`}
              style={{ color: selectedDay === i ? '#fff' : 'var(--c-muted)', background: selectedDay === i ? 'var(--c-blue)' : 'var(--c-progress-bg)' }}>
              {DAY_LABELS[i]}
            </button>
          ))}
        </div>

        <div className="rounded-[18px] overflow-hidden" data-tour="tour-timetable-grid" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-[10px] font-semibold uppercase tracking-wider p-2 text-left w-12 font-medium" style={{ color: 'var(--c-muted)' }}>Hr</th>
                  {DAY_LABELS.map((l, i) => (
                    <th key={i} className={`text-[10px] font-semibold uppercase tracking-wider p-2 text-center font-medium ${i !== selectedDay ? 'hidden md:table-cell' : ''}`} style={{ color: 'var(--c-muted)' }}>
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour}>
                    <td className="text-xs p-2 border-t whitespace-nowrap" style={{ color: 'var(--c-muted)', borderColor: 'var(--c-border)' }}>{fmtHour(hour)}</td>
                    {DAYS.map((day, di) => {
                      const color = getColor(day, String(hour))
                      const label = getLabel(day, String(hour))
                      const isActive = activeCell?.day === day && activeCell?.hour === String(hour)

                      return (
                        <td key={day} className={`border-t p-1 ${di === selectedDay ? '' : 'hidden md:table-cell'}`} style={{ borderColor: 'var(--c-border)' }}>
                          <div
                            onClick={() => setActiveCell(isActive ? null : { day, hour: String(hour) })}
                            className="relative h-8 rounded-[10px] cursor-pointer hover:ring-1 hover:ring-[#2383e2] transition-all flex items-center justify-center"
                            style={{ backgroundColor: color || 'transparent' }}
                          >
                            {label && <span className="text-[10px] text-white font-medium truncate px-1">{label}</span>}

                            {isActive && (
                              <div className="absolute top-full left-0 mt-1 z-50 rounded-[10px] p-1.5 shadow-lg min-w-[160px]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                                <div className="grid grid-cols-4 gap-1">
                                  {allTagIds.map(id => {
                                    const isCustom = customTags.some(t => t.id === id)
                                    const tagColor = isCustom ? customTags.find(t => t.id === id)!.color : ACTIVITY_COLORS[id as Activity]
                                    const tagLabel = isCustom ? customTags.find(t => t.id === id)!.name : ACTIVITY_LABELS[id as Activity]
                                    return (
                                      <button key={id}
                                        onClick={(e) => { e.stopPropagation(); setCell(day, String(hour), id); setActiveCell(null) }}
                                        className="w-7 h-7 rounded text-[10px] font-medium text-white flex items-center justify-center hover:scale-110 transition-transform"
                                        style={{ backgroundColor: tagColor }}
                                        title={tagLabel}
                                      >{tagLabel.slice(0, 2)}</button>
                                    )
                                  })}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setCell(day, String(hour), ''); setActiveCell(null) }}
                                  className="mt-1 w-full text-center text-[10px] py-0.5 hover:bg-black/[0.02] rounded" style={{ color: 'var(--c-red)' }}>
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {(['physics', 'chemistry', 'maths', 'break', 'gym', 'revision', 'mock_test'] as Activity[]).map(act => (
            <div key={act} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ACTIVITY_COLORS[act] }} />
              <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{ACTIVITY_LABELS[act]}</span>
            </div>
          ))}
          {customTags.map(tag => (
            <div key={tag.id} className="flex items-center gap-1.5 group">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: tag.color }} />
              <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{tag.name}</span>
              <button onClick={() => deleteCustomTag(tag.id)}
                className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-80" style={{ color: 'var(--c-red)' }}>✕</button>
            </div>
          ))}
        </div>

        {/* Custom Tag Creator */}
        <div className="mt-6 rounded-[18px] p-4" data-tour="tour-timetable-tags" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Create Custom Tag</h3>
          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>NAME</label>
              <input value={newTagName} onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                placeholder="e.g. Coaching class"
                className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }} />
            </div>
            <div className="w-16">
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>COLOR</label>
              <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)}
                className="w-full h-[38px] rounded-[10px] cursor-pointer outline-none" style={{ border: '1px solid var(--c-border-input)', background: 'var(--c-input)', padding: 2 }} />
            </div>
            <button onClick={addCustomTag} disabled={!newTagName.trim()}
              className="flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-[40px] text-white disabled:opacity-40"
              style={{ background: 'var(--c-blue)' }}>
              + Add Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
