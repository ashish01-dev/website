'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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
  {
    page: '/tests',
    target: 'tour-tests-log',
    title: 'Log Mock Tests',
    description:
      'Record your mock test scores with subjects, chapters, and accuracy. Get confetti when you score above 80%!',
  },
  {
    page: '/tests',
    target: 'tour-tests-history',
    title: 'Test History',
    description:
      'View all your logged tests with colour-coded accuracy. Track your improvement over time.',
  },
  {
    page: '/questions',
    target: 'tour-questions-log',
    title: 'Log Questions',
    description:
      'Log questions you have solved per subject and chapter. Keep a running count of your practice.',
  },
  {
    page: '/questions',
    target: 'tour-questions-breakdown',
    title: 'Question Breakdown',
    description:
      'Drill into your question logs by subject and chapter. See exactly where your practice hours are going.',
  },
]

export default function DashboardTour() {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, update, loaded } = useSettingsStore()
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [phase, setPhase] = useState<'navigating' | 'showing'>('navigating')
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const stepRef = useRef(step)
  stepRef.current = step

  const shouldShow = loaded && settings.onboarded && !settings.tourCompleted

  /* Start tour after user lands on dashboard */
  useEffect(() => {
    if (shouldShow && pathname === '/dashboard' && !started) {
      const t = setTimeout(() => setStarted(true), 800)
      return () => clearTimeout(t)
    }
  }, [shouldShow, pathname, started])

  /* Scroll lock while tour is active */
  useEffect(() => {
    if (started) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [started])

  const currentStep = TOUR_STEPS[step]

  /* Navigate to correct page + find target element */
  useEffect(() => {
    if (!started || !currentStep) return
    let cancelled = false

    const run = async () => {
      /* Navigate if on wrong page */
      if (pathname !== currentStep.page) {
        setPhase('navigating')
        setTargetRect(null)
        router.push(currentStep.page)
        return
      }

      setPhase('navigating')
      setTargetRect(null)

      const selector = `[data-tour="${currentStep.target}"]`

      /* Wait for element to appear in DOM */
      let el = document.querySelector(selector)
      if (!el) {
        el = await new Promise<Element>(resolve => {
          const obs = new MutationObserver(() => {
            const f = document.querySelector(selector)
            if (f) { obs.disconnect(); resolve(f) }
          })
          obs.observe(document.body, { childList: true, subtree: true })
        })
      }

      if (cancelled) return

      /* Scroll to element */
      ;(el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })

      /* Wait for scroll to settle */
      await new Promise(r => setTimeout(r, 650))

      if (cancelled) return

      /* Set spotlight rectangle */
      setTargetRect(el.getBoundingClientRect())
      setPhase('showing')
    }

    run()
    return () => { cancelled = true }
  }, [started, step, pathname, currentStep, router])

  /* Track element position every 200ms to keep spotlight aligned */
  useEffect(() => {
    if (phase !== 'showing' || !currentStep) return
    const interval = setInterval(() => {
      const el = document.querySelector(`[data-tour="${currentStep.target}"]`)
      if (!el) return
      const r = el.getBoundingClientRect()
      setTargetRect(prev => {
        if (!prev) return r
        return prev.left === r.left && prev.top === r.top &&
               prev.width === r.width && prev.height === r.height
          ? prev : r
      })
    }, 200)
    return () => clearInterval(interval)
  }, [phase, currentStep])

  const isLast = step === TOUR_STEPS.length - 1

  const handleNext = () => {
    const next = step + 1
    if (next < TOUR_STEPS.length) {
      setTargetRect(null)
      setPhase('navigating')
      setStep(next)
    } else {
      dismiss()
    }
  }

  const dismiss = () => {
    setTargetRect(null)
    setPhase('navigating')
    setStarted(false)
    document.body.style.overflow = ''
    update({ tourCompleted: true })
  }

  if (!started || !currentStep) return null

  return (
    <>
      <style>{`
        .tour-highlight {
          outline: 3px solid var(--c-blue) !important;
          outline-offset: 4px !important;
          border-radius: 18px !important;
          animation: tour-pulse 2s ease-in-out infinite !important;
          transition: outline 0.15s ease !important;
        }
        @keyframes tour-pulse {
          0%, 100% { outline-color: var(--c-blue); }
          50% { outline-color: rgba(35, 131, 226, 0.25); }
        }
      `}</style>

      {/* Click catcher */}
      <div className="fixed inset-0 z-[199]" />

      {/* 4-rectangle spotlight overlays — no clip-path, reliable backdrop-filter */}
      {targetRect && (
        <>
          <div className="fixed z-[200] pointer-events-none" style={{
            top: 0, left: 0, width: '100%', height: targetRect.top,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />
          <div className="fixed z-[200] pointer-events-none" style={{
            top: targetRect.bottom, left: 0, width: '100%',
            height: `calc(100% - ${targetRect.bottom}px)`,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />
          <div className="fixed z-[200] pointer-events-none" style={{
            top: targetRect.top, left: 0,
            width: targetRect.left, height: targetRect.height,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />
          <div className="fixed z-[200] pointer-events-none" style={{
            top: targetRect.top, left: targetRect.right,
            width: `calc(100% - ${targetRect.right}px)`,
            height: targetRect.height,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />
        </>
      )}

      {!targetRect && (
        <div className="fixed inset-0 z-[200] bg-black/55" />
      )}

      {/* Highlight ring on the target element */}
      {targetRect && (
        <div
          className="fixed z-[200] pointer-events-none tour-highlight"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Loading indicator during navigation */}
      {phase === 'navigating' && (
        <div className="fixed inset-0 z-[210] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--c-blue)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm animate-pulse" style={{ color: 'var(--c-muted)' }}>
            {step === 0 ? 'Preparing tour...' : 'Loading next feature...'}
          </p>
        </div>
      )}

      {/* Popup card */}
      {phase === 'showing' && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[440px] max-w-[calc(100vw-32px)] rounded-[18px] p-5 z-[210]"
          style={{
            background: 'var(--c-card)',
            border: '1px solid var(--c-border-card)',
            boxShadow: 'var(--c-shadow)',
          }}
        >
          {/* Step progress dots */}
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
    </>
  )
}
