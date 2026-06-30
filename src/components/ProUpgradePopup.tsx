'use client'

import { useEffect, useRef } from 'react'
import ConfettiOverlay from './ConfettiOverlay'

interface ProUpgradePopupProps {
  show: boolean
  onGoToDashboard: () => void
}

export default function ProUpgradePopup({ show, onGoToDashboard }: ProUpgradePopupProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (show) btnRef.current?.focus()
  }, [show])

  if (!show) return null

  return (
    <>
      <ConfettiOverlay
        fire={show}
        messageContent={
          <div className="pointer-events-auto animate-confetti-message z-[10000] relative">
            <div
              className="rounded-[18px] px-8 py-8 text-center backdrop-blur-md shadow-2xl border max-w-sm mx-auto"
              style={{
                background: 'var(--c-card)',
                borderColor: 'var(--c-border-card)',
                boxShadow: 'var(--c-shadow-hover)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--c-tag)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>
                Thank you!
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                You are now <strong style={{ color: 'var(--c-blue)' }}>Pro</strong>. Get ready to accelerate your JEE preparation.
              </p>
              <button
                ref={btnRef}
                onClick={onGoToDashboard}
                className="px-6 py-3 text-sm font-semibold rounded-[40px] text-white transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
                style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        }
      />
    </>
  )
}
