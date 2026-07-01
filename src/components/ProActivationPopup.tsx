'use client'

import { useState, useEffect, useRef } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'
import ConfettiOverlay from './ConfettiOverlay'

interface ProActivationPopupProps {
  show: boolean
  onGoToDashboard: () => void
}

export default function ProActivationPopup({ show, onGoToDashboard }: ProActivationPopupProps) {
  const [phase, setPhase] = useState<'activating' | 'success' | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const update = useSettingsStore(s => s.update)

  useEffect(() => {
    if (!show) { setPhase(null); return }
    setPhase('activating')
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    update({ isPro: true, proExpiryDate: expiry })
    const sb = getSupabase()
    if (sb) { sb.auth.updateUser({ data: { isPro: true, proExpiryDate: expiry } }).catch(() => {}) }
    const t = setTimeout(() => {
      setPhase('success')
      btnRef.current?.focus()
    }, 2200)
    return () => clearTimeout(t)
  }, [show, update])

  if (!show || !phase) return null

  return (
    <>
      <ConfettiOverlay
        fire={phase === 'success'}
        messageContent={
          <div className="pointer-events-auto z-[10000] relative">
            <div
              className="rounded-[18px] px-8 py-8 text-center backdrop-blur-md shadow-2xl border max-w-sm mx-auto"
              style={{
                background: 'var(--c-card)',
                borderColor: 'var(--c-border-card)',
                boxShadow: 'var(--c-shadow-hover)',
              }}
            >
              {/* Cross button */}
              <button
                onClick={onGoToDashboard}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {phase === 'activating' ? (
                <>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>
                    Activating PRO
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                    Setting up your premium features...
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--c-tag)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>
                    You&apos;re now PRO!
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                    Thank you for purchase. You are now a pro member.
                  </p>
                  <button
                    ref={btnRef}
                    onClick={onGoToDashboard}
                    className="px-6 py-3 text-sm font-semibold rounded-[40px] text-white transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
                    style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
                  >
                    Go to Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        }
      />
    </>
  )
}
