import { create } from 'zustand'
import type { TimetableData, Activity, DayTimetable } from '@/types'
import { db } from '@/lib/db'

interface TimetableState {
  timetable: TimetableData
  loaded: boolean
  load: () => Promise<void>
  setCell: (day: keyof TimetableData, hour: string, activity: string) => Promise<void>
  clearAll: () => Promise<void>
  applyTemplate: (template: 'gym' | 'full_study' | 'test_day') => Promise<void>
}

function fill24(base: Record<string, string>): DayTimetable {
  const out: Record<string, string> = {}
  for (let h = 0; h < 24; h++) out[String(h)] = base[String(h)] || (h < 6 ? 'sleep' : '')
  return out
}

const GYM: TimetableData = {
  monday: fill24({ '9':'physics','10':'chemistry','11':'maths','12':'break','13':'gym','14':'gym','15':'gym','16':'gym','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  tuesday: fill24({ '9':'chemistry','10':'maths','11':'physics','12':'break','13':'gym','14':'gym','15':'gym','16':'gym','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  wednesday: fill24({ '9':'maths','10':'physics','11':'chemistry','12':'break','13':'gym','14':'gym','15':'gym','16':'gym','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  thursday: fill24({ '9':'physics','10':'chemistry','11':'maths','12':'break','13':'gym','14':'gym','15':'gym','16':'gym','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  friday: fill24({ '9':'chemistry','10':'maths','11':'physics','12':'break','13':'gym','14':'gym','15':'gym','16':'gym','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  saturday: fill24({ '9':'maths','10':'physics','11':'chemistry','12':'break','13':'physics','14':'chemistry','15':'maths','16':'break','17':'revision','18':'mock_test','19':'mock_test','20':'break','21':'revision' }),
  sunday: fill24({ '9':'sleep','10':'sleep','11':'break','12':'revision','13':'physics','14':'chemistry','15':'maths','16':'break','17':'mock_test','18':'mock_test','19':'break','20':'revision' }),
}

const FULL: TimetableData = {
  monday: fill24({ '9':'physics','10':'physics','11':'break','12':'chemistry','13':'chemistry','14':'break','15':'maths','16':'maths','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  tuesday: fill24({ '9':'chemistry','10':'chemistry','11':'break','12':'maths','13':'maths','14':'break','15':'physics','16':'physics','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  wednesday: fill24({ '9':'maths','10':'maths','11':'break','12':'physics','13':'physics','14':'break','15':'chemistry','16':'chemistry','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  thursday: fill24({ '9':'physics','10':'physics','11':'break','12':'chemistry','13':'chemistry','14':'break','15':'maths','16':'maths','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  friday: fill24({ '9':'chemistry','10':'chemistry','11':'break','12':'maths','13':'maths','14':'break','15':'physics','16':'physics','17':'break','18':'revision','19':'physics','20':'chemistry','21':'maths','22':'break' }),
  saturday: fill24({ '9':'mock_test','10':'mock_test','11':'mock_test','12':'break','13':'revision','14':'revision','15':'physics','16':'chemistry','17':'break','18':'maths','19':'revision','20':'break' }),
  sunday: fill24({ '9':'sleep','10':'sleep','11':'break','12':'revision','13':'physics','14':'chemistry','15':'maths','16':'break','17':'mock_test','18':'mock_test','19':'break','20':'revision' }),
}

const TEST_DAY: DayTimetable = fill24({ '9':'revision','10':'revision','11':'break','12':'mock_test','13':'mock_test','14':'mock_test','15':'break','16':'revision','17':'revision','18':'physics','19':'chemistry','20':'maths','21':'break' })

export const useTimetableStore = create<TimetableState>((set, get) => ({
  timetable: {},
  loaded: false,
  load: async () => {
    try {
      const saved = await db.timetable.get('main')
      if (saved?.data) set({ timetable: saved.data as TimetableData, loaded: true })
      else set({ loaded: true })
    } catch (err) { console.error('timetable.load:', err); set({ loaded: true }) }
  },
  setCell: async (day, hour, activity) => {
    const current = { ...get().timetable }
    if (!current[day]) current[day] = {}
    current[day] = { ...current[day], [hour]: activity }
    set({ timetable: current })
    try { await db.timetable.put({ id: 'main', data: current }) } catch (err) { console.error('timetable.setCell:', err) }
  },
  clearAll: async () => {
    set({ timetable: {} })
    try { await db.timetable.put({ id: 'main', data: {} }) } catch (err) { console.error('timetable.clearAll:', err) }
  },
  applyTemplate: async (template) => {
    if (template === 'test_day') {
      const current = { ...get().timetable }
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof TimetableData
      current[today] = { ...TEST_DAY }
      set({ timetable: current })
      try { await db.timetable.put({ id: 'main', data: current }) } catch (err) { console.error('timetable.applyTemplate:', err) }
    } else {
      const data = template === 'gym' ? GYM : FULL
      set({ timetable: data })
      try { await db.timetable.put({ id: 'main', data }) } catch (err) { console.error('timetable.applyTemplate:', err) }
    }
  },
}))
