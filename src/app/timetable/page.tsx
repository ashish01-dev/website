'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useTimetableStore } from '@/store/timetableStore'
import { ACTIVITY_COLORS, ACTIVITY_LABELS, type Activity } from '@/types'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function fmtHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

const ACTIVITIES: Activity[] = ['physics', 'chemistry', 'maths', 'break', 'sleep', 'gym', 'revision', 'mock_test']

export default function TimetablePage() {
  const { timetable, setCell, applyTemplate } = useTimetableStore()
  const [activeCell, setActiveCell] = useState<{ day: string; hour: string } | null>(null)
  const [selectedDay, setSelectedDay] = useState(todayIndex())

  function todayIndex() {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  }

  const getColor = (day: string, hour: string) => {
    const a = timetable[day]?.[hour]
    return a ? ACTIVITY_COLORS[a as Activity] : 'transparent'
  }

  const getLabel = (day: string, hour: string) => {
    const a = timetable[day]?.[hour]
    return a ? ACTIVITY_LABELS[a as Activity]?.slice(0, 4) : ''
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-60">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-page-title text-notion-text-dark mb-1">Timetable</h1>
            <p className="text-sm text-notion-muted-dark">Plan your week hour by hour</p>
          </div>
          <div className="flex gap-2">
            {(['gym', 'full_study', 'test_day'] as const).map(t => (
              <button key={t} onClick={() => applyTemplate(t)} className="notion-btn-ghost text-xs">
                {t === 'gym' ? '💪 Gym' : t === 'full_study' ? '📚 Full Study' : '📝 Test Day'}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile day selector */}
        <div className="flex md:hidden gap-2 mb-3 overflow-x-auto">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`px-3 py-1.5 rounded-notion text-xs whitespace-nowrap ${
                selectedDay === i ? 'bg-[#2383e2] text-white' : 'bg-notion-sidebar-hover-dark text-notion-muted-dark'
              }`}
            >
              {DAY_LABELS[i]}
            </button>
          ))}
        </div>

        <div className="notion-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-caption text-notion-muted-dark p-2 text-left w-12 font-medium">Hr</th>
                  {DAY_LABELS.map((l, i) => (
                    <th key={i} className={`text-caption text-notion-muted-dark p-2 text-center font-medium ${i !== selectedDay ? 'hidden md:table-cell' : ''}`}>
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour}>
                    <td className="text-xs text-notion-muted-dark p-2 border-t border-notion-border-dark whitespace-nowrap">{fmtHour(hour)}</td>
                    {DAYS.map((day, di) => {
                      const color = getColor(day, String(hour))
                      const label = getLabel(day, String(hour))
                      const isActive = activeCell?.day === day && activeCell?.hour === String(hour)

                      return (
                        <td key={day} className={`border-t border-notion-border-dark p-1 ${di === selectedDay ? '' : 'hidden md:table-cell'}`}>
                          <div
                            onClick={() => setActiveCell(isActive ? null : { day, hour: String(hour) })}
                            className="relative h-8 rounded-notion cursor-pointer hover:ring-1 hover:ring-[#2383e2] transition-all flex items-center justify-center"
                            style={{ backgroundColor: color || 'transparent' }}
                          >
                            {label && <span className="text-[10px] text-white font-medium truncate px-1">{label}</span>}

                            {isActive && (
                              <div className="absolute top-full left-0 mt-1 z-50 bg-notion-bg-dark border border-notion-border-dark rounded-notion p-1.5 shadow-lg min-w-[130px]">
                                <div className="grid grid-cols-4 gap-1">
                                  {ACTIVITIES.map(act => (
                                    <button
                                      key={act}
                                      onClick={(e) => { e.stopPropagation(); setCell(day, String(hour), act); setActiveCell(null) }}
                                      className="w-7 h-7 rounded text-[10px] font-medium text-white flex items-center justify-center hover:scale-110 transition-transform"
                                      style={{ backgroundColor: ACTIVITY_COLORS[act] }}
                                      title={ACTIVITY_LABELS[act]}
                                    >
                                      {act.slice(0, 2)}
                                    </button>
                                  ))}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setCell(day, String(hour), ''); setActiveCell(null) }} className="mt-1 w-full text-center text-[10px] text-[#e03e3e] py-0.5 hover:bg-notion-sidebar-hover-dark rounded">
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

        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {(['physics', 'chemistry', 'maths', 'break', 'gym', 'revision', 'mock_test'] as Activity[]).map(act => (
            <div key={act} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ACTIVITY_COLORS[act] }} />
              <span className="text-xs text-notion-muted-dark">{ACTIVITY_LABELS[act]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
