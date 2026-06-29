'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { create } from 'zustand'
import { useSettingsStore } from '@/store/settingsStore'

export const SIDEBAR_WIDTH = 260

export const useSidebarStore = create<{ open: boolean; setOpen: (v: boolean) => void }>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}))

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/syllabus', label: 'Syllabus', icon: '📚' },
  { href: '/roadmap', label: 'Roadmap', icon: '🗺️' },
  { href: '/timetable', label: 'Timetable', icon: '📅' },
  { href: '/progress', label: 'Progress', icon: '📈' },
  { href: '/pomodoro', label: 'Pomodoro', icon: '🍅' },
  { href: '/completion', label: 'Completion', icon: '✅' },
  { href: '/activity', label: 'Journal', icon: '📓' },
  { href: '/questions', label: 'Questions', icon: '❓' },
  { href: '/tests', label: 'Tests', icon: '📝' },
  { href: '/revision', label: 'Revision', icon: '🧠' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

const MOBILE_GROUPS = [
  {
    label: 'Study', icon: '📚',
    items: [
      { href: '/', label: 'Home', icon: '🏠' },
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/syllabus', label: 'Syllabus', icon: '📚' },
      { href: '/roadmap', label: 'Roadmap', icon: '🗺️' },
    ],
  },
  {
    label: 'Track', icon: '📊',
    items: [
      { href: '/timetable', label: 'Timetable', icon: '📅' },
      { href: '/progress', label: 'Progress', icon: '📈' },
      { href: '/pomodoro', label: 'Pomodoro', icon: '🍅' },
      { href: '/completion', label: 'Completion', icon: '✅' },
      { href: '/activity', label: 'Journal', icon: '📓' },
    ],
  },
  {
    label: 'More', icon: '⚙️',
    items: [
      { href: '/questions', label: 'Questions', icon: '❓' },
      { href: '/tests', label: 'Tests', icon: '📝' },
      { href: '/revision', label: 'Revision', icon: '🧠' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { settings } = useSettingsStore()
  const sidebarOpen = useSidebarStore(s => s.open)
  const setSidebarOpen = useSidebarStore(s => s.setOpen)
  const [openGroup, setOpenGroup] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isPermanent = !settings.sidebarAutoHide

  // Set CSS variable for content margin
  useEffect(() => {
    const el = document.documentElement
    if (isPermanent) {
      el.style.setProperty('--sidebar-w', `${SIDEBAR_WIDTH}px`)
    } else {
      el.style.setProperty('--sidebar-w', '0px')
    }
    return () => el.style.setProperty('--sidebar-w', '0px')
  }, [isPermanent])

  // Auto-hide timer logic
  const resetAutoHideTimer = useCallback(() => {
    if (autoHideTimer.current) clearTimeout(autoHideTimer.current)
    if (settings.sidebarAutoHide && sidebarOpen) {
      autoHideTimer.current = setTimeout(() => {
        setSidebarOpen(false)
      }, 5000)
    }
  }, [settings.sidebarAutoHide, sidebarOpen, setSidebarOpen])

  useEffect(() => {
    if (settings.sidebarAutoHide && sidebarOpen) {
      resetAutoHideTimer()
    }
    return () => {
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current)
    }
  }, [sidebarOpen, settings.sidebarAutoHide, resetAutoHideTimer])

  const handleSidebarInteraction = useCallback(() => {
    resetAutoHideTimer()
  }, [resetAutoHideTimer])

  // Click-outside for auto-hide mode overlay
  useEffect(() => {
    if (!settings.sidebarAutoHide || !sidebarOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node) &&
          !(e.target as HTMLElement)?.closest?.('.sidebar-trigger')) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen, settings.sidebarAutoHide, setSidebarOpen])

  // Mobile click-outside for group panel
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    if (openGroup !== null) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [openGroup])

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  const handleNavClick = () => {
    setSidebarOpen(false)
    setOpenGroup(null)
  }

  const handleTriggerHover = () => {
    if (settings.sidebarHover) {
      hoverTimer.current = setTimeout(() => setSidebarOpen(true), 200)
    }
  }

  const handleTriggerLeave = () => {
    if (settings.sidebarHover) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    }
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Navigation</span>
        {!isPermanent && (
          <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.04]" style={{ cursor: 'pointer', color: 'var(--c-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      <div className="px-3 py-3 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'font-medium' : ''}`}
              style={{
                color: active ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
              }}>
              <span className="text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-blue)' }} />}
            </Link>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar — auto-hide mode (overlay, slides in) */}
      {settings.sidebarAutoHide && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 hidden md:block"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            ref={sidebarRef}
            onMouseMove={handleSidebarInteraction}
            onClick={handleSidebarInteraction}
            className={`fixed top-0 left-0 z-50 h-full hidden md:block transition-transform duration-300 will-change-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{
              width: SIDEBAR_WIDTH,
              background: 'var(--c-card)',
              borderRight: '1px solid var(--c-border)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
            }}
          >
            {sidebarContent}
          </div>
        </>
      )}

      {/* Desktop sidebar — permanent mode (always visible, pushes content) */}
      {!settings.sidebarAutoHide && (
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full z-30 hidden md:block`}
          style={{
            width: SIDEBAR_WIDTH,
            background: 'var(--c-card)',
            borderRight: '1px solid var(--c-border)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          }}
        >
          {sidebarContent}
        </div>
      )}

      {/* Mobile 3-button bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 px-3 py-2 rounded-[16px]" style={{
          background: 'var(--c-navbar-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-shadow-nav)',
        }}>
          {MOBILE_GROUPS.map((group, gi) => (
            <button
              key={group.label}
              onClick={() => setOpenGroup(openGroup === gi ? null : gi)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 ${
                openGroup === gi ? 'bg-black/[0.04]' : 'hover:bg-black/[0.02]'
              }`}
            >
              <span className="text-[20px] leading-none">{group.icon}</span>
              <span className={`text-[10px] font-medium leading-none ${openGroup === gi ? 'text-[var(--c-blue)]' : 'text-[var(--c-muted)]'}`}>
                {group.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile collapsible panel */}
      {openGroup !== null && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpenGroup(null)} />
          <div
            ref={panelRef}
            className="fixed bottom-[80px] left-3 right-3 z-50 md:hidden rounded-[16px] overflow-hidden transition-all duration-200"
            style={{
              background: 'var(--c-card)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--c-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <div className="px-2 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5" style={{ color: 'var(--c-muted)' }}>
                {MOBILE_GROUPS[openGroup].label}
              </div>
              {MOBILE_GROUPS[openGroup].items.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenGroup(null)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      active ? 'bg-[var(--c-blue)]/10 text-[var(--c-blue)] font-medium' : 'hover:bg-black/[0.03]'
                    }`}
                    style={!active ? { color: 'var(--c-text-secondary)' } : undefined}
                  >
                    <span className="text-[16px]">{item.icon}</span>
                    <span>{item.label}</span>
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--c-blue)]" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
