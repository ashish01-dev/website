import Dexie, { type Table } from 'dexie'
import type { UserProgress, TimetableData, TestEntry, ErrorEntry, FormulaEntry, DailyLog, PomodoroSession, DailyPlan, QuestionsEntry } from '@/types'
import { syncUpsert, syncAdd, syncDelete, syncClear } from './supabase-sync'

export class JeeDatabase extends Dexie {
  progress!: Table<UserProgress, string>
  timetable!: Table<{ id: string; data: TimetableData }, string>
  tests!: Table<TestEntry, string>
  errors!: Table<ErrorEntry, string>
  formulas!: Table<FormulaEntry, string>
  dailyLogs!: Table<DailyLog, string>
  settings!: Table<{ id: string; value: unknown }, string>
  pomodoro!: Table<PomodoroSession, string>
  dailyPlans!: Table<DailyPlan, string>
  questions!: Table<QuestionsEntry, string>

  constructor() {
    super('JEE2027Tracker')
    this.version(5).stores({
      progress: '&chapterId',
      timetable: '&id',
      tests: '&id, date, subject',
      errors: '&id, date, chapter, subject',
      formulas: '&id, chapterId, subject',
      dailyLogs: '&date',
      settings: '&id',
      pomodoro: '&id, date',
      dailyPlans: '&date',
      questions: '&id, date, subject, chapter',
    })
  }
}

const dexie = new JeeDatabase()

/* ─── Synced table wrapper ─── */
const TABLE_KEY = {
  progress: 'chapterId', timetable: 'id', tests: 'id', errors: 'id',
  formulas: 'id', dailyLogs: 'date', settings: 'id', pomodoro: 'id',
  dailyPlans: 'date', questions: 'id',
} as Record<string, string>

function synced<T>(tableName: string, keyField?: string) {
  const raw = dexie[tableName as keyof JeeDatabase] as unknown as Table<T, string>
  const key = keyField || TABLE_KEY[tableName] || 'id'
  return {
    toArray:  () => raw.toArray(),
    get:      (k: string) => raw.get(k),
    add:      async (item: T) => { const id = await raw.add(item); syncAdd(tableName, item as any); return id },
    put:      async (item: T) => { await raw.put(item); syncUpsert(tableName, item as any) },
    delete:   async (k: string) => { await raw.delete(k); syncDelete(tableName, key, k) },
    clear:    async () => { await raw.clear(); syncClear(tableName) },
    _raw:     raw,
  }
}

const noop = () => ({
  toArray: (): Promise<never[]> => Promise.resolve([]),
  get:     (): Promise<undefined> => Promise.resolve(undefined),
  add:     (): Promise<string> => Promise.resolve(''),
  put:     (): Promise<void> => Promise.resolve(),
  delete:  (): Promise<void> => Promise.resolve(),
  clear:   (): Promise<void> => Promise.resolve(),
  _raw:    null as never,
})

const useSync = typeof window !== 'undefined'

export const db = {
  progress:   useSync ? synced<UserProgress & { chapterId: string }>('progress', 'chapterId') : noop(),
  timetable:  useSync ? synced<{ id: string; data: TimetableData }>('timetable') : noop(),
  tests:      useSync ? synced<TestEntry>('tests') : noop(),
  errors:     useSync ? synced<ErrorEntry>('errors') : noop(),
  formulas:   useSync ? synced<FormulaEntry>('formulas') : noop(),
  dailyLogs:  useSync ? synced<DailyLog>('dailylogs', 'date') : noop(),
  settings:   useSync ? synced<{ id: string; value: unknown }>('settings') : noop(),
  pomodoro:   useSync ? synced<PomodoroSession>('pomodoro') : noop(),
  dailyPlans: useSync ? synced<DailyPlan>('dailyplans', 'date') : noop(),
  questions:  useSync ? synced<QuestionsEntry>('questions') : noop(),
}

export { dexie }
