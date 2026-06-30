'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'

export default function TopBar() {
  const router = useRouter()
  const { settings, update } = useSettingsStore()
  const { user } = useUser()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const isPro = user?.isPro ?? false
  const displayName = user?.name || settings.name || 'User'
  const firstName = displayName.split(' ')[0]
  const displayAvatar = settings.avatarUrl || user?.avatar || ''
  const displayInitial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    const fn = () => {
      const diff = new Date(settings.examDate).getTime() - Date.now()
      if (diff > 0) setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      })
    }
    fn(); const id = setInterval(fn, 60000); return () => clearInterval(id)
  }, [settings.examDate])

  const handleSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out? Your data will remain saved and synced.')) return
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signOut()
    router.push('/')
  }

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)

  const handleFeedbackSubmit = async () => {
    const text = feedbackText.trim()
    if (!text || sendingFeedback) return
    setSendingFeedback(true)
    window.location.href = `mailto:ashish.jayshreeram@gmail.com?subject=JEEIFY%20Feedback&body=${encodeURIComponent(text)}`
    setTimeout(() => { setSendingFeedback(false); setShowFeedback(false); setFeedbackText('') }, 1000)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) update({ examDate: e.target.value })
  }

  return (
    <>
    <header className="sticky top-0 z-30" style={{
      background: 'var(--c-topbar-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--c-border-card)',
      paddingLeft: 'var(--sidebar-w, 0px)',
      transition: 'padding-left 0.3s ease',
    }}>
      <div className="max-w-[1000px] mx-auto flex items-center justify-between h-12 px-4 md:px-6">
        {/* Left: hamburger + live time + days left + clickable date */}
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-medium" style={{ color: 'var(--c-blue)' }}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
          <button
            onClick={() => dateInputRef.current?.showPicker()}
            className="text-[11px] px-2 py-0.5 rounded-full font-medium ml-0.5 transition-all hover:opacity-80 active:scale-95"
            style={{ background: 'var(--c-tag)', color: 'var(--c-text-secondary)', cursor: 'pointer' }}
            title="Click to change exam date"
          >
            {new Date(settings.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </button>
          <input ref={dateInputRef} type="date" value={settings.examDate} onChange={handleDateChange}
            className="absolute opacity-0 pointer-events-none" style={{ width: 0, height: 0 }} aria-hidden />
        </div>

        {/* Right: theme toggle + Hi Name + avatar dropdown */}
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

          <button onClick={() => setShowFeedback(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
            title="Send feedback"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>

          <span className="text-[12px] font-medium hidden sm:block" style={{ color: 'var(--c-text-secondary)' }}>
            Hi, {firstName}
          </span>

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
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" loading="lazy" />
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
                style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)' }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{displayName}</span>
                    {isPro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--c-blue)' }}>PRO</span>}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>{user?.email || ''}</div>
                </div>

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

      {/* Feedback popup */}
      {showFeedback && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => { if (!sendingFeedback) { setShowFeedback(false); setFeedbackText('') } }}>
          <div className="max-w-sm w-full mx-4 rounded-[18px] p-5 animate-scale-in" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)',
          }} onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>Send Feedback</h3>
            <p className="text-[11px] mb-3" style={{ color: 'var(--c-caption)' }}>Help us improve JEEIFY.</p>
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={4} placeholder="Share your thoughts, report a bug, or suggest a feature..."
              className="w-full px-3.5 py-2.5 text-sm outline-none rounded-xl resize-none transition-all"
              style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
            />
            <div className="flex items-center gap-2 mt-3">
              <button onClick={handleFeedbackSubmit} disabled={!feedbackText.trim() || sendingFeedback}
                className="flex-1 text-xs font-medium py-2 rounded-[40px] text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--c-btn-primary)' }}
              >{sendingFeedback ? 'Sending...' : 'Send Feedback'}</button>
              <button onClick={() => { setShowFeedback(false); setFeedbackText('') }} disabled={sendingFeedback}
                className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
