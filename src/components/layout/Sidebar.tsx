'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'
import BetaPopup from '@/components/ai/BetaPopup'

export const SIDEBAR_WIDTH = 260

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/ai', label: 'AI Assistant', icon: '🤖', badge: 'BETA' },
  { href: '/syllabus', label: 'Syllabus', icon: '📚' },
  { href: '/timetable', label: 'Timetable', icon: '📅' },
  { href: '/progress', label: 'Progress', icon: '📈' },
  { href: '/completion', label: 'Completion', icon: '✅' },
  { href: '/activity', label: 'Journal', icon: '📓' },
  { href: '/questions', label: 'Questions', icon: '❓' },
  { href: '/tests', label: 'Tests', icon: '📝' },
  { href: '/revision', label: 'Revision', icon: '🧠' },
  { href: '/formula-vault', label: 'Formula Vault', icon: '📄' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { settings } = useSettingsStore()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showBeta, setShowBeta] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (settings.avatarUrl) { setAvatarUrl(settings.avatarUrl); return }
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then((res: any) => {
      const u = res.data?.user
      if (u?.user_metadata?.avatar_url) setAvatarUrl(u.user_metadata.avatar_url)
    })
  }, [settings.avatarUrl])

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <div
      data-tour="tour-sidebar"
      className="fixed top-0 left-0 h-full z-40 hidden md:block"
      style={{
        width: SIDEBAR_WIDTH,
        background: 'var(--c-card)',
        borderRight: '1px solid var(--c-border)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
        <button onClick={() => router.push('/settings')} className="flex items-center gap-2.5 group min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105" style={{
            background: avatarUrl ? 'transparent' : 'var(--c-tag)',
            border: '1px solid var(--c-border)',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
                {(settings.name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-left min-w-0">
            <div className="text-[13px] font-medium leading-tight truncate" style={{ color: 'var(--c-text)' }}>{settings.name || 'User'}</div>
            <div className="text-[10px] leading-tight" style={{ color: 'var(--c-muted)' }}>JEE 2027</div>
          </div>
        </button>
      </div>
      <div className="px-3 py-3 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 68px)' }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          if (item.href === '/ai') {
            return (
              <button key={item.href} onClick={() => setShowBeta(true)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'font-medium' : ''}`}
                style={{
                  color: active ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                  background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
                }}>
                <span className="text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto flex items-center gap-1.5">
                  {(item as any).badge && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>
                      {(item as any).badge}
                    </span>
                  )}
                  {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-blue)' }} />}
                </span>
              </button>
            )
          }
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'font-medium' : ''}`}
              style={{
                color: active ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
              }}>
              <span className="text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
              <span className="ml-auto flex items-center gap-1.5">
                {(item as any).badge && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>
                    {(item as any).badge}
                  </span>
                )}
                {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-blue)' }} />}
              </span>
            </Link>
          )
        })}
      </div>
      {showBeta && <BetaPopup onAcknowledge={() => { setShowBeta(false); localStorage.setItem('ai_beta_acknowledged', '1'); router.push('/ai') }} />}
    </div>
  )
}