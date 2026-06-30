'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

interface Question {
  id: string
  type: 'text' | 'select' | 'image' | 'checkbox'
  title: string
  subtitle?: string
  mandatory: boolean
  options?: { value: string; label: string }[]
}

const QUESTIONS: Question[] = [
  {
    id: 'name',
    type: 'text',
    title: "What's your name?",
    subtitle: "We'll use this to personalise your experience",
    mandatory: true,
  },
  {
    id: 'class',
    type: 'select',
    title: 'Which class are you in?',
    subtitle: 'Are you currently in school or preparing after 12th?',
    mandatory: true,
    options: [
      { value: '11', label: 'Class 11' },
      { value: '12', label: 'Class 12' },
      { value: 'dropper', label: 'Dropper (Completed 12th)' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'exam',
    type: 'select',
    title: 'Which exam are you targeting?',
    subtitle: 'Choose your primary goal',
    mandatory: true,
    options: [
      { value: 'jee_main', label: 'JEE Main' },
      { value: 'jee_advanced', label: 'JEE Advanced' },
      { value: 'both', label: 'Both Main & Advanced' },
    ],
  },
  {
    id: 'study_hours',
    type: 'select',
    title: 'How many hours can you study daily?',
    subtitle: 'Be honest — we\'ll build a realistic plan',
    mandatory: true,
    options: [
      { value: '2-4', label: '2–4 hours' },
      { value: '4-6', label: '4–6 hours' },
      { value: '6-8', label: '6–8 hours' },
      { value: '8-10', label: '8–10 hours' },
      { value: '10+', label: '10+ hours' },
    ],
  },
  {
    id: 'avatar',
    type: 'image',
    title: 'Add a profile picture',
    subtitle: 'Make your profile yours — you can skip this',
    mandatory: false,
  },
  {
    id: 'referral',
    type: 'checkbox',
    title: 'How did you hear about us?',
    subtitle: 'Help us improve — you can skip this too',
    mandatory: false,
    options: [
      { value: 'google', label: 'Google Search' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'friend', label: 'Friend or Classmate' },
      { value: 'teacher', label: 'Teacher or Coaching' },
      { value: 'other', label: 'Other' },
    ],
  },
]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

export default function OnboardingFlow() {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, update, loaded } = useSettingsStore()
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [avatarDataUrl, setAvatarDataUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({ class: '12', exam: 'both', study_hours: '6-8' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const APP_PATHS = ['/dashboard', '/syllabus', '/roadmap', '/timetable', '/progress', '/pomodoro', '/completion', '/activity', '/questions', '/tests', '/revision', '/formula-vault', '/settings']

  const [checkingOnboarded, setCheckingOnboarded] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const onboardingKey = (email: string | null) => email ? `jee_onboarded_${btoa(email).slice(0, 20)}` : null

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) { setSignedIn(false); setCheckingOnboarded(false); return }
    sb.auth.getUser().then((res: any) => {
      const user = res.data?.user
      const email = user?.email || null
      setUserEmail(email)
      setSignedIn(!!user)
      const currentState = useSettingsStore.getState()
      if (currentState.settings.onboarded) { setCheckingOnboarded(false); return }
      const key = email ? onboardingKey(email) : null
      const lsOnboarded = key ? localStorage.getItem(key) === '1' : false
      const metaOnboarded = user?.user_metadata?.onboarded === true
      if (lsOnboarded || metaOnboarded) {
        update({ onboarded: true })
      }
      setCheckingOnboarded(false)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const u = session?.user
      const email = u?.email || null
      setUserEmail(email)
      setSignedIn(!!u)
      const currentState = useSettingsStore.getState()
      if (currentState.settings.onboarded) return
      const key = email ? onboardingKey(email) : null
      const lsOnboarded = key ? localStorage.getItem(key) === '1' : false
      const metaOnboarded = u?.user_metadata?.onboarded === true
      if (lsOnboarded || metaOnboarded) {
        update({ onboarded: true })
      }
    })
    return () => subscription?.unsubscribe()
  }, [])

  if (!APP_PATHS.some(p => pathname.startsWith(p))) return null
  if (!loaded || signedIn === null || checkingOnboarded) {
    return (
      <div className="fixed inset-0 z-[100]" style={{ background: 'var(--c-bg-gradient)' }} />
    )
  }
  if (settings.onboarded || !signedIn) return null

  const currentQuestion = QUESTIONS[step]
  const isFirst = step === 0
  const isLast = step === QUESTIONS.length - 1

  const canProceed = !currentQuestion.mandatory || (currentQuestion.id === 'avatar' ? true : !!answers[currentQuestion.id])

  const handleNext = () => {
    if (!canProceed) return
    if (isLast) {
      handleFinish()
      return
    }
    setDirection(1)
    setStep(s => s + 1)
  }

  const handlePrev = () => {
    setDirection(-1)
    setStep(s => s - 1)
  }

  const handleSkip = () => {
    if (isLast) {
      handleFinish()
      return
    }
    setDirection(1)
    setStep(s => s + 1)
  }

  const handleFinish = async () => {
    const updates: Record<string, any> = {
      name: answers.name || settings.name || 'User',
      dailyStudyHours: answers.study_hours === '10+' ? 10 : parseInt(answers.study_hours?.split('-')[1]) || 9,
      onboarded: true,
    }
    if (answers.exam === 'jee_advanced') updates.examDate = '2027-06-01'
    if (avatarDataUrl) updates.avatarUrl = avatarDataUrl
    await update(updates)
    const key = onboardingKey(userEmail)
    if (key) localStorage.setItem(key, '1')
    const sb = getSupabase()
    if (sb) {
      try { await sb.auth.updateUser({ data: { onboarded: true } }) } catch {}
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleNext() }
  }

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <input
            autoFocus
            value={answers.name || ''}
            onChange={e => setAnswers(a => ({ ...a, name: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name"
            className="w-full px-5 py-3.5 text-lg outline-none rounded-[16px] transition-all"
            style={{
              background: 'var(--c-input)',
              border: '1px solid var(--c-border-input)',
              color: 'var(--c-text)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
          />
        )

      case 'select':
        return (
          <div className="grid gap-2.5">
            {currentQuestion.options?.map(opt => {
              const selected = answers[currentQuestion.id] === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setAnswers(a => ({ ...a, [currentQuestion.id]: opt.value }))}
                  className="w-full text-left px-5 py-3.5 rounded-[14px] text-sm font-medium transition-all duration-200"
                  style={{
                    background: selected ? 'rgba(35,131,226,0.08)' : 'var(--c-tag)',
                    border: `1px solid ${selected ? 'var(--c-blue)' : 'var(--c-border)'}`,
                    color: selected ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )

      case 'checkbox':
        return (
          <div className="grid gap-2.5">
            {currentQuestion.options?.map(opt => {
              const selected = answers[currentQuestion.id] === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setAnswers(a => ({ ...a, [currentQuestion.id]: opt.value }))}
                  className="w-full text-left px-5 py-3.5 rounded-[14px] text-sm font-medium transition-all duration-200"
                  style={{
                    background: selected ? 'rgba(35,131,226,0.08)' : 'var(--c-tag)',
                    border: `1px solid ${selected ? 'var(--c-blue)' : 'var(--c-border)'}`,
                    color: selected ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )

      case 'image':
        return (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 hover:opacity-80"
              style={{
                background: avatarDataUrl ? 'transparent' : 'var(--c-tag)',
                border: '2px dashed var(--c-border)',
                cursor: 'pointer',
              }}
            >
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
              {avatarFile ? avatarFile.name : 'Tap to upload your photo'}
            </p>
          </div>
        )
    }
  }

  if (settings.onboarded) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'var(--c-bg-gradient)' }}
    >
      <div className="w-full max-w-lg mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-10">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? 'var(--c-blue)' : 'var(--c-border)',
              }}
            />
          ))}
        </div>

        {/* Step counter */}
        <p className="text-xs font-medium mb-6" style={{ color: 'var(--c-muted)' }}>
          Step {step + 1} of {QUESTIONS.length}
        </p>

        {/* Animated question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Title with "Let's personalise you" for first question */}
            {isFirst && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--c-blue)' }}
              >
                Let&apos;s personalise you
              </motion.p>
            )}

            <h2 className="text-[clamp(24px,3vw,30px)] font-semibold tracking-[-0.3px] mb-1.5" style={{ color: 'var(--c-text)' }}>
              {currentQuestion.title}
            </h2>
            {currentQuestion.subtitle && (
              <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>
                {currentQuestion.subtitle}
              </p>
            )}

            <div className="mt-6">
              {renderQuestion()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <motion.div
          className="flex items-center justify-between mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handlePrev}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${step === 0 ? 'invisible' : 'hover:opacity-80'}`}
            style={{ color: 'var(--c-muted)' }}
          >
            ← Back
          </button>

          <div className="flex gap-2">
            {!currentQuestion.mandatory && (
              <button
                onClick={handleSkip}
                className="text-sm font-medium px-5 py-2 rounded-full transition-all hover:opacity-80"
                style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="text-sm font-medium px-6 py-2 rounded-full text-white transition-all disabled:opacity-40"
              style={{
                background: canProceed ? 'var(--c-blue)' : 'var(--c-border)',
                cursor: canProceed ? 'pointer' : 'not-allowed',
              }}
            >
              {isLast ? 'Finish' : 'Next →'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
