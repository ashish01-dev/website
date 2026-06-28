'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/store/settingsStore'

export default function CountdownHero() {
  const { settings } = useSettingsStore()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [percentUsed, setPercentUsed] = useState(0)

  useEffect(() => {
    const update = () => {
      const exam = new Date(settings.examDate)
      const now = new Date()
      const total = exam.getTime() - new Date('2025-12-01').getTime()
      const elapsed = now.getTime() - new Date('2025-12-01').getTime()
      const diff = exam.getTime() - now.getTime()
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
        setPercentUsed(Math.min(100, Math.max(0, (elapsed / total) * 100)))
      }
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [settings.examDate])

  return (
    <div className="bg-surface-card backdrop-blur-xl border border-surface-border rounded-2xl p-card-padding relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary-container/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-primary-container/20 transition-all duration-700" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase tracking-widest bg-primary-container/20 text-primary border border-primary/30">
            Countdown
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={timeLeft.days}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-display-hero bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent"
          >
            {timeLeft.days}
          </motion.span>
          <span className="text-headline-lg text-on-surface-variant">days</span>
        </div>
        <div className="flex gap-4 mt-1 mb-4">
          <span className="text-display-stat text-lg font-bold text-on-surface">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-display-stat text-lg text-on-surface-variant">:</span>
          <span className="text-display-stat text-lg font-bold text-on-surface">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-display-stat text-lg text-on-surface-variant">:</span>
          <span className="text-display-stat text-lg font-bold text-on-surface">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-body-sm text-on-surface-variant mt-2">
          {Math.round(percentUsed)}% of prep time used &middot; JEE Main 22 Jan 2027
        </p>
      </div>
    </div>
  )
}
