'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useSettingsStore } from '@/store/settingsStore'
import { db } from '@/lib/db'
import { downloadJSON } from '@/lib/utils'
import { getSupabase } from '@/lib/supabase'
import { setSyncUser, uploadAvatar } from '@/lib/supabase-sync'
import { isProEmail } from '@/lib/useUser'
import { estimateStorageUsage, formatBytes, getStorageLimit } from '@/lib/storage'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = Math.min(img.width, img.height, maxSize)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas not available')); return }
        ctx.drawImage(img, x, y, size, size, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function SettingsPage() {
  const router = useRouter()
  const { settings, update } = useSettingsStore()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [storageUsage, setStorageUsage] = useState<{ syncDataBytes: number; storageBytes: number; totalBytes: number; limitBytes: number; percentUsed: number } | null>(null)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then((res: { data: { user: User | null } }) => {
      setUser(res.data.user)
      setSyncUser(res.data.user?.id ?? null)
      const givenName = res.data.user?.user_metadata?.given_name || res.data.user?.user_metadata?.full_name || ''
      if (givenName && !useSettingsStore.getState().settings.name) useSettingsStore.getState().update({ name: givenName })
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      setSyncUser(session?.user?.id ?? null)
      const givenName = session?.user?.user_metadata?.given_name || session?.user?.user_metadata?.full_name || ''
      if (givenName && !useSettingsStore.getState().settings.name) useSettingsStore.getState().update({ name: givenName })
    })
    return () => subscription.unsubscribe()
  }, [])

  const computedIsPro = user ? isProEmail(user.email || '') || settings.isPro : false

  useEffect(() => {
    estimateStorageUsage(computedIsPro).then(setStorageUsage)
  }, [computedIsPro])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImage(file, 400)
      const sb = getSupabase()
      if (!sb) { alert('Supabase not configured. Avatar uploaded locally only.'); update({ avatarUrl: dataUrl }); setUploading(false); return }
      const { data: { session } } = await sb.auth.getSession()
      const uid = session?.user?.id || user?.id
      if (!uid) throw new Error('Not signed in')
      const blob = await (await fetch(dataUrl)).blob()
      const publicUrl = await uploadAvatar(blob, uid)
      await update({ avatarUrl: publicUrl })
    } catch (err: any) {
      alert('Failed to upload avatar: ' + (err?.message || 'Unknown error'))
    }
    setUploading(false)
  }

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) return
    const redirectTo = `${window.location.origin}/auth/callback`
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const handleSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out? Your data will remain saved and synced.')) return
    sessionStorage.setItem('voluntary_logout', 'true')
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signOut()
    router.push('/')
  }

  const exportData = async () => {
    const tests = await db.tests.toArray()
    const errors = await db.errors.toArray()
    const formulas = await db.formulas.toArray()
    downloadJSON({
      settings,
      progress: await db.progress.toArray(),
      timetable: (await db.timetable.get('main'))?.data || {},
      tests, errors, formulas,
      exportedAt: new Date().toISOString(),
    }, `jee-2027-backup-${new Date().toISOString().split('T')[0]}.json`)
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const raw = JSON.parse(await file.text())
        if (typeof raw !== 'object' || !raw) { alert('Invalid backup file.'); return }
        if (raw.settings && typeof raw.settings === 'object' && typeof raw.settings.id === 'string') await update(raw.settings)
        if (Array.isArray(raw.progress)) for (const item of raw.progress) { if (item && typeof item.chapterId === 'string') await db.progress.put(item) }
        if (raw.timetable && typeof raw.timetable === 'object') await db.timetable.put({ id: 'main', data: raw.timetable })
        alert('Imported! Reload to see changes.')
      } catch { alert('Invalid backup file.') }
    }
    input.click()
  }

  const avatarDisplay = settings.avatarUrl || user?.user_metadata?.avatar_url || ''

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <div className="max-w-[700px]">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-6" style={{ color: 'var(--c-text)' }}>Settings</h1>

        <div className="space-y-4">

          {/* Profile */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Profile</h2>
            <div className="flex items-center gap-5 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-16 h-16 rounded-full overflow-hidden transition-all duration-200 hover:opacity-80 group"
                style={{ border: '2px solid rgba(0,0,0,0.06)', cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                {avatarDisplay ? (
                  <img src={avatarDisplay} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-semibold" style={{ background: 'var(--c-tag)', color: 'var(--c-muted)' }}>
                    {(settings.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-medium">{uploading ? '...' : 'Edit'}</span>
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{settings.name || 'User'}</div>
                <div className="text-xs" style={{ color: 'var(--c-muted)' }}>JEE 2027</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>DISPLAY NAME</label>
                <input type="text" value={settings.name} onChange={e => update({ name: e.target.value.slice(0, 50) })} placeholder="Your name"
                  className="w-full px-4 py-2.5 text-sm outline-none transition-colors rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
              </div>
            </div>
          </div>

          {/* Exam Configuration */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Exam Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>EXAM DATE</label>
                <input type="date" value={settings.examDate} onChange={e => update({ examDate: e.target.value })}
                  className="w-full max-w-[200px] px-4 py-2.5 text-sm outline-none transition-colors rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>DAILY STUDY HOURS TARGET</label>
                <input type="number" min={1} max={16} value={settings.dailyStudyHours} onChange={e => update({ dailyStudyHours: parseInt(e.target.value, 10) || 9 })}
                  className="w-full max-w-[100px] px-4 py-2.5 text-sm outline-none transition-colors rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>FREEZE DAYS (no new content before exam)</label>
                <input type="number" min={0} max={60} value={settings.freezeDays} onChange={e => update({ freezeDays: parseInt(e.target.value, 10) || 21 })}
                  className="w-full max-w-[100px] px-4 py-2.5 text-sm outline-none transition-colors rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Preferences</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Dark Mode</div>
                  <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Default dark theme</div>
                </div>
                <button onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                  className={`text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all ${settings.theme === 'dark' ? 'text-white' : ''}`}
                  style={{
                    background: settings.theme === 'dark' ? 'var(--c-blue)' : 'var(--c-input)',
                    border: settings.theme === 'dark' ? 'none' : '1px solid var(--c-border-input)',
                    color: settings.theme === 'dark' ? '#fff' : 'var(--c-text-secondary)',
                  }}
                >
                  {settings.theme === 'dark' ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Confetti</div>
                    <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Celebrate chapter completions</div>
                  </div>
                  <button onClick={() => update({ confettiEnabled: !settings.confettiEnabled })}
                    className={`text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all ${settings.confettiEnabled ? 'text-white' : ''}`}
                    style={{
                      background: settings.confettiEnabled ? 'var(--c-blue)' : 'var(--c-input)',
                      border: settings.confettiEnabled ? 'none' : '1px solid var(--c-border-input)',
                      color: settings.confettiEnabled ? '#fff' : 'var(--c-text-secondary)',
                    }}
                  >
                    {settings.confettiEnabled ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Open Sidebar on Hover</div>
                    <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Hover over the menu button to auto-open sidebar</div>
                  </div>
                  <button onClick={() => update({ sidebarHover: !settings.sidebarHover })}
                    className={`text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all ${settings.sidebarHover ? 'text-white' : ''}`}
                    style={{
                      background: settings.sidebarHover ? 'var(--c-blue)' : 'var(--c-input)',
                      border: settings.sidebarHover ? 'none' : '1px solid var(--c-border-input)',
                      color: settings.sidebarHover ? '#fff' : 'var(--c-text-secondary)',
                    }}
                  >
                    {settings.sidebarHover ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Changelog Popup</div>
                    <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Show what&apos;s new after updates</div>
                  </div>
                  <button onClick={() => update({ showChangelog: !settings.showChangelog })}
                    className={`text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all ${settings.showChangelog ? 'text-white' : ''}`}
                    style={{
                      background: settings.showChangelog ? 'var(--c-blue)' : 'var(--c-input)',
                      border: settings.showChangelog ? 'none' : '1px solid var(--c-border-input)',
                      color: settings.showChangelog ? '#fff' : 'var(--c-text-secondary)',
                    }}
                  >
                    {settings.showChangelog ? 'On' : 'Off'}
                  </button>
                </div>
                {settings.showChangelog && (
                  <a href="https://github.com/ashish01-dev/JEEIFY/releases/latest" target="_blank" rel="noopener noreferrer"
                    className="text-[11px] underline mt-1 inline-block" style={{ color: 'var(--c-blue)' }}>
                    View full release notes →
                  </a>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Feature Tour</div>
                    <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Replay the guided tour of the app</div>
                  </div>
                  <button onClick={() => { update({ tourCompleted: false }); router.push('/dashboard') }}
                    className="text-xs font-medium px-4 py-1.5 rounded-[40px] text-white transition-all"
                    style={{ background: 'var(--c-btn-primary)' }}
                  >Start Tour</button>
                </div>
                {computedIsPro && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Auto Plan Popup</div>
                    <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Show Plan Your Day popup on dashboard</div>
                  </div>
                  <button onClick={() => update({ autoPlanPopup: !settings.autoPlanPopup })}
                    className={`text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all ${settings.autoPlanPopup ? 'text-white' : ''}`}
                    style={{
                      background: settings.autoPlanPopup ? 'var(--c-blue)' : 'var(--c-input)',
                      border: settings.autoPlanPopup ? 'none' : '1px solid var(--c-border-input)',
                      color: settings.autoPlanPopup ? '#fff' : 'var(--c-text-secondary)',
                    }}
                  >
                    {settings.autoPlanPopup ? 'On' : 'Off'}
                  </button>
                </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Backlog Reminder</div>
                    <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Show reminders for pending backlog items</div>
                  </div>
                  <button onClick={() => update({ backlogReminder: !settings.backlogReminder })}
                    className={`text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all ${settings.backlogReminder ? 'text-white' : ''}`}
                    style={{
                      background: settings.backlogReminder ? 'var(--c-blue)' : 'var(--c-input)',
                      border: settings.backlogReminder ? 'none' : '1px solid var(--c-border-input)',
                      color: settings.backlogReminder ? '#fff' : 'var(--c-text-secondary)',
                    }}
                  >
                    {settings.backlogReminder ? 'On' : 'Off'}
                  </button>
                </div>
            </div>
          </div>

          {/* Pro Subscription */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Pro Subscription</h2>
                  {computedIsPro ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(35,131,226,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>You&apos;re a Pro subscriber</div>
                  <div className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
                    {settings.proExpiryDate
                      ? <>Expires on {new Date(settings.proExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                      : 'Enjoy all Pro features including advanced analytics, priority support, and direct file downloads.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(35,131,226,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue)" strokeWidth="2"><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Upgrade to Pro</div>
                  <div className="text-[11px]" style={{ color: 'var(--c-muted)' }}>Unlimited storage, advanced analytics, priority support — just ₹50/month.</div>
                </div>
                <button onClick={() => router.push('/pricing')}
                  className="text-xs font-medium px-4 py-1.5 rounded-[40px] text-white transition-all whitespace-nowrap"
                  style={{ background: 'var(--c-btn-primary)' }}>
                  Buy Pro
                </button>
              </div>
            )}
          </div>

          {/* Storage Usage */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Storage</h2>
            {storageUsage ? (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--c-muted)' }}>
                  <span>{formatBytes(storageUsage.totalBytes)} used</span>
                  <span className="font-medium" style={{ color: storageUsage.percentUsed >= 80 ? 'var(--c-orange)' : 'var(--c-text-secondary)' }}>
                    {storageUsage.percentUsed.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--c-progress-bg)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(storageUsage.percentUsed, 100)}%`,
                    background: storageUsage.percentUsed >= 95 ? 'var(--c-red)' : storageUsage.percentUsed >= 80 ? 'var(--c-orange)' : 'var(--c-blue)',
                  }} />
                </div>
                <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--c-caption)' }}>
                  <span>Sync data: {formatBytes(storageUsage.syncDataBytes)}</span>
                  <span>Files: {formatBytes(storageUsage.storageBytes)}</span>
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--c-caption)' }}>
                  Limit: {formatBytes(storageUsage.limitBytes)}
            {computedIsPro ? (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: 'var(--c-blue)' }}>PRO</span>
                  ) : (
                    <button onClick={() => router.push('/pricing')}
                      className="ml-2 text-[10px] font-medium underline transition-opacity hover:opacity-70"
                      style={{ color: 'var(--c-blue)' }}
                    >Upgrade to Pro for 5 GB</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs" style={{ color: 'var(--c-muted)' }}>Calculating storage usage...</div>
            )}
          </div>

          {/* Cloud Sync */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Cloud Sync</h2>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {avatarDisplay && <img src={avatarDisplay} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.given_name || user.email?.split('@')[0] || 'User'}</div>
                      <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Signed in</div>
                    </div>
                  </div>
                  <button onClick={handleSignOut}
                    className="text-xs font-medium px-4 py-1.5 rounded-[40px] transition-all"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
                  >Sign Out</button>
                </>
              ) : (
                <>
                  <p className="text-xs flex-1" style={{ color: 'var(--c-muted)' }}>Sign in to sync data across devices</p>
                  <button onClick={handleGoogleSignIn}
                    className="text-xs font-medium px-4 py-1.5 rounded-[40px] text-white transition-all"
                    style={{ background: 'var(--c-btn-primary)' }}
                  >Sign in with Google</button>
                </>
              )}
            </div>
            {!getSupabase() && (
              <p className="text-xs mt-2" style={{ color: 'var(--c-orange)' }}>Add Supabase config to .env.local to enable cloud sync.</p>
            )}
          </div>

          {/* Data */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Data</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportData}
                className="text-xs font-medium px-4 py-2 rounded-[40px] text-white transition-all"
                style={{ background: 'var(--c-btn-primary)' }}
              >Export Backup (JSON)</button>
              <button onClick={importData}
                className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
              >Import Backup</button>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}
                >Reset All Data</button>
              ) : (
                <div className="w-full space-y-2">
                  <p className="text-xs" style={{ color: 'var(--c-red)' }}>Type <strong>DELETE</strong> to confirm:</p>
                  <input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    className="w-full px-3 py-2 text-xs outline-none rounded-[40px]"
                    style={{ border: '1px solid #e03e3e', color: 'var(--c-text)', background: 'var(--c-input)' }}
                    placeholder="DELETE"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (deleteConfirm !== 'DELETE') return
                        await db.progress.clear()
                        await db.timetable.clear()
                        await db.tests.clear()
                        await db.errors.clear()
                        await db.formulas.clear()
                        await db.dailyLogs.clear()
                        await db.pomodoro.clear()
                        await db.dailyPlans.clear()
                        await db.questions.clear()
                        await db.settings.clear()
                        localStorage.removeItem('jee-theme')
                        window.location.reload()
                      }}
                      disabled={deleteConfirm !== 'DELETE'}
                      className="text-xs font-medium px-4 py-1.5 rounded-[40px] disabled:opacity-40"
                      style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}
                    >Confirm Reset</button>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm('') }}
                      className="text-xs font-medium px-4 py-1.5 rounded-[40px]"
                      style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Account */}
          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Delete Account</h2>
            {!showDeleteAccount ? (
              <div>
                <p className="text-xs mb-3" style={{ color: 'var(--c-muted)' }}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button onClick={() => setShowDeleteAccount(true)}
                  className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}
                >Delete Account</button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: 'var(--c-red)' }}>
                  Type <strong>DELETE ACCOUNT</strong> to confirm permanent deletion:
                </p>
                <input
                  value={deleteAccountConfirm}
                  onChange={e => setDeleteAccountConfirm(e.target.value)}
                  className="w-full px-3 py-2 text-xs outline-none rounded-[40px]"
                  style={{ border: '1px solid #e03e3e', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  placeholder="DELETE ACCOUNT"
                  disabled={deletingAccount}
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (deleteAccountConfirm !== 'DELETE ACCOUNT' || deletingAccount) return
                      setDeletingAccount(true)
                      try {
                        const res = await fetch('/api/delete-account', { method: 'POST' })
                        if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Unknown error' })); alert(err.error || 'Failed to delete account.'); setDeletingAccount(false); return }
                        await db.progress.clear()
                        await db.timetable.clear()
                        await db.tests.clear()
                        await db.errors.clear()
                        await db.formulas.clear()
                        await db.dailyLogs.clear()
                        await db.pomodoro.clear()
                        await db.dailyPlans.clear()
                        await db.questions.clear()
                        await db.settings.clear()
                        localStorage.removeItem('jee-theme')
                        sessionStorage.setItem('voluntary_logout', 'true')
                        const sb = getSupabase()
                        if (sb) await sb.auth.signOut()
                        window.location.href = '/'
                      } catch (err) {
                        alert('Something went wrong. Please try again.')
                        setDeletingAccount(false)
                      }
                    }}
                    disabled={deleteAccountConfirm !== 'DELETE ACCOUNT' || deletingAccount}
                    className="text-xs font-medium px-4 py-1.5 rounded-[40px] disabled:opacity-40"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}
                  >{deletingAccount ? 'Deleting...' : 'Confirm Delete'}</button>
                  <button onClick={() => { setShowDeleteAccount(false); setDeleteAccountConfirm('') }}
                    className="text-xs font-medium px-4 py-1.5 rounded-[40px]"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
                  >Cancel</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      </div>
    </div>
  )
}
