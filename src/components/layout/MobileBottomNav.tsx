'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/dashboard', label: '📊' },
  { href: '/completion', label: '✅' },
  { href: '/activity', label: '📓' },
  { href: '/syllabus', label: '📚' },
  { href: '/roadmap', label: '🗺️' },
  { href: '/timetable', label: '📅' },
  { href: '/progress', label: '📈' },
  { href: '/pomodoro', label: '🍅' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-black/90 backdrop-blur-sm border-t border-white/[0.06] flex justify-around items-center h-12 z-50 px-2">
      {ITEMS.map(item => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-lg transition-opacity ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
