import { useEffect, useState } from 'react'
import { getSupabase } from './supabase'

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

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    const updateUser = (u: any) => {
      if (u) {
        const meta = u.user_metadata || {}
        const email = u.email || ''
        setUser({
          name: meta.full_name || meta.name || meta.given_name || email.split('@')[0] || 'User',
          avatar: meta.avatar_url || meta.picture || '',
          email,
          isPro: isProEmail(email),
        })
      } else {
        setUser(null)
      }
    }
    sb.auth.getUser().then((res: { data: { user: any } }) => updateUser(res.data.user))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e: string, session: any) => updateUser(session?.user))
    return () => subscription.unsubscribe()
  }, [])

  return user
}
