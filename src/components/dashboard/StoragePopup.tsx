'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'
import { estimateStorageUsage, formatBytes, type StorageUsage } from '@/lib/storage'

interface StoragePopupProps {
  isPro: boolean
}

export default function StoragePopup({ isPro }: StoragePopupProps) {
  const router = useRouter()
  const { settings, loaded, update } = useSettingsStore()
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!loaded || isPro) return
    estimateStorageUsage(isPro).then(u => {
      setUsage(u)
      if (u.percentUsed >= 80 && !settings.storageWarningShown) {
        setShow(true)
        update({ storageWarningShown: true })
      }
    })
  }, [loaded, isPro])

  if (!show || !usage) return null

  const isCritical = usage.percentUsed >= 95

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-sm mx-4 rounded-[18px] px-[26px] py-[28px]" style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
            background: isCritical ? 'rgba(224,62,62,0.1)' : 'rgba(217,115,13,0.1)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isCritical ? 'var(--c-red)' : 'var(--c-orange)'} strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4" />
              <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
              <path d="M2 12h4M18 12h4" />
              <path d="M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>
              {isCritical ? 'Storage Critical' : 'Storage Almost Full'}
            </h2>
            <p className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
              {isCritical ? 'Upgrade to continue storing data' : 'Consider upgrading to Pro'}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--c-muted)' }}>
            <span>{formatBytes(usage.totalBytes)} used</span>
            <span className="font-semibold" style={{ color: isCritical ? 'var(--c-red)' : 'var(--c-orange)' }}>
              {usage.percentUsed.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(usage.percentUsed, 100)}%`,
              background: isCritical ? 'var(--c-red)' : 'var(--c-orange)',
            }} />
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--c-caption)' }}>
            Free: {formatBytes(usage.limitBytes)} · Pro: 5 GB
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShow(false)}
            className="text-xs font-medium px-4 py-2 rounded-[40px] transition-all"
            style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
          >Dismiss</button>
          <button
            onClick={() => { setShow(false); router.push('/pricing') }}
            className="text-xs font-medium px-5 py-2 rounded-[40px] text-white transition-all"
            style={{ background: 'var(--c-btn-primary)' }}
          >Upgrade to Pro</button>
        </div>
      </div>
    </div>
  )
}
