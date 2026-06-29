import { create } from 'zustand'
import type { UserProgress, Subject, ChapterProgress, Topic } from '@/types'
import { db } from '@/lib/db'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

interface ProgressState {
  progress: UserProgress
  loaded: boolean
  load: () => Promise<void>
  setTopicDone: (chapterId: string, topicId: string, done: boolean) => Promise<void>
  setChapterStatus: (chapterId: string, status: ChapterProgress['status']) => Promise<void>
  markAllTopics: (chapterId: string) => Promise<void>
  addCustomTopic: (chapterId: string, topicName: string) => Promise<string>
  getProgress: (subject: Subject) => number
  getSubjectChapters: (subject: Subject) => { total: number; done: number }
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},
  loaded: false,
  load: async () => {
    try {
      const all = await db.progress.toArray()
      const merged: UserProgress = {}
      for (const item of all) { merged[item.chapterId] = item }
      set({ progress: merged, loaded: true })
    } catch (err) { console.error('progress.load:', err); set({ loaded: true }) }
  },
  setTopicDone: async (chapterId, topicId, done) => {
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {} }
    entry.topicStatus[topicId] = done
    if (done) entry.status = 'in_progress'
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch (err) { console.error('progress.setTopicDone:', err) }
  },
  addCustomTopic: async (chapterId, topicName) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {}, customTopics: {} }
    if (!entry.customTopics) entry.customTopics = {}
    entry.customTopics[id] = topicName
    entry.topicStatus[id] = false
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch (err) { console.error('progress.addCustomTopic:', err) }
    return id
  },
  setChapterStatus: async (chapterId, status) => {
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {} }
    entry.status = status
    if (status === 'done') entry.completedOn = new Date().toISOString().split('T')[0]
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch (err) { console.error('progress.setChapterStatus:', err) }
  },
  markAllTopics: async (chapterId) => {
    const entry: ChapterProgress = { status: 'done', completedOn: new Date().toISOString().split('T')[0], topicStatus: {} }
    for (const subj of Object.values(syllabus)) {
      if (!subj?.divisions) continue
      for (const d of subj.divisions) {
        for (const ch of d.chapters) {
          if (ch.id === chapterId) ch.topics.forEach((t: Topic) => { entry.topicStatus[t.id] = true })
        }
      }
    }
    set({ progress: { ...get().progress, [chapterId]: entry } })
    try { await db.progress.put({ chapterId, ...entry }) } catch (err) { console.error('progress.markAllTopics:', err) }
  },
  getProgress: (subject) => {
    const { progress } = get()
    const data = syllabus[subject]
    let done = 0, total = 0
    for (const div of data.divisions) {
      for (const ch of div.chapters) {
        if (ch.deleted) continue
        total++
        if (progress[ch.id]?.status === 'done') done++
      }
    }
    return total > 0 ? Math.round((done / total) * 100) : 0
  },
  getSubjectChapters: (subject) => {
    const { progress } = get()
    const data = syllabus[subject]
    let done = 0, total = 0
    for (const div of data.divisions) {
      for (const ch of div.chapters) {
        if (ch.deleted) continue
        total++
        if (progress[ch.id]?.status === 'done') done++
      }
    }
    return { total, done }
  },
}))
