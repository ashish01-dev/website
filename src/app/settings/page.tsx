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
import { setSyncUser } from '@/lib/supabase-sync'
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
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const path = `${uid}/avatar.jpg`
      const blob = await (await fetch(dataUrl)).blob()
      let publicUrl: string
      const { error } = await sb.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error?.message?.includes('Bucket not found')) {
        const fallbackPath = `avatars/${uid}/avatar.jpg`
        const { error: fbErr } = await sb.storage.from('formulas').upload(fallbackPath, blob, { upsert: true, contentType: 'image/jpeg' })
        if (fbErr) throw fbErr
        publicUrl = sb.storage.from('formulas').getPublicUrl(fallbackPath).data.publicUrl
      } else if (error) {
        throw error
      } else {
        publicUrl = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl
      }
      await update({ avatarUrl: publicUrl })
    } catch (err: any) {
      alert('Failed to upload avatar: ' + (err?.message || 'Unknown error'))
    }
    setUploading(false)
  }

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) return
    const origin = window.location.origin
    const allowed = ['http://localhost:3000', 'https://jee-2027.vercel.app', 'https://jeecommandcenter.vercel.app']
    const redirectTo = allowed.includes(origin) ? `${origin}/auth/callback` : 'https://jee-2027.vercel.app/auth/callback'
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const handleSignOut = async () => {
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

      <div className="max-w-[700px] mx-auto px-4 md:px-6 py-8">
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
            </div>
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
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{user.user_metadata?.full_name || user.email}</div>
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
        </div>
      </div>
    </div>
  )
}
