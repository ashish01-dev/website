'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineOverlay() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-5" style={{ background: 'var(--c-bg-gradient)' }}>
      <div className="relative mb-5">
        <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center" style={{ background: 'var(--c-tag)' }}>
          <WifiOff size={32} style={{ color: 'var(--c-muted)' }} />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full" style={{ background: 'var(--c-orange)', filter: 'blur(10px)', opacity: 0.5 }} />
      </div>

      <h2 className="text-lg font-semibold mb-2 text-center" style={{ color: 'var(--c-text)' }}>
        No Internet Connection
      </h2>
      <p className="text-[13px] text-center leading-relaxed" style={{ color: 'var(--c-muted)', maxWidth: 300 }}>
        You seem to be offline. We&apos;ll resume automatically once you&apos;re back online.
      </p>

      <div className="flex items-center gap-2 mt-8">
        <div className="w-2 h-2 rounded-full bg-[var(--c-orange)] animate-pulse" />
        <span className="text-[12px]" style={{ color: 'var(--c-caption)' }}>
          Checking connection&hellip;
        </span>
      </div>
    </div>
  )
}
