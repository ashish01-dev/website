'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'
import { useSidebarStore } from './Sidebar'
import { useUser } from '@/lib/useUser'

export default function TopBar() {
  const router = useRouter()
  const { settings, update } = useSettingsStore()
  const sidebarOpen = useSidebarStore(s => s.open)
  const setSidebarOpen = useSidebarStore(s => s.setOpen)
  const { user } = useUser()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [liveTime, setLiveTime] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isPermanent = !settings.sidebarAutoHide
  const isPro = user?.isPro ?? false

  const handleTriggerHover = () => {
    if (settings.sidebarHover) {
      hoverTimerRef.current = setTimeout(() => setSidebarOpen(true), 200)
    }
  }

  const handleTriggerLeave = () => {
    if (settings.sidebarHover) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }

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
    if (user?.avatar) setAvatarUrl(user.avatar)
  }, [user?.avatar])

  useEffect(() => {
    if (settings.avatarUrl) setAvatarUrl(settings.avatarUrl)
  }, [settings.avatarUrl])

  const handleSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out? Your data will remain saved and synced.')) return
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signOut()
    router.push('/')
  }

  const displayName = user?.name || settings.name || 'User'
  const displayAvatar = avatarUrl || user?.avatar || ''
  const displayInitial = displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30" style={{
      background: 'var(--c-topbar-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--c-border-card)',
      paddingLeft: 'var(--sidebar-w, 0px)',
      transition: 'padding-left 0.3s ease',
    }}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between h-12 px-4 md:px-6">
        {/* Left: hamburger + countdown + live time */}
        <div className="flex items-center gap-1">
          {!isPermanent && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              onMouseEnter={handleTriggerHover}
              onMouseLeave={handleTriggerLeave}
              className="sidebar-trigger w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
              title="Toggle navigation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="2" strokeLinecap="round">
                {sidebarOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          )}
          <span className="text-[13px] font-medium ml-1" style={{ color: 'var(--c-blue)' }}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium ml-1" style={{ background: 'var(--c-tag)', color: 'var(--c-text-secondary)' }}>
            {new Date(settings.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="text-[11px] font-mono tabular-nums ml-2" style={{ color: 'var(--c-muted)' }}>
            {liveTime}
          </span>
        </div>

        {/* Right: theme toggle + avatar dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
            title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {settings.theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200 hover:scale-105 focus:outline-none"
                style={{
                  background: displayAvatar ? 'transparent' : 'var(--c-tag)',
                  border: '2px solid var(--c-border)',
                  cursor: 'pointer',
                }}
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>{displayInitial}</span>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={6}
                align="end"
                className="z-50 min-w-[200px] rounded-xl overflow-hidden shadow-lg data-[state=open]:animate-scale-in"
                style={{
                  background: 'var(--c-card)',
                  border: '1px solid var(--c-border)',
                }}
              >
                <DropdownMenu.Item
                  onClick={() => { setDropdownOpen(false); router.push('/') }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  style={{ color: 'var(--c-text-secondary)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Go to Home
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => { setDropdownOpen(false); router.push('/pricing') }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  style={{ color: isPro ? 'var(--c-green)' : 'var(--c-blue)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {isPro ? 'Already Pro' : 'Buy Pro'}
                </DropdownMenu.Item>

                <DropdownMenu.Separator style={{ height: 1, background: 'var(--c-border)', margin: '4px 0' }} />

                <DropdownMenu.Item
                  onClick={() => { setDropdownOpen(false); router.push('/settings') }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  style={{ color: 'var(--c-text-secondary)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </DropdownMenu.Item>

                <DropdownMenu.Separator style={{ height: 1, background: 'var(--c-border)', margin: '4px 0' }} />

                <DropdownMenu.Item
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  style={{ color: 'var(--c-red)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}
