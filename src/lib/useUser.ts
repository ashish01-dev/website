import { useEffect, useState } from 'react'
import { getSupabase } from './supabase'
import { useSettingsStore } from '@/store/settingsStore'

export const PRO_EMAILS = ['akash.social03@gmail.com']

export function isProEmail(email: string): boolean {
  return PRO_EMAILS.includes(email.toLowerCase())
}

export interface UserInfo {
  name: string
  avatar: string
  email: string
  isPro: boolean
}

export function useUser(): { user: UserInfo | null; loading: boolean } {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const settingsPro = useSettingsStore(s => s.settings.isPro)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) { setLoading(false); return }
    const updateUser = (u: any) => {
      if (u) {
        const meta = u.user_metadata || {}
        const email = u.email || ''
        const settingsIsPro = useSettingsStore.getState().settings.isPro
        setUser({
          name: meta.full_name || meta.name || meta.given_name || email.split('@')[0] || 'User',
          avatar: meta.avatar_url || meta.picture || '',
          email,
          isPro: isProEmail(email) || settingsIsPro || meta.isPro === true,
        })
      } else {
        setUser(null)
      }
    }
    sb.auth.getUser().then((res: { data: { user: any } }) => { updateUser(res.data.user); setLoading(false) })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e: string, session: any) => { updateUser(session?.user); if (!session) setLoading(false) })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setUser(prev => prev ? { ...prev, isPro: prev.isPro || settingsPro } : null)
  }, [settingsPro])

  return { user, loading }
}
