'use client'

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export default function TopBar() {
  const { settings } = useSettingsStore()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

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

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-11 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-lg text-white">☰</button>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <span className="font-medium text-white">JEEIFY</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-white/50">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
          <span className="text-[#2383e2] text-xs font-medium">22 Jan 2027</span>
        </div>
      </div>
    </header>
  )
}
