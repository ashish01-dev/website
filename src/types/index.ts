export type Subject = 'physics' | 'chemistry' | 'maths'

export type Activity = 'physics' | 'chemistry' | 'maths' | 'break' | 'revision' | 'sleep' | 'gym' | 'mock_test'

export interface Topic {
  id: string
  name: string
}

export interface Chapter {
  id: string
  name: string
  class: number
  weightage: string
  deleted?: boolean
  topics: Topic[]
}

export interface Division {
  name: string
  chapters: Chapter[]
}

export interface SubjectData {
  name: string
  icon: string
  color: string
  divisions: Division[]
}

export interface SyllabusData {
  physics: SubjectData
  chemistry: SubjectData
  maths: SubjectData
}

export interface ChapterProgress {
  status: 'not_started' | 'in_progress' | 'done'
  completedOn?: string
  topicStatus: Record<string, boolean>
  customTopics?: Record<string, string>
}

export type UserProgress = Record<string, ChapterProgress>

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type DayTimetable = Record<string, string>

export interface TimetableData {
  monday?: DayTimetable
  tuesday?: DayTimetable
  wednesday?: DayTimetable
  thursday?: DayTimetable
  friday?: DayTimetable
  saturday?: DayTimetable
  sunday?: DayTimetable
}

export interface TestEntry {
  id: string
  date: string
  subject: Subject
  subjects?: string[]
  score: number
  total: number
  accuracy: number
  notes?: string
}

export interface ErrorEntry {
  id: string
  date: string
  subject: Subject
  chapter: string
  question: string
  reason: string
}

export interface FormulaFile {
  name: string
  size: number
  type: string
  url?: string
  storagePath?: string
}

export interface FormulaEntry {
  id: string
  chapterId: string
  subject: Subject
  files: FormulaFile[]
  updatedAt: string
}

export interface DailyLog {
  date: string
  studyMinutes: number
  chaptersCompleted: string[]
  questionsAttempted: number
  pomodoroSessions: number
}

export interface PomodoroSession {
  id: string
  date: string
  start: number
  end: number
  duration: number
  completed: boolean
}

export interface DailyPlanChapter {
  name: string
  subject: Subject
  hours: number
}

export interface DailyPlan {
  date: string
  chapters: DailyPlanChapter[]
}

export interface QuestionsEntry {
  id: string
  date: string
  subject: Subject
  chapter: string
  count: number
  correct: number
}

export interface Settings {
  examDate: string
  dailyStudyHours: number
  theme: 'dark' | 'light'
  confettiEnabled: boolean
  freezeDays: number
}
