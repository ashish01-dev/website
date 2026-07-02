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

export interface TopicProgress {
  theoryDone: boolean
  practiceDone: boolean
  pyqDone: boolean
}

export interface ChapterProgress {
  status: 'not_started' | 'in_progress' | 'done'
  completedOn?: string
  topicStatus: Record<string, boolean>
  topicProgress?: Record<string, TopicProgress>
  customTopics?: Record<string, string>
  revisionCount: number
  lastRevised?: string
  estimatedHours?: number
  actualHours?: number
  studySessions: number
  difficulty?: 'easy' | 'medium' | 'hard'
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
  fileCode?: string
  gdriveFileId?: string
  uploadedAt: string
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
  theory?: number
  practice?: number
  pyq?: number
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
  sidebarHover: boolean
  onboarded: boolean
  changelogSeenVersion: string
  showChangelog: boolean
  storageWarningShown: boolean
  autoPlanPopup: boolean
  isPro: boolean
  proExpiryDate?: string
  tourCompleted?: boolean
  language?: Language
  backlogReminder?: boolean
}

export type ChapterFilter = 'all' | 'not_started' | 'in_progress' | 'done' | 'revision_pending' | 'high_weightage' | 'weak' | 'high_priority'

export type SortOption = 'default' | 'name' | 'progress' | 'weightage' | 'revision_gap'

export interface RoadmapStage {
  id: string
  name: string
  description: string
  icon: string
  estimatedWeeks: number
  remainingWeeks: number
  progress: number
  chaptersPending: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress: number
  target: number
}

export interface StudySession {
  id: string
  date: string
  startTime: number
  duration: number
  subject: Subject
  chapter?: string
  type: 'lecture' | 'practice' | 'revision' | 'test'
  notes?: string
}

export interface GamificationData {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string
  totalStudyDays: number
  xp: number
  level: number
  achievements: Achievement[]
}

export interface BacklogItem {
  id: string
  chapterId: string
  chapterName: string
  subject: Subject
  type: 'theory' | 'pyq' | 'dpp' | 'revision'
  createdAt: string
  clearedAt?: string
  dueDate: string
  notes?: string
}

export interface PYQAttempt {
  id: string
  year: number
  session: 'january' | 'april'
  subject: Subject
  chapterId: string
  chapterName: string
  question: string
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  status: 'pending' | 'correct' | 'wrong' | 'bookmarked'
  attemptedAt?: string
  timeTaken?: number
  topic?: string
}

export type Language = 'en' | 'hi'

export const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  { id: 'first_chapter', name: 'First Step', description: 'Complete your first chapter', icon: '🎯', target: 1 },
  { id: 'ten_chapters', name: 'Chapter Champion', description: 'Complete 10 chapters', icon: '📚', target: 10 },
  { id: 'fifty_chapters', name: 'Syllabus Master', description: 'Complete 50 chapters', icon: '🏆', target: 50 },
  { id: 'seven_day_streak', name: 'Week Warrior', description: 'Study 7 days in a row', icon: '🔥', target: 7 },
  { id: 'thirty_day_streak', name: 'Monthly Legend', description: 'Study 30 days in a row', icon: '💎', target: 30 },
  { id: 'hundred_pyq', name: 'PYQ Pro', description: 'Solve 100 previous year questions', icon: '📝', target: 100 },
  { id: 'first_test', name: 'Test Taker', description: 'Log your first mock test', icon: '📋', target: 1 },
  { id: 'ninety_plus', name: 'Top Scorer', description: 'Score 90%+ in a mock test', icon: '⭐', target: 1 },
  { id: 'hundred_hours', name: 'Century', description: 'Study 100 hours total', icon: '⏰', target: 100 },
  { id: 'first_revision', name: 'Revision Ready', description: 'Complete your first revision cycle', icon: '🔄', target: 1 },
]
