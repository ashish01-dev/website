'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'

interface TourStep {
  page: string
  target: string
  title: string
  description: string
}

const TOUR_STEPS: TourStep[] = [
  {
    page: '/dashboard',
    target: 'tour-greeting',
    title: 'Welcome to JEEIFY!',
    description:
      'Your personalised dashboard. See your chapter progress, days remaining, and overall completion — all at a glance.',
  },
  {
    page: '/dashboard',
    target: 'tour-plan',
    title: 'Daily Study Plan',
    description:
      'Plan your day by subject. Add chapters and question counts with colour-coded tags for Physics, Chemistry, and Maths.',
  },
  {
    page: '/syllabus',
    target: 'tour-syllabus-filter',
    title: 'Browse & Filter',
    description:
      'Switch between subjects, search chapters, and filter by status, weightage, or priority to focus on what matters.',
  },
  {
    page: '/syllabus',
    target: 'tour-syllabus-chapters',
    title: 'Chapter Progress',
    description:
      'Click any chapter to expand and see topics. Mark progress as you study — right-click for more actions.',
  },
  {
    page: '/timetable',
    target: 'tour-timetable-grid',
    title: 'Weekly Planner',
    description:
      'Plan your week hour by hour. Tap any cell to assign a study block, break, or a custom tag.',
  },
  {
    page: '/timetable',
    target: 'tour-timetable-tags',
    title: 'Custom Tags',
    description:
      'Create your own tags with custom colours. Tags are reusable and make your timetable truly yours.',
  },
  {
    page: '/progress',
    target: 'tour-progress-readiness',
    title: 'Readiness Score',
    description:
      'Your overall readiness — calculated from chapter completion, study consistency, revision cycles, and questions solved.',
  },
  {
    page: '/progress',
    target: 'tour-progress-badges',
    title: 'Badges & Achievements',
    description:
      'Unlock badges as you hit milestones: study streaks, chapters done, questions solved, and more!',
  },
]

function waitForElement(selector: string, timeout = 6000): Promise<Element | null> {
  const found = document.querySelector(selector)
  if (found) return Promise.resolve(found)
  return new Promise(resolve => {
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) { observer.disconnect(); resolve(el) }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => { observer.disconnect(); resolve(null) }, timeout)
  })
}

function getViewport() {
  return { w: window.innerWidth, h: window.innerHeight }
}

/* ─── 4-rectangle spotlight cutout ─── */
function SpotlightRects({ rect }: { rect: DOMRect | null }) {
  if (!rect) return null
  const common: Record<string, any> = {
    position: 'fixed',
    zIndex: 200,
    pointerEvents: 'none',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  }
  return (
    <>
      {/* Top */}
      <div style={{ ...common, top: 0, left: 0, right: 0, height: rect.top }} />
      {/* Bottom */}
      <div style={{ ...common, top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }} />
      {/* Left */}
      <div style={{ ...common, top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }} />
      {/* Right */}
      <div style={{ ...common, top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }} />
    </>
  )
}

export default function DashboardTour() {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, update, loaded } = useSettingsStore()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [navigating, setNavigating] = useState(false)
  const stepRef = useRef(step)
  stepRef.current = step

  const shouldShow = loaded && settings.onboarded && !settings.tourCompleted

  /* Start tour after short delay */
  useEffect(() => {
    if (shouldShow && pathname === '/dashboard') {
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [shouldShow, pathname])

  /* Prevent body scroll while visible */
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [visible])

  /* Find target, navigate if needed, then show spotlight */
  useEffect(() => {
    if (!visible) return
    const s = TOUR_STEPS[step]
    if (!s) return

    if (pathname !== s.page) {
      setNavigating(true)
      setTargetRect(null)
      router.push(s.page)
      return
    }

    setNavigating(false)
    let cancelled = false

    waitForElement(`[data-tour="${s.target}"]`).then(el => {
      if (cancelled || !el || stepRef.current !== step) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      /* Wait for scroll to finish + read position */
      setTimeout(() => {
        if (cancelled || stepRef.current !== step) return
        const r = el.getBoundingClientRect()
        setTargetRect(r)
      }, 550)
    })

    return () => { cancelled = true }
  }, [visible, step, pathname, router])

  /* Recalculate rect on resize */
  useEffect(() => {
    if (!visible || !targetRect) return
    const handler = () => {
      const el = document.querySelector(`[data-tour="${TOUR_STEPS[step]?.target}"]`)
      if (el) setTargetRect(el.getBoundingClientRect())
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [visible, targetRect, step])

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setTargetRect(null)
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  const dismiss = () => {
    setTargetRect(null)
    setVisible(false)
    update({ tourCompleted: true })
  }

  if (!visible || !currentStep) return null

  return (
    <>
      <style>{`
        .tour-highlight {
          outline: 3px solid var(--c-blue) !important;
          outline-offset: 4px !important;
          border-radius: 18px !important;
          animation: tour-pulse 2s ease-in-out infinite !important;
        }
        @keyframes tour-pulse {
          0%, 100% { outline-color: var(--c-blue); }
          50% { outline-color: rgba(35, 131, 226, 0.3); }
        }
      `}</style>

      {/* Click catcher — blocks all page interaction */}
      <div
        className="fixed inset-0 z-[199]"
        style={{ background: 'transparent' }}
      />

      {/* Spotlight cutout */}
      <SpotlightRects rect={targetRect} />

      {/* Highlight ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none tour-highlight"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            zIndex: 201,
          }}
        />
      )}

      {/* Navigation loading state */}
      {navigating && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center">
          <div
            className="w-6 h-6 border-2 border-transparent border-t-[var(--c-blue)] rounded-full animate-spin"
          />
        </div>
      )}

      {/* Popup card */}
      <AnimatePresence mode="wait">
        {!navigating && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[440px] max-w-[calc(100vw-32px)] rounded-[18px] p-5 z-[210]"
            style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-card)',
              boxShadow: 'var(--c-shadow)',
            }}
          >
            {/* Step progress */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? 18 : 6,
                      background: i === step ? 'var(--c-blue)' : 'var(--c-border)',
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium ml-auto" style={{ color: 'var(--c-caption)' }}>
                {step + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            <h3 className="text-[17px] font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>
              {currentStep.title}
            </h3>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--c-muted)' }}>
              {currentStep.description}
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={dismiss}
                className="text-[12px] font-medium px-4 py-2 rounded-[40px] transition-all hover:opacity-70"
                style={{ color: 'var(--c-muted)', border: '1px solid var(--c-border-input)' }}
              >
                {isLast ? 'Dismiss' : 'Skip tour'}
              </button>
              <button
                onClick={handleNext}
                className="text-[12px] font-medium px-5 py-2 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px] active:translate-y-0"
                style={{ background: 'var(--c-btn-primary)' }}
              >
                {isLast ? 'Got it!' : 'Next →'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
