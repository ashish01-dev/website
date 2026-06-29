'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'

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
  const router = useRouter()
  const { settings } = useSettingsStore()
  const { progress, loaded } = useProgressStore()
  const [openGroup, setOpenGroup] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

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

  return (
    <>
      {/* Desktop floating bar */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-3 py-2 rounded-[18px]" style={{
          background: 'var(--c-navbar-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-shadow-nav)',
        }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-black/[0.04] relative group"
                title={item.label}
              >
                <span className={`text-[18px] leading-none transition-transform duration-200 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[9px] font-medium leading-none whitespace-nowrap transition-colors ${active ? 'text-[var(--c-blue)]' : 'text-[var(--c-muted)]'}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--c-blue)]" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

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
