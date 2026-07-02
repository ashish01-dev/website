'use client'

import { create } from 'zustand'
import type { PYQAttempt, Subject } from '@/types'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

interface PYQState {
  attempts: PYQAttempt[]
  loaded: boolean
  load: () => Promise<void>
  recordAttempt: (attempt: Omit<PYQAttempt, 'id' | 'attemptedAt'>) => Promise<void>
  toggleBookmark: (id: string) => Promise<void>
  getByChapter: (chapterId: string) => PYQAttempt[]
  getStats: () => { total: number; correct: number; wrong: number; bookmarked: number }
}

export const usePYQStore = create<PYQState>((set, get) => ({
  attempts: [],
  loaded: false,

  load: async () => {
    try {
      const raw = await db.pyqAttempts.toArray()
      const attempts: PYQAttempt[] = raw.map(a => ({ ...a, status: (a.status || 'pending') as PYQAttempt['status'] }))
      set({ attempts, loaded: true })
    } catch { set({ loaded: true }) }
  },

  recordAttempt: async (attempt) => {
    const id = `pyq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newAttempt: PYQAttempt = {
      ...attempt,
      id,
      attemptedAt: formatDate(new Date()),
    }
    await db.pyqAttempts.add(newAttempt)
    set({ attempts: [...get().attempts, newAttempt] })
  },

  toggleBookmark: async (id: string) => {
    const items: PYQAttempt[] = get().attempts.map(a => {
      if (a.id !== id) return a
      const newStatus: PYQAttempt['status'] = a.status === 'bookmarked' ? 'pending' : 'bookmarked'
      return { ...a, status: newStatus }
    })
    set({ attempts: items })
    const item = items.find(a => a.id === id)
    if (item) await db.pyqAttempts.put(item)
  },

  getByChapter: (chapterId: string) => get().attempts.filter(a => a.chapterId === chapterId),

  getStats: () => {
    const all = get().attempts
    return {
      total: all.length,
      correct: all.filter(a => a.status === 'correct').length,
      wrong: all.filter(a => a.status === 'wrong').length,
      bookmarked: all.filter(a => a.status === 'bookmarked').length,
    }
  },
}))
