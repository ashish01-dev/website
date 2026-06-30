import { create } from 'zustand'
import type { UserProgress, Subject, ChapterProgress, Topic, TopicProgress, Chapter, ChapterFilter, SortOption } from '@/types'
import { db } from '@/lib/db'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

/** Get all chapters for a subject from syllabus + custom chapters */
async function getAllChapters(subject: Subject): Promise<Chapter[]> {
  const data = syllabus[subject]
  const builtIn: Chapter[] = []
  for (const div of data.divisions) {
    for (const ch of div.chapters) {
      if (!ch.deleted) builtIn.push(ch)
    }
  }
  const custom = await db.customChapters.toArray()
  return [...builtIn, ...custom.filter(c => !c.deleted)]
}

interface ProgressState {
  progress: UserProgress
  customChapters: Chapter[]
  loaded: boolean
  load: () => Promise<void>
  loadCustomChapters: () => Promise<void>
  setTopicDone: (chapterId: string, topicId: string, done: boolean) => Promise<void>
  setTopicProgress: (chapterId: string, topicId: string, field: keyof TopicProgress, done: boolean) => Promise<void>
  setChapterStatus: (chapterId: string, status: ChapterProgress['status']) => Promise<void>
  markAllTopics: (chapterId: string) => Promise<void>
  addCustomTopic: (chapterId: string, topicName: string) => Promise<string>
  incrementRevision: (chapterId: string) => Promise<void>
  incrementStudySession: (chapterId: string) => Promise<void>
  addChapter: (chapter: Chapter) => Promise<string>
  deleteChapter: (chapterId: string) => Promise<void>
  updateChapterOrder: (subject: Subject, order: string[]) => Promise<void>
  getProgress: (subject: Subject) => number
  getSubjectChapters: (subject: Subject) => { total: number; done: number }
  getFilteredChapters: (subject: Subject, filter: ChapterFilter, sort: SortOption, search: string) => Promise<Chapter[]>
  getTotalChapters: () => { total: number; done: number }
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},
  customChapters: [],
  loaded: false,
  load: async () => {
    try {
      const all = await db.progress.toArray()
      const merged: UserProgress = {}
      for (const item of all) {
        merged[item.chapterId] = {
          ...item,
          revisionCount: item.revisionCount ?? 0,
          studySessions: item.studySessions ?? 0,
          topicProgress: item.topicProgress ?? {},
        }
      }
      set({ progress: merged, loaded: true })
    } catch (err) { console.error('progress.load:', err); set({ loaded: true }) }
  },
  loadCustomChapters: async () => {
    const chs = await db.customChapters.toArray()
    set({ customChapters: chs })
  },
  setTopicDone: async (chapterId, topicId, done) => {
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {}, revisionCount: 0, studySessions: 0 }
    entry.topicStatus[topicId] = done
    if (done) entry.status = 'in_progress'
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch {}
  },
  setTopicProgress: async (chapterId, topicId, field, done) => {
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {}, topicProgress: {}, revisionCount: 0, studySessions: 0 }
    if (!entry.topicProgress) entry.topicProgress = {}
    if (!entry.topicProgress[topicId]) entry.topicProgress[topicId] = { theoryDone: false, practiceDone: false, pyqDone: false }
    entry.topicProgress[topicId] = { ...entry.topicProgress[topicId], [field]: done }
    if (done) entry.status = 'in_progress'
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch {}
  },
  addCustomTopic: async (chapterId, topicName) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {}, customTopics: {}, revisionCount: 0, studySessions: 0 }
    if (!entry.customTopics) entry.customTopics = {}
    entry.customTopics[id] = topicName
    entry.topicStatus[id] = false
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch {}
    return id
  },
  setChapterStatus: async (chapterId, status) => {
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {}, revisionCount: 0, studySessions: 0 }
    entry.status = status
    if (status === 'done') entry.completedOn = new Date().toISOString().split('T')[0]
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch {}
  },
  markAllTopics: async (chapterId) => {
    const entry: ChapterProgress = { status: 'done', completedOn: new Date().toISOString().split('T')[0], topicStatus: {}, revisionCount: 0, studySessions: 0 }
    for (const subj of Object.values(syllabus)) {
      if (!subj?.divisions) continue
      for (const d of subj.divisions) {
        for (const ch of d.chapters) {
          if (ch.id === chapterId) ch.topics.forEach((t: Topic) => { entry.topicStatus[t.id] = true })
        }
      }
    }
    for (const c of get().customChapters) {
      if (c.id === chapterId) c.topics.forEach((t: Topic) => { entry.topicStatus[t.id] = true })
    }
    set({ progress: { ...get().progress, [chapterId]: entry } })
    try { await db.progress.put({ chapterId, ...entry }) } catch {}
  },
  incrementRevision: async (chapterId) => {
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {}, revisionCount: 0, studySessions: 0 }
    entry.revisionCount = (entry.revisionCount ?? 0) + 1
    entry.lastRevised = new Date().toISOString()
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch {}
  },
  incrementStudySession: async (chapterId) => {
    const entry = get().progress[chapterId] || { status: 'not_started', topicStatus: {}, revisionCount: 0, studySessions: 0 }
    entry.studySessions = (entry.studySessions ?? 0) + 1
    const updated = { ...get().progress, [chapterId]: entry }
    set({ progress: updated })
    try { await db.progress.put({ chapterId, ...entry }) } catch {}
  },
  addChapter: async (chapter) => {
    await db.customChapters.put(chapter)
    await get().loadCustomChapters()
    return chapter.id
  },
  deleteChapter: async (chapterId) => {
    await db.progress.delete(chapterId)
    const entry = await db.customChapters.get(chapterId)
    if (entry) {
      entry.deleted = true
      await db.customChapters.put(entry)
    }
    await get().loadCustomChapters()
    const { progress } = get()
    const updated = { ...progress }
    delete updated[chapterId]
    set({ progress: updated })
  },
  updateChapterOrder: async (subject, order) => {
    await db.settings.put({ id: `order_${subject}`, value: order })
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
  getFilteredChapters: async (subject, filter, sort, search) => {
    const { progress } = get()
    const all = await getAllChapters(subject)
    let chapters = all

    if (search) {
      const q = search.toLowerCase()
      chapters = chapters.filter(ch => ch.name.toLowerCase().includes(q))
    }

    switch (filter) {
      case 'not_started':
        chapters = chapters.filter(ch => (progress[ch.id]?.status ?? 'not_started') === 'not_started')
        break
      case 'in_progress':
        chapters = chapters.filter(ch => progress[ch.id]?.status === 'in_progress')
        break
      case 'done':
        chapters = chapters.filter(ch => progress[ch.id]?.status === 'done')
        break
      case 'revision_pending': {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        chapters = chapters.filter(ch => {
          const p = progress[ch.id]
          if (!p || p.status !== 'done') return false
          const lastRev = p.lastRevised ? new Date(p.lastRevised).getTime() : 0
          return lastRev < thirtyDaysAgo || !p.lastRevised
        })
        break
      }
      case 'high_weightage':
        chapters = chapters.filter(ch => ch.weightage === 'high')
        break
      case 'weak': {
        chapters = chapters.filter(ch => {
          const p = progress[ch.id]
          if (!p || p.status !== 'in_progress') return false
          const topics = ch.topics.filter(t => !t.deleted)
          if (!topics.length) return false
          const doneCount = topics.filter(t => p.topicStatus[t.id]).length
          return doneCount / topics.length < 0.4
        })
        break
      }
      case 'high_priority': {
        chapters.sort((a, b) => {
          const pA = progress[a.id]
          const pB = progress[b.id]
          const weightOrder = { high: 3, medium: 2, low: 1 }
          const wA = weightOrder[a.weightage as keyof typeof weightOrder] || 0
          const wB = weightOrder[b.weightage as keyof typeof weightOrder] || 0
          const gapA = pA?.lastRevised ? (Date.now() - new Date(pA.lastRevised).getTime()) / (1000 * 86400) : 30
          const gapB = pB?.lastRevised ? (Date.now() - new Date(pB.lastRevised).getTime()) / (1000 * 86400) : 30
          return (wB * gapB) - (wA * gapA)
        })
        return chapters
      }
    }

    switch (sort) {
      case 'name':
        chapters.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'progress': {
        chapters.sort((a, b) => {
          const pA = progress[a.id]
          const pB = progress[b.id]
          const dA = pA ? Object.values(pA.topicStatus).filter(Boolean).length : 0
          const dB = pB ? Object.values(pB.topicStatus).filter(Boolean).length : 0
          return dB - dA
        })
        break
      }
      case 'weightage': {
        const wOrder = { high: 0, medium: 1, low: 2 }
        chapters.sort((a, b) => (wOrder[a.weightage as keyof typeof wOrder] || 3) - (wOrder[b.weightage as keyof typeof wOrder] || 3))
        break
      }
      case 'revision_gap': {
        chapters.sort((a, b) => {
          const pA = progress[a.id]
          const pB = progress[b.id]
          const gapA = pA?.lastRevised ? (Date.now() - new Date(pA.lastRevised).getTime()) : Infinity
          const gapB = pB?.lastRevised ? (Date.now() - new Date(pB.lastRevised).getTime()) : Infinity
          return gapB - gapA
        })
        break
      }
    }

    const storedOrder = await db.settings.get(`order_${subject}`)
    if (storedOrder && sort === 'default') {
      const order = storedOrder.value as string[]
      const map = new Map(chapters.map(ch => [ch.id, ch] as const))
      const ordered = order.map(id => map.get(id)).filter(Boolean) as Chapter[]
      const remaining = chapters.filter(ch => !order.includes(ch.id))
      chapters = [...ordered, ...remaining]
    }

    return chapters
  },
  getTotalChapters: () => {
    const { progress } = get()
    let total = 0, done = 0
    for (const subj of Object.values(syllabus)) {
      if (!subj?.divisions) continue
      for (const div of subj.divisions) {
        for (const ch of div.chapters) {
          if (ch.deleted) continue
          total++
          if (progress[ch.id]?.status === 'done') done++
        }
      }
    }
    return { total, done }
  },
}))
