export type Subject = 'physics' | 'chemistry' | 'maths'

export type Activity = 'physics' | 'chemistry' | 'maths' | 'break' | 'revision' | 'sleep' | 'gym' | 'mock_test'

export interface Topic {
  id: string
  name: string
  deleted?: boolean
}

export interface Chapter {
  id: string
  name: string
  class: number
  weightage: string
  ncertRef?: string
  verified?: boolean
  deleted?: boolean
  topics: Topic[]
}

export interface Division {
  id: string
  name: string
  chapters: Chapter[]
}

export interface DeletedChapter {
  name: string
  reason: string
  verified?: boolean
}

export interface SubjectData {
  name: string
  icon: string
  color: string
  divisions: Division[]
  deletedChapters: DeletedChapter[]
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
  chapters?: string[]
  score: number
  total: number
  accuracy: number
  notes?: string
  timeTaken?: number
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

export interface DailyPlanSubject {
  subject: Subject
  chapters: string[]
  questions: number
}

export interface DailyPlan {
  date: string
  hoursGoal?: number
  subjects?: DailyPlanSubject[]
}

export interface QuestionsEntry {
  id: string
  date: string
  subject: Subject
  chapter: string
  count: number
  correct: number
}

export const ACTIVITY_COLORS: Record<Activity, string> = {
  physics: '#2383e2',
  chemistry: '#0f8a5e',
  maths: '#d9730d',
  break: '#6b7280',
  sleep: '#374151',
  gym: '#8b5cf6',
  revision: '#f59e0b',
  mock_test: '#ef4444',
}

export const ACTIVITY_LABELS: Record<Activity, string> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  maths: 'Maths',
  break: 'Break',
  sleep: 'Sleep',
  gym: 'Gym',
  revision: 'Revision',
  mock_test: 'Mock Test',
}

export interface PaceResult {
  daysUntilFreeze: number
  remainingTopics: Record<Subject, number>
  requiredPace: Record<Subject, number>
  actualPace: Record<Subject, number>
  paceStatus: Record<Subject, 'on_track' | 'behind'>
  behindByDays: Record<Subject, number>
  currentPhase: 'foundation' | 'consolidation' | 'sprint'
  overallProgress: number
}

export interface Settings {
  name: string
  examDate: string
  dailyStudyHours: number
  theme: 'dark' | 'light'
  confettiEnabled: boolean
  freezeDays: number
  avatarUrl?: string
}
