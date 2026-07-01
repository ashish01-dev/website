import type { Subject, DailyPlanSubject, QuestionsEntry, DailyLog, ChapterProgress } from '@/types'
import { db } from './db'
import { generateId, formatDate } from './utils'

export type ActionResult = { success: boolean; message: string; data?: unknown }

const TODAY = formatDate(new Date())

export const AVAILABLE_TOOLS = [
  {
    name: 'add_to_daily_plan',
    description: 'Add study items to daily plan for a specific date. Creates or updates the plan for that day.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.' },
        subject: { type: 'string', enum: ['physics', 'chemistry', 'maths'], description: 'Subject name' },
        chapters: { type: 'array', items: { type: 'string' }, description: 'Chapter names to add' },
        questions: { type: 'integer', description: 'Number of questions to plan' },
      },
      required: ['subject', 'chapters'],
    },
  },
  {
    name: 'log_questions',
    description: 'Log questions solved for a subject/chapter on a specific date. Updates the question log and daily log.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
        subject: { type: 'string', enum: ['physics', 'chemistry', 'maths'], description: 'Subject' },
        chapter: { type: 'string', description: 'Chapter name' },
        count: { type: 'integer', description: 'Number of questions solved' },
        correct: { type: 'integer', description: 'Number of correct answers' },
      },
      required: ['subject', 'chapter', 'count'],
    },
  },
  {
    name: 'log_study_hours',
    description: 'Log study hours for a specific date. Creates or updates the daily log entry.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
        minutes: { type: 'integer', description: 'Minutes studied' },
      },
      required: ['minutes'],
    },
  },
  {
    name: 'update_chapter_progress',
    description: 'Mark a chapter as completed or update its topic progress.',
    parameters: {
      type: 'object',
      properties: {
        chapterId: { type: 'string', description: 'The chapter ID from the syllabus' },
        status: { type: 'string', enum: ['not_started', 'in_progress', 'done'], description: 'New status' },
        topicProgress: { type: 'object', description: 'Object mapping topic IDs to boolean completion status' },
      },
      required: ['chapterId', 'status'],
    },
  },
  {
    name: 'get_dashboard_summary',
    description: 'Get a summary of the user current dashboard state: overall progress, today plan, recent activity.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
]

export async function executeToolCall(name: string, args: Record<string, unknown>): Promise<ActionResult> {
  switch (name) {
    case 'add_to_daily_plan':
      return addToDailyPlan(args as any)
    case 'log_questions':
      return logQuestions(args as any)
    case 'log_study_hours':
      return logStudyHours(args as any)
    case 'update_chapter_progress':
      return updateChapterProgress(args as any)
    case 'get_dashboard_summary':
      return getDashboardSummary()
    default:
      return { success: false, message: `Unknown tool: ${name}` }
  }
}

async function addToDailyPlan(args: { date?: string; subject: string; chapters: string[]; questions?: number }): Promise<ActionResult> {
  try {
    const date = args.date || TODAY
    const sub = args.subject as Subject
    const existing = await db.dailyPlans.get(date)
    const entry: DailyPlanSubject = {
      subject: sub,
      chapters: args.chapters,
      questions: args.questions || 0,
    }
    const subjects = existing?.subjects || []
    const existingIdx = subjects.findIndex(s => s.subject === sub)
    if (existingIdx >= 0) {
      const mergedChapters = subjects[existingIdx].chapters.concat(args.chapters.filter(c => !subjects[existingIdx].chapters.includes(c)))
      subjects[existingIdx] = { ...subjects[existingIdx], ...entry, chapters: mergedChapters }
    } else {
      subjects.push(entry)
    }
    await db.dailyPlans.put({ date, subjects })
    return { success: true, message: `Added ${args.chapters.join(', ')} to ${date} daily plan.` }
  } catch (err) {
    return { success: false, message: `Failed to add to daily plan: ${err}` }
  }
}

async function logQuestions(args: { date?: string; subject: string; chapter: string; count: number; correct?: number }): Promise<ActionResult> {
  try {
    const date = args.date || TODAY
    await db.questions.put({
      id: generateId(),
      date,
      subject: args.subject as Subject,
      chapter: args.chapter,
      count: args.count,
      correct: args.correct || 0,
    })
    const existingLog = await db.dailyLogs.get(date)
    const logEntry: DailyLog = {
      date,
      studyMinutes: existingLog?.studyMinutes || 0,
      chaptersCompleted: existingLog?.chaptersCompleted || [],
      questionsAttempted: (existingLog?.questionsAttempted || 0) + args.count,
      pomodoroSessions: existingLog?.pomodoroSessions || 0,
    }
    await db.dailyLogs.put(logEntry)
    return { success: true, message: `Logged ${args.count} questions for ${args.chapter}.` }
  } catch (err) {
    return { success: false, message: `Failed to log questions: ${err}` }
  }
}

async function logStudyHours(args: { date?: string; minutes: number }): Promise<ActionResult> {
  try {
    const date = args.date || TODAY
    const existing = await db.dailyLogs.get(date)
    const entry: DailyLog = {
      date,
      studyMinutes: (existing?.studyMinutes || 0) + args.minutes,
      chaptersCompleted: existing?.chaptersCompleted || [],
      questionsAttempted: existing?.questionsAttempted || 0,
      pomodoroSessions: existing?.pomodoroSessions || 0,
    }
    await db.dailyLogs.put(entry)
    return { success: true, message: `Logged ${args.minutes} minutes of study for ${date}.` }
  } catch (err) {
    return { success: false, message: `Failed to log study hours: ${err}` }
  }
}

async function updateChapterProgress(args: { chapterId: string; status: string; topicProgress?: Record<string, boolean> }): Promise<ActionResult> {
  try {
    const existing = await db.progress.get(args.chapterId)
      const updated: ChapterProgress & { chapterId: string } = {
        chapterId: args.chapterId,
        status: args.status as ChapterProgress['status'],
        topicStatus: { ...(existing?.topicStatus || {}), ...(args.topicProgress || {}) },
        lastRevised: args.status === 'done' ? new Date().toISOString() : existing?.lastRevised,
        revisionCount: existing?.revisionCount || 0,
        customTopics: existing?.customTopics,
        studySessions: existing?.studySessions || 0,
      }
    await db.progress.put(updated)
    return { success: true, message: `Chapter progress updated to ${args.status}.` }
  } catch (err) {
    return { success: false, message: `Failed to update progress: ${err}` }
  }
}

async function getDashboardSummary(): Promise<ActionResult> {
  try {
    const todayPlan = await db.dailyPlans.get(TODAY)
    const todayLog = await db.dailyLogs.get(TODAY)
    const totalQuestions = (await db.questions.toArray()).reduce((a, q) => a + q.count, 0)
    return {
      success: true,
      message: 'Dashboard summary retrieved.',
      data: {
        todayPlan: todayPlan?.subjects?.map(s => ({ subject: s.subject, chapters: s.chapters, questions: s.questions })) || [],
        todayStudyMinutes: todayLog?.studyMinutes || 0,
        todayQuestions: todayLog?.questionsAttempted || 0,
        totalQuestionsLogged: totalQuestions,
      },
    }
  } catch (err) {
    return { success: false, message: `Failed to get dashboard summary: ${err}` }
  }
}
