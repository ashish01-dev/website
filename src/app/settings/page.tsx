'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useSettingsStore } from '@/store/settingsStore'
import { db } from '@/lib/db'
import { downloadJSON } from '@/lib/utils'
import { getSupabase, setSyncUser } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function SettingsPage() {
  const { settings, update } = useSettingsStore()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setSyncUser(data.user?.id ?? null)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setSyncUser(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleSignOut = async () => {
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signOut()
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
        const data = JSON.parse(await file.text())
        if (data.settings) await update(data.settings)
        if (data.progress) for (const item of data.progress) await db.progress.put(item)
        if (data.timetable) await db.timetable.put({ id: 'main', data: data.timetable })
        alert('Imported! Reload to see changes.')
      } catch { alert('Invalid backup file.') }
    }
    input.click()
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-60">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[700px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-page-title text-notion-text-dark mb-6">Settings</h1>

        <div className="space-y-4">
          <div className="notion-card p-4">
            <h2 className="section-title text-notion-text-dark mb-4">Exam Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">EXAM DATE</label>
                <input type="date" value={settings.examDate} onChange={e => update({ examDate: e.target.value })} className="notion-input max-w-[200px]" />
              </div>
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">DAILY STUDY HOURS TARGET</label>
                <input type="number" min={1} max={16} value={settings.dailyStudyHours} onChange={e => update({ dailyStudyHours: parseInt(e.target.value) || 9 })} className="notion-input max-w-[100px]" />
              </div>
              <div>
                <label className="text-caption text-notion-muted-dark block mb-1">FREEZE DAYS (no new content before exam)</label>
                <input type="number" min={0} max={60} value={settings.freezeDays} onChange={e => update({ freezeDays: parseInt(e.target.value) || 21 })} className="notion-input max-w-[100px]" />
              </div>
            </div>
          </div>

          <div className="notion-card p-4">
            <h2 className="section-title text-notion-text-dark mb-4">Preferences</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-notion-text-dark">Dark Mode</div>
                  <div className="text-xs text-notion-muted-dark">Default dark theme</div>
                </div>
                <button onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })} className={`notion-btn-ghost text-xs ${settings.theme === 'dark' ? 'text-[#2383e2]' : ''}`}>
                  {settings.theme === 'dark' ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-notion-text-dark">Confetti</div>
                  <div className="text-xs text-notion-muted-dark">Celebrate chapter completions</div>
                </div>
                <button onClick={() => update({ confettiEnabled: !settings.confettiEnabled })} className={`notion-btn-ghost text-xs ${settings.confettiEnabled ? 'text-[#2383e2]' : ''}`}>
                  {settings.confettiEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          <div className="notion-card p-4">
            <h2 className="section-title text-notion-text-dark mb-4">Cloud Sync</h2>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {user.user_metadata?.avatar_url && <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />}
                    <div className="min-w-0">
                      <div className="text-sm text-notion-text-dark truncate">{user.user_metadata?.full_name || user.email}</div>
                      <div className="text-[10px] text-notion-muted-dark">Signed in</div>
                    </div>
                  </div>
                  <button onClick={handleSignOut} className="notion-btn-ghost text-xs">Sign Out</button>
                </>
              ) : (
                <>
                  <p className="text-xs text-notion-muted-dark flex-1">Sign in to sync data across devices</p>
                  <button onClick={handleGoogleSignIn} className="notion-btn-primary text-xs">Sign in with Google</button>
                </>
              )}
            </div>
            {!getSupabase() && (
              <p className="text-xs text-[#d9730d] mt-2">Add Supabase config to .env.local to enable cloud sync.</p>
            )}
          </div>

          <div className="notion-card p-4">
            <h2 className="section-title text-notion-text-dark mb-4">Data</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportData} className="notion-btn-primary text-xs">Export Backup (JSON)</button>
              <button onClick={importData} className="notion-btn-ghost text-xs">Import Backup</button>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="notion-btn-ghost text-xs text-[#e03e3e]">Reset All Data</button>
              ) : (
                <div className="w-full space-y-2">
                  <p className="text-xs text-[#e03e3e]">Type <strong>DELETE</strong> to confirm:</p>
                  <input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-transparent border border-[#e03e3e] rounded-notion text-notion-text-dark outline-none"
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
                      className="notion-btn-ghost text-xs text-[#e03e3e] disabled:opacity-40"
                    >
                      Confirm Reset
                    </button>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm('') }} className="notion-btn-glass text-xs">Cancel</button>
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
