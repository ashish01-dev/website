'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/useUser'
import { getSupabase } from '@/lib/supabase'

export default function LandingNav({ active }: { active?: 'pricing' | 'about' }) {
  const router = useRouter()
  const user = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleTheme = () => {
    const newDark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', newDark)
    document.documentElement.classList.toggle('light', !newDark)
    localStorage.setItem('jee-theme', newDark ? 'dark' : 'light')
    setIsDark(newDark)
  }

  const handleSignOut = async () => {
    const sb = getSupabase()
    if (!sb) return
    await sb.auth.signOut()
    setShowProfileDropdown(false)
    router.push('/')
  }

  return (
    <nav className="w-full pt-4 md:pt-6 px-4">
      <div className="mx-auto max-w-[900px] flex items-center justify-between rounded-full px-3 md:px-5 py-2"
        style={{
          background: 'var(--c-navbar-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-shadow-nav)',
        }}>
        <Link href="/" className="flex items-center gap-[7px] flex-shrink-0">
          <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 22, filter: 'var(--c-logo-filter)' }} />
          <span className="text-[17px] font-bold tracking-[-0.2px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-[13px] font-normal hover:opacity-100 transition-opacity" style={{ opacity: active ? 0.65 : 1, color: 'var(--c-text)' }}>Home</Link>
          <a href="#features" className="text-[13px] font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: 'var(--c-text)' }}>Features</a>
          <Link href="/pricing" className="text-[13px] font-normal hover:opacity-100 transition-opacity" style={{ opacity: active === 'pricing' ? 1 : 0.65, color: active === 'pricing' ? 'var(--c-blue)' : 'var(--c-text)' }}>Pricing</Link>
          <Link href="/about" className="text-[13px] font-normal hover:opacity-100 transition-opacity" style={{ opacity: active === 'about' ? 1 : 0.65, color: active === 'about' ? 'var(--c-blue)' : 'var(--c-text)' }}>About</Link>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="hidden md:flex w-7 h-7 rounded-full items-center justify-center transition-all hover:bg-black/[0.04]" style={{ cursor: 'pointer', color: 'var(--c-text)' }}>
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="5.64" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          {user ? (
            <div ref={profileRef} className="relative">
              <button onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full transition-all hover:bg-black/[0.04]"
                style={{ cursor: 'pointer', border: '1px solid var(--c-border-card)' }}>
                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center" style={{ background: user.avatar ? 'transparent' : 'var(--c-tag)' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold" style={{ color: 'var(--c-muted)' }}>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-[12px] font-medium max-w-[90px] truncate hidden sm:block" style={{ color: 'var(--c-text)' }}>{user.name}</span>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-[14px] overflow-hidden z-50" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{user.name}</span>
                      {user.isPro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--c-blue)' }}>PRO</span>}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>{user.email}</div>
                  </div>
                  {user.isPro ? (
                    <div className="px-4 py-3 text-sm flex items-center gap-2" style={{ color: 'var(--c-green)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      Pro Subscriber
                    </div>
                  ) : (
                    <button onClick={() => { setShowProfileDropdown(false); router.push('/pricing') }}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm transition-colors hover:bg-black/[0.03]"
                      style={{ color: 'var(--c-text)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                      Upgrade to Pro
                    </button>
                  )}
                  <button onClick={() => { setShowProfileDropdown(false); router.push('/dashboard') }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm transition-colors hover:bg-black/[0.03]"
                    style={{ color: 'var(--c-text)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    Go to Dashboard
                  </button>
                  <div className="h-[1px]" style={{ background: 'var(--c-border)' }} />
                  <button onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm transition-colors hover:bg-black/[0.03]"
                    style={{ color: 'var(--c-red)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth?mode=login" className="hidden md:inline text-[12px] font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: 'var(--c-text)' }}>Sign In</Link>
              <Link href="/auth?mode=signup"
                className="flex items-center gap-1.5 text-white text-[12px] font-medium rounded-full px-3 py-1.5 transition-all duration-200 hover:-translate-y-[0.5px] hover:brightness-110 flex-shrink-0"
                style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Get Started</span>
              </Link>
            </>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col items-center justify-center w-6 h-6 gap-[4px]" style={{ cursor: 'pointer' }}>
            <span style={{ backgroundColor: 'var(--c-text)' }} className={`block h-[1.5px] w-5 rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[2.5px]' : ''}`} />
            <span style={{ backgroundColor: 'var(--c-text)' }} className={`block h-[1.5px] w-5 rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span style={{ backgroundColor: 'var(--c-text)' }} className={`block h-[1.5px] w-5 rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[2.5px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-50 bg-white flex flex-col px-10 py-8 transition-transform duration-500 md:hidden`}
        style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(100%)', transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)' }}>
        <div className="flex justify-end mb-16">
          <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center" style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--c-text)" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-col">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '/pricing', isLink: true },
            { label: 'About', href: '/about', isLink: true },
            ...(user ? [
              { label: 'Dashboard', href: '/dashboard', isLink: true },
              { label: 'Buy Pro', href: '/pricing', isLink: true },
            ] : [
              { label: 'Sign In', href: '/auth?mode=login', isLink: true },
            ]),
          ].map(item => {
            const Comp = item.isLink ? Link : 'a'
            const props = item.isLink ? { href: item.href, onClick: () => setMenuOpen(false) } : { href: item.href, onClick: () => setMenuOpen(false) }
            return (
              <Comp key={item.label} {...props}
                className="text-[38px] font-extrabold tracking-[-1.5px] py-6 border-b border-[var(--c-border)]" style={{ color: 'var(--c-text)' }}>
                {item.label}
              </Comp>
            )
          })}
        </div>
        <div className="mt-auto">
          {user ? (
            <button onClick={handleSignOut}
              className="inline-flex items-center gap-3 text-sm font-medium rounded-[40px] px-[16px] py-[5px]"
              style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-red)' }}>
              Sign Out
            </button>
          ) : (
            <Link href="/auth?mode=signup" onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-3 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px]"
              style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
