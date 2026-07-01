'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/store/settingsStore'
import { usePathname } from 'next/navigation'

interface TourStep {
  target: string
  title: string
  description: string
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'tour-greeting',
    title: 'Welcome to JEEIFY!',
    description:
      'Your personalised exam dashboard. See your chapter progress, days remaining, and overall completion — all at a glance.',
  },
  {
    target: 'tour-progress-cards',
    title: 'Subject Progress',
    description:
      'Track Physics, Chemistry, and Maths progress with coloured bars. Aim to keep all three above 75 % to stay on track.',
  },
  {
    target: 'tour-plan',
    title: 'Daily Study Plan',
    description:
      'Plan each day by adding chapters and question counts. Subjects are colour-coded with tags — create a plan every morning to stay organised.',
  },
  {
    target: 'tour-continue',
    title: 'Continue Studying',
    description:
      'We track your in-progress chapters so you can pick up right where you left off. Never lose momentum.',
  },
  {
    target: 'tour-heatmap',
    title: 'Study Heatmap',
    description:
      'Your last 30 days of activity — darker squares mean more study time. Try to fill every day and build a streak!',
  },
  {
    target: 'tour-pace',
    title: 'Study Pace',
    description:
      'Know if you are On Track or Behind for each subject. The pace adapts to your exam date and remaining syllabus.',
  },
  {
    target: 'tour-sidebar',
    title: 'Navigation Sidebar',
    description:
      'Use the sidebar to access all features: Syllabus, Timetable, Progress, Tests, AI Assistant, Settings, and more.',
  },
  {
    target: 'tour-ai-tutor',
    title: 'AI Tutor',
    description:
      'Need help with a concept? Ask the AI Tutor JEE questions, get step-by-step solutions, log your progress, or plan your day using natural language.',
  },
]

export default function DashboardTour() {
  const pathname = usePathname()
  const { settings, update, loaded } = useSettingsStore()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  const shouldShow =
    loaded &&
    settings.onboarded &&
    !settings.tourCompleted &&
    pathname === '/dashboard'

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  const scrollToTarget = useCallback((targetId: string) => {
    const el = document.querySelector(`[data-tour="${targetId}"]`) as HTMLElement
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  /* Highlight management */
  useEffect(() => {
    if (!visible) return
    const currentTarget = TOUR_STEPS[step]?.target
    if (!currentTarget) return

    document.querySelectorAll('.tour-highlight').forEach(el =>
      el.classList.remove('tour-highlight')
    )
    const el = document.querySelector(`[data-tour="${currentTarget}"]`)
    if (el) {
      el.classList.add('tour-highlight')
    }
    scrollToTarget(currentTarget)

    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el =>
        el.classList.remove('tour-highlight')
      )
    }
  }, [visible, step, scrollToTarget])

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  const dismiss = () => {
    document.querySelectorAll('.tour-highlight').forEach(el =>
      el.classList.remove('tour-highlight')
    )
    setVisible(false)
    update({ tourCompleted: true })
  }

  if (!shouldShow || !visible) return null

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1

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

      <div className="fixed inset-0 z-[200]">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[440px] max-w-[calc(100vw-32px)] rounded-[18px] p-5 z-10"
            style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-card)',
              boxShadow: 'var(--c-shadow)',
            }}
          >
            {/* Step dots */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? 18 : 6,
                      background:
                        i === step ? 'var(--c-blue)' : 'var(--c-border)',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[10px] font-medium ml-auto"
                style={{ color: 'var(--c-caption)' }}
              >
                {step + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            <h3
              className="text-[17px] font-semibold mb-1.5"
              style={{ color: 'var(--c-text)' }}
            >
              {currentStep.title}
            </h3>
            <p
              className="text-[13px] leading-relaxed mb-5"
              style={{ color: 'var(--c-muted)' }}
            >
              {currentStep.description}
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={dismiss}
                className="text-[12px] font-medium px-4 py-2 rounded-[40px] transition-all hover:opacity-70"
                style={{
                  color: 'var(--c-muted)',
                  border: '1px solid var(--c-border-input)',
                }}
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
        </AnimatePresence>
      </div>
    </>
  )
}
