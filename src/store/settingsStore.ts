import { create } from 'zustand'
import type { Settings } from '@/types'
import { db, dexie } from '@/lib/db'

interface SettingsState {
  settings: Settings
  loaded: boolean
  load: () => Promise<void>
  update: (partial: Partial<Settings>) => Promise<void>
  reset: () => Promise<void>
}

const DEFAULT_SETTINGS: Settings = {
  name: '',
  examDate: '2027-01-22',
  dailyStudyHours: 9,
  theme: 'dark',
  confettiEnabled: true,
  freezeDays: 21,
  avatarUrl: '',
  sidebarHover: false,
  onboarded: false,
  changelogSeenVersion: '',
  showChangelog: true,
  storageWarningShown: false,
  autoPlanPopup: true,
  isPro: false,
  proExpiryDate: undefined,
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    try {
      const saved = await db.settings.get('main')
      const merged = saved?.value ? { ...DEFAULT_SETTINGS, ...(saved.value as Partial<Settings>) } : DEFAULT_SETTINGS
      const LAUNCH_OFFER_EXPIRY = '2026-07-31T23:59:59.999Z'
      /* Grant Pro launch offer to anyone without an existing expiry */
      if (!merged.proExpiryDate && new Date() < new Date(LAUNCH_OFFER_EXPIRY)) {
        merged.isPro = true
        merged.proExpiryDate = LAUNCH_OFFER_EXPIRY
        await db.settings.put({ id: 'main', value: merged })
        const sb = (await import('@/lib/supabase')).getSupabase()
        if (sb) sb.auth.updateUser({ data: { isPro: true, proExpiryDate: LAUNCH_OFFER_EXPIRY } }).catch(() => {})
      }
      /* Auto-downgrade if Pro has expired */
      if (merged.isPro && merged.proExpiryDate && new Date(merged.proExpiryDate) < new Date()) {
        merged.isPro = false
        merged.proExpiryDate = undefined
        await db.settings.put({ id: 'main', value: merged })
        const sb = (await import('@/lib/supabase')).getSupabase()
        if (sb) sb.auth.updateUser({ data: { isPro: false } }).catch(() => {})
      }
      set({ settings: merged, loaded: true })
    } catch (err) { console.error('settings.load:', err); set({ loaded: true }) }
  },
  update: async (partial: Partial<Settings>) => {
    const current = get().settings
    const updated = { ...current, ...partial }
    set({ settings: updated })
    try {
      await db.settings.put({ id: 'main', value: updated })
      localStorage.setItem('jee-theme', updated.theme)
    } catch (err) { console.error('settings.update:', err) }
    if (partial.theme) {
      document.documentElement.classList.toggle('dark', updated.theme === 'dark')
      document.documentElement.classList.toggle('light', updated.theme === 'light')
    }
  },
  reset: async () => {
    const prevVersion = get().settings.changelogSeenVersion
    set({ settings: { ...DEFAULT_SETTINGS, changelogSeenVersion: prevVersion } })
    try {
      await dexie.settings.delete('main')
      localStorage.removeItem('jee-theme')
    } catch (err) { console.error('settings.reset:', err) }
  },
}))