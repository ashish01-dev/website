'use client'

import { create } from 'zustand'
import type { Achievement, BacklogItem } from '@/types'
import { ACHIEVEMENT_DEFS } from '@/types'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

interface GamificationState {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string
  totalStudyDays: number
  xp: number
  level: number
  achievements: Achievement[]
  loaded: boolean
  load: () => Promise<void>
  recordStudy: (minutes: number, subject?: string) => Promise<void>
  checkAchievements: () => Promise<void>
}

const XP_PER_MINUTE = 2
const XP_PER_CHAPTER = 50
const XP_PER_PYQ = 5
const XP_PER_TEST = 30
const BASE_XP_PER_LEVEL = 200
const XP_GROWTH = 1.5

export function calcLevel(xp: number) {
  let lvl = 1
  let needed = BASE_XP_PER_LEVEL
  let total = 0
  while (total + needed <= xp) {
    total += needed
    lvl++
    needed = Math.floor(needed * XP_GROWTH)
  }
  return { level: lvl, xpInLevel: xp - total, xpForNext: needed }
}

export function xpForLevel(lvl: number) {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_GROWTH, lvl - 1))
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  totalStudyDays: 0,
  xp: 0,
  level: 1,
  achievements: ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: false, progress: 0 })),
  loaded: false,

  load: async () => {
    try {
      const saved = await db.settings.get('gamification')
      if (saved?.value) {
        const data = saved.value as any
        set({
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          lastStudyDate: data.lastStudyDate || '',
          totalStudyDays: data.totalStudyDays || 0,
          xp: data.xp || 0,
          level: data.level || 1,
          achievements: data.achievements || ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: false, progress: 0 })),
          loaded: true,
        })
      } else {
        set({ loaded: true })
      }
      const { level } = calcLevel(get().xp)
      if (level !== get().level) set({ level })
    } catch { set({ loaded: true }) }
  },

  recordStudy: async (minutes: number, subject?: string) => {
    const state = get()
    const today = formatDate(new Date())
    const newXp = state.xp + minutes * XP_PER_MINUTE
    const { level } = calcLevel(newXp)

    let newStreak = state.currentStreak
    let newLongest = state.longestStreak
    let newTotal = state.totalStudyDays

    if (state.lastStudyDate !== today) {
      const yesterday = formatDate(new Date(Date.now() - 86400000))
      if (state.lastStudyDate === yesterday) {
        newStreak = state.currentStreak + 1
      } else {
        newStreak = 1
      }
      newLongest = Math.max(newLongest, newStreak)
      newTotal = state.totalStudyDays + 1
    }

    const update = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastStudyDate: today,
      totalStudyDays: newTotal,
      xp: newXp,
      level,
    }
    set(update)
    await db.settings.put({ id: 'gamification', value: update })
  },

  checkAchievements: async () => {
    const state = get()
    const updated = [...state.achievements]
    let changed = false

    const sessions = await db.studySessions.toArray()
    const backlog = await db.backlog.toArray()
    const pyqs = await db.pyqAttempts.toArray()
    const tests = await db.tests.toArray()
    const doneChapters = await db.progress.toArray()
    const doneCount = doneChapters.filter(c => c.status === 'done').length
    const totalMinutes = sessions.reduce((s, e) => s + e.duration, 0)

    const checks: Record<string, () => number> = {
      first_chapter: () => doneCount >= 1 ? 1 : 0,
      ten_chapters: () => Math.min(doneCount, 10),
      fifty_chapters: () => Math.min(doneCount, 50),
      seven_day_streak: () => Math.min(state.currentStreak, 7),
      thirty_day_streak: () => Math.min(state.currentStreak, 30),
      hundred_pyq: () => Math.min(pyqs.filter(p => p.status === 'correct').length, 100),
      first_test: () => tests.length >= 1 ? 1 : 0,
      ninety_plus: () => tests.some(t => t.accuracy >= 90) ? 1 : 0,
      hundred_hours: () => Math.min(Math.floor(totalMinutes / 60), 100),
      first_revision: () => backlog.filter(b => b.clearedAt).length >= 1 ? 1 : 0,
    }

    for (let i = 0; i < updated.length; i++) {
      const a = updated[i]
      const check = checks[a.id]
      if (check) {
        const progress = Math.min(check(), a.target)
        if (progress !== a.progress || (progress >= a.target && !a.unlocked)) {
          updated[i] = { ...a, progress, unlocked: progress >= a.target, unlockedAt: progress >= a.target && !a.unlocked ? new Date().toISOString() : a.unlockedAt }
          changed = true
        }
      }
    }

    if (changed) {
      set({ achievements: updated })
      const stateData = get()
      await db.settings.put({ id: 'gamification', value: { currentStreak: stateData.currentStreak, longestStreak: stateData.longestStreak, lastStudyDate: stateData.lastStudyDate, totalStudyDays: stateData.totalStudyDays, xp: stateData.xp, level: stateData.level, achievements: updated } })
    }
  },
}))
