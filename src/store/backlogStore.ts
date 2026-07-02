'use client'

import { create } from 'zustand'
import type { BacklogItem, Subject } from '@/types'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

interface BacklogState {
  items: BacklogItem[]
  loaded: boolean
  load: () => Promise<void>
  add: (item: Omit<BacklogItem, 'id' | 'createdAt' | 'clearedAt'>) => Promise<void>
  clear: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  getDueItems: () => BacklogItem[]
}

export const useBacklogStore = create<BacklogState>((set, get) => ({
  items: [],
  loaded: false,

  load: async () => {
    try {
      const items = await db.backlog.toArray()
      set({ items, loaded: true })
    } catch { set({ loaded: true }) }
  },

  add: async (item) => {
    const id = `bl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const today = formatDate(new Date())
    const newItem: BacklogItem = {
      ...item,
      id,
      createdAt: today,
      dueDate: item.dueDate || today,
    }
    await db.backlog.add(newItem)
    set({ items: [...get().items, newItem] })
  },

  clear: async (id: string) => {
    const items = get().items.map(i =>
      i.id === id ? { ...i, clearedAt: formatDate(new Date()) } : i
    )
    set({ items })
    const item = items.find(i => i.id === id)
    if (item) await db.backlog.put(item)
  },

  remove: async (id: string) => {
    set({ items: get().items.filter(i => i.id !== id) })
    await db.backlog.delete(id)
  },

  getDueItems: () => {
    const today = formatDate(new Date())
    return get().items.filter(i => !i.clearedAt && i.dueDate <= today)
  },
}))
