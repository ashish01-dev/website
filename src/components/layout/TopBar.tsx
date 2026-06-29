'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'

export default function TopBar() {
  const router = useRouter()
  const { settings, update } = useSettingsStore()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [liveTime, setLiveTime] = useState('')
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
    const update = () => setLiveTime(new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

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
      background: 'var(--c-topbar-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--c-border-card)',
    }}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between h-12 px-4 md:px-6">
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2.5 group"
          title="Settings"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{
            background: avatarUrl ? 'transparent' : 'var(--c-tag)',
            border: '1px solid var(--c-border)',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
                {(settings.name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[13px] font-medium leading-tight" style={{ color: 'var(--c-text)' }}>{settings.name || 'User'}</div>
            <div className="text-[10px] leading-tight" style={{ color: 'var(--c-muted)' }}>JEE 2027</div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
            title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {settings.theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <span className="text-[12px] font-mono tabular-nums" style={{ color: 'var(--c-muted)' }}>
            {liveTime}
          </span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--c-blue)' }}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--c-tag)', color: 'var(--c-text-secondary)' }}>
            {new Date(settings.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  )
}
