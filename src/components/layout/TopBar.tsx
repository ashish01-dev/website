'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'

export default function TopBar() {
  const router = useRouter()
  const { settings } = useSettingsStore()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(settings.examDate).getTime() - Date.now()
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
        })
      }
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [settings.examDate])

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then((res: any) => {
      const u = res.data?.user
      if (u?.user_metadata?.avatar_url) setAvatarUrl(u.user_metadata.avatar_url)
    })
  }, [])

  useEffect(() => {
    if (settings.avatarUrl) setAvatarUrl(settings.avatarUrl)
  }, [settings.avatarUrl])

  return (
    <header className="sticky top-0 z-30" style={{
      background: 'rgba(245,245,245,0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between h-12 px-4 md:px-6">
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2.5 group"
          title="Settings"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{
            background: avatarUrl ? 'transparent' : '#eaecf0',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold" style={{ color: '#888' }}>
                {(settings.name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[13px] font-medium leading-tight" style={{ color: '#0f0f0f' }}>{settings.name || 'User'}</div>
            <div className="text-[10px] leading-tight" style={{ color: '#888' }}>JEE 2027</div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium" style={{ color: '#2383e2' }}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: '#eaecf0', color: '#555' }}>
            {new Date(settings.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  )
}
