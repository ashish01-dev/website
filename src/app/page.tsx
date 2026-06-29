'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: 'menu_book', label: 'Syllabus Tracker', desc: 'Track every chapter and topic across Physics, Chemistry, and Maths with real-time progress.' },
  { icon: 'map', label: 'Smart Roadmap', desc: 'Personalized study roadmap that adapts to your pace and exam timeline.' },
  { icon: 'calendar_month', label: 'Hourly Timetable', desc: 'Drag-and-drop weekly planner with subject slots, breaks, and revision blocks.' },
  { icon: 'trending_up', label: 'Progress Analytics', desc: 'Visual breakdown of completion rates, pace status, and subject-wise performance.' },
  { icon: 'timer', label: 'Pomodoro Timer', desc: 'Built-in focus timer with session tracking to optimize your study streaks.' },
  { icon: 'assignment', label: 'Test Analyzer', desc: 'Log mock test scores, track improvement, and identify weak areas.' },
]

const PLANS = [
  {
    name: 'Free', price: '0', desc: 'For individual aspirants',
    features: ['Full syllabus tracking', 'Timetable planner', 'Pomodoro timer', 'Test score logging', 'Activity journal', '500 MB storage'],
    cta: 'Get Started', popular: false,
  },
  {
    name: 'Pro', price: '9', desc: 'For serious preparation',
    features: ['Everything in Free', '1-on-1 live support', 'Faster support resolution', '5 GB storage', 'Advanced analytics', 'Priority features access'],
    cta: 'Go Pro', popular: true,
  },
  {
    name: 'Teams', price: '—', desc: 'For study groups & coaching',
    features: ['Everything in Pro', 'Collaborative dashboards', 'Shared progress tracking', 'Unlimited storage', 'Custom integrations', 'Dedicated account manager'],
    cta: 'Contact Us', popular: false,
  },
]

const STEPS = [
  { step: '01', title: 'Connect Google', desc: 'Sign in with your Google account in under 10 seconds. No credit card needed.' },
  { step: '02', title: 'Set Your Target', desc: 'Pick your exam date and daily study goals. We calculate the perfect pace for you.' },
  { step: '03', title: 'Track Daily', desc: 'Log chapters, questions, tests, and pomodoros. Watch your progress compound daily.' },
  { step: '04', title: 'Ace the Exam', desc: 'Stay on track with smart recommendations and reach your target with confidence.' },
]

const TOPPERS = [
  { name: 'Rohan Mehta', rank: 'AIR 1', score: '360/360', year: '2026', quote: 'Consistency over intensity. JEEIFY kept me accountable every single day.' },
  { name: 'Ananya Sharma', rank: 'AIR 3', score: '352/360', year: '2026', quote: 'The pace tracking algorithm is genius. It told me exactly where I was falling behind.' },
  { name: 'Arjun Reddy', rank: 'AIR 7', score: '348/360', year: '2025', quote: 'From 150 to 320+ marks — the syllabus tracker and test analyzer changed everything.' },
  { name: 'Priya Patel', rank: 'AIR 15', score: '341/360', year: '2026', quote: 'I planned every hour of my day using the timetable. Absolute game changer.' },
]

const STATS = [
  { value: '50,000+', label: 'Hours Tracked', suffix: '' },
  { value: '10,000+', label: 'Active Students', suffix: '' },
  { value: '98.6%', label: 'Avg. Score Improvement', suffix: '' },
  { value: '250+', label: 'AIR Rankers Mentored', suffix: '' },
]

function useCountUp(ref: React.RefObject<HTMLDivElement | null>, target: number, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now()

          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))

            if (progress < 1) requestAnimationFrame(animate)
          }

          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, target, duration])

  return count
}

function CountUp({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const num = parseInt(value.replace(/,/g, ''))
  const count = useCountUp(ref, num)

  return (
    <div ref={ref} className="text-center">
      <div className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-[-1px]" style={{ color: '#0f0f0f' }}>
        {value.includes('+') ? `${count.toLocaleString()}+` : `${count}%`}
      </div>
      <div className="text-[13px] mt-1" style={{ color: '#888' }}>{label}</div>
    </div>
  )
}

function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }

const PASSWORD_RULES = [
  { label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'At least 1 number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'At least 6 characters', test: (v: string) => v.length >= 6 },
]

export default function LandingPage() {
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState(false)
  const [showTc, setShowTc] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
  const [topHovered, setTopHovered] = useState<number | null>(null)

  const emailValid = isValidEmail(authEmail)
  const emailWarning = emailTouched && authEmail.length > 0 && !emailValid
  const canSubmit = emailValid && PASSWORD_RULES.every(r => r.test(authPassword))

  useEffect(() => {
    const sb = getSupabase()
    if (sb) {
      sb.auth.getUser().then((res: { data: { user: Session['user'] | null } }) => { if (res.data.user) router.replace('/dashboard') })
      sb.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => { if (session?.user) router.replace('/dashboard') })
    }
  }, [router])

  const openAuth = (mode: 'signup' | 'login') => { setAuthMode(mode); setShowAuth(true); setAuthError(''); setSubmittedEmail(false); setEmailTouched(false) }

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) return
    const { data } = await sb.auth.getUser() as any
    if (data?.user) { router.push('/dashboard'); return }
    const origin = window.location.origin
    const allowed = ['http://localhost:3000', 'https://jee-2027.vercel.app', 'https://jeecommandcenter.vercel.app']
    const redirectTo = allowed.includes(origin) ? `${origin}/auth/callback` : 'https://jee-2027.vercel.app/auth/callback'
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    setShowAuth(false)
  }

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedEmail(true)
    setAuthError('This feature is in works. Please login with Google.')
  }

  const resetAuth = () => { setShowAuth(false); setAuthEmail(''); setAuthPassword(''); setAuthError(''); setEmailTouched(false); setSubmittedEmail(false) }
  const openContact = () => router.push('/contact')

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to top left, #F5F5F5, #F7F7F7)' }}>
      {/* Navbar */}
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-[9px]" style={{ cursor: 'pointer' }}>
            <img
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg"
              alt="logo"
              style={{ height: 28, filter: 'brightness(0)' }}
            />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: '#111' }}>JEEIFY</span>
          </button>

          <div className="hidden md:flex items-center gap-9">
            <a href="#features" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Features</a>
            <a href="#results" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Results</a>
            <a href="#pricing" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Pricing</a>
            <a href="#about" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>About</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => openAuth('login')} className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Sign In</button>
            <button
              onClick={() => openAuth('signup')}
              className="flex items-center gap-2 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
              style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)')}
            >
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
              Get Started
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col items-center justify-center w-6 h-6 gap-[5px]"
            style={{ cursor: 'pointer' }}
          >
            <span className={`block h-[2px] w-6 bg-[#111] rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
            <span className={`block h-[2px] w-6 bg-[#111] rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[2px] w-6 bg-[#111] rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px] pointer-events-none max-md:left-5 max-md:right-5" style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)',
          backgroundSize: '6px 1px',
        }} />
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 bg-white flex flex-col px-10 py-8 transition-transform duration-500 md:hidden`}
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      >
        <div className="flex justify-end mb-16">
          <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center" style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Results', href: '#results' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'About', href: '#about' },
            { label: 'Sign In', href: '#', action: () => { setMenuOpen(false); openAuth('login') } },
          ].map(item => (
            item.href === '#'
              ? (
                <button key={item.label} onClick={item.action}
                  className="text-left text-[38px] font-extrabold tracking-[-1.5px] py-6 border-b border-black/[0.06]"
                  style={{ color: '#111' }}
                >{item.label}</button>
              )
              : (
                <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                  className="text-[38px] font-extrabold tracking-[-1.5px] py-6 border-b border-black/[0.06]"
                  style={{ color: '#111' }}
                >{item.label}</a>
              )
          ))}
        </div>
        <div className="mt-auto">
          <button
            onClick={() => { setMenuOpen(false); openAuth('signup') }}
            className="flex items-center gap-3 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px]"
            style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
          >
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Get Started
          </button>
        </div>
      </div>

      {/* Hero */}
      <motion.section {...fadeUp} className="flex flex-col items-center justify-center text-center px-5 py-24 md:py-32">
        <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-6" style={{ color: '#888' }}>JEE 2027 — Command Center</p>
        <h1 className="text-[clamp(42px,7vw,72px)] font-medium leading-[1.05] tracking-[-2px] max-w-4xl" style={{ color: '#0f0f0f' }}>
          Master your JEE prep<br />
          <span className="text-[#2383e2] font-semibold">with purpose.</span>
        </h1>
        <p className="text-[15px] mt-5 max-w-lg" style={{ color: '#888', lineHeight: 1.7 }}>
          Track syllabus progress, optimize your timetable, analyze tests — a command center built for the systematic mind.
        </p>
        <div className="flex items-center gap-4 mt-8 flex-wrap justify-center">
          <button
            onClick={() => openAuth('signup')}
            className="flex items-center gap-2 text-white text-[14px] font-medium rounded-[40px] px-[22px] py-[8px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
            style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)')}
          >
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Start Free
          </button>
          <a href="#features"
            className="text-[14px] font-medium rounded-[40px] px-[22px] py-[8px] transition-all duration-200 hover:-translate-y-[1px]"
            style={{ color: '#555', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >Explore</a>
        </div>
      </motion.section>

      {/* Stats Strip */}
      <motion.div {...fadeUp} className="max-w-[900px] mx-auto px-5 pb-12">
        <div className="rounded-[18px] px-[28px] py-[32px] grid grid-cols-2 md:grid-cols-4 gap-8" style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          {STATS.map(s => (
            <CountUp key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.section {...fadeUp} id="features" className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: '#888' }}>Capabilities</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>
            Everything you need.<span className="text-[#888]"> Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[3px]"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: '#eaecf0' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#111' }}>{f.icon}</span>
              </div>
              <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: '#0f0f0f' }}>{f.label}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#888' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section {...fadeUp} className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto" style={{ background: 'linear-gradient(to top left, #F5F5F5, #F7F7F7)' }}>
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: '#888' }}>How It Works</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>
            From zero to<span className="text-[#888]"> hero.</span>
          </h2>
          <p className="text-[14px] mt-4 max-w-md mx-auto" style={{ color: '#888', lineHeight: 1.7 }}>
            Four simple steps to transform your preparation into a structured, trackable system.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[3px]"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div className="text-[32px] font-bold tracking-[-1px] mb-3" style={{ color: '#2383e2' }}>{s.step}</div>
              <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: '#0f0f0f' }}>{s.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#888' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Results / Toppers */}
      <motion.section {...fadeUp} id="results" className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: '#888' }}>Results</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>
            Built by toppers.<span className="text-[#888]"> For toppers.</span>
          </h2>
          <p className="text-[14px] mt-4 max-w-md mx-auto" style={{ color: '#888', lineHeight: 1.7 }}>
            Our platform has helped hundreds of students achieve top ranks. Here are some of our standout performers.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {TOPPERS.map((t, i) => (
            <div
              key={t.name}
              onMouseEnter={() => setTopHovered(i)}
              onMouseLeave={() => setTopHovered(null)}
              className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: topHovered === i ? '0 8px 28px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
                transform: topHovered === i ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[16px] font-bold" style={{ color: '#0f0f0f' }}>{t.name}</div>
                  <div className="text-[12px]" style={{ color: '#888' }}>JEE {t.year}</div>
                </div>
                <div className="text-right">
                  <div className="text-[20px] font-bold tracking-tight" style={{ color: '#2383e2' }}>{t.rank}</div>
                  <div className="text-[12px] font-medium" style={{ color: '#0f8a5e' }}>{t.score}</div>
                </div>
              </div>
              <div className="border-t border-black/[0.06] pt-3">
                <p className="text-[13px] italic leading-relaxed" style={{ color: '#888' }}>&ldquo;{t.quote}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section {...fadeUp} id="pricing" className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: '#888' }}>Pricing</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>
            Choose your plan
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredPlan(i)}
              onMouseLeave={() => setHoveredPlan(null)}
              className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200"
              style={{
                background: '#fff',
                border: plan.popular ? '1px solid #2383e2' : '1px solid rgba(0,0,0,0.05)',
                boxShadow: hoveredPlan === i ? '0 8px 28px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
                transform: hoveredPlan === i ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              {plan.popular && (
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2383e2] mb-3">Most Popular</div>
              )}
              <div className="text-[18px] font-bold mb-1" style={{ color: '#0f0f0f' }}>{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[36px] font-bold tracking-tight" style={{ color: '#0f0f0f' }}>{plan.price === '—' ? '—' : `$${plan.price}`}</span>
                {plan.price !== '—' && <span className="text-[13px]" style={{ color: '#888' }}>/month</span>}
              </div>
              <p className="text-[13px] mb-6" style={{ color: '#888' }}>{plan.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="text-[13px] flex items-center gap-2" style={{ color: '#555' }}>
                    <span className="text-[#2383e2]">✓</span> {f}
                  </li>
                ))}
              </ul>
              {plan.name === 'Teams' ? (
                <button onClick={openContact}
                  className="w-full py-3 text-[13px] font-medium rounded-[40px] transition-all duration-200"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#555', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.color = '#111' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#555' }}
                >Contact Us</button>
              ) : (
                <button onClick={() => openAuth('signup')}
                  className="w-full py-3 text-[13px] font-medium rounded-[40px] text-white transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
                  style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)')}
                >{plan.cta}</button>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section {...fadeUp} id="about" className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: '#888' }}>Stories</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>
            What our users say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { quote: 'The daily plan modal + pace tracking combo is a game changer. I know exactly what to study every day.', author: 'Arjun S.', role: 'JEE 2026 Aspirant' },
            { quote: 'Finally a tool that understands the JEE syllabus. The chapter-level tracking is incredibly detailed.', author: 'Priya M.', role: 'JEE 2027 Aspirant' },
            { quote: 'The Pomodoro timer + activity journal helped me stay consistent for 6+ hours daily.', author: 'Rahul K.', role: 'JEE 2026 Aspirant' },
          ].map((t, i) => (
            <div
              key={t.author}
              className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[3px]"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
            >
              <div className="text-[#2383e2] text-2xl font-serif mb-3 leading-none">&ldquo;</div>
              <p className="text-[14px] mb-6 leading-relaxed" style={{ color: '#555' }}>{t.quote}</p>
              <div className="border-t border-black/[0.06] pt-4">
                <div className="text-[14px] font-semibold" style={{ color: '#0f0f0f' }}>{t.author}</div>
                <div className="text-[12px]" style={{ color: '#888' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section {...fadeUp} className="px-5 py-24 md:py-32 text-center">
        <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: '#888' }}>Ready</p>
        <h2 className="text-[clamp(32px,5vw,52px)] font-medium tracking-[-1.5px] mb-4" style={{ color: '#0f0f0f' }}>
          Ace JEE 2027.<br /><span style={{ color: '#888' }}>Start today.</span>
        </h2>
        <p className="text-[14px] mb-8 max-w-md mx-auto" style={{ color: '#888', lineHeight: 1.7 }}>
          Free. No credit card. Just your Google account and the determination to succeed.
        </p>
        <button onClick={() => openAuth('signup')}
          className="inline-flex items-center gap-2 text-white text-[14px] font-medium rounded-[40px] px-[24px] py-[10px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
          style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)')}
        >
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
          Get Started Free
        </button>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-12 md:py-16 px-5 max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#888' }}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ background: '#111' }}>J</div>
            JEEIFY
          </div>
          <div className="flex items-center gap-6 text-[12px] font-medium flex-wrap justify-center">
            <a href="#features" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6, color: '#111' }}>Features</a>
            <button onClick={() => setShowTc(true)} className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6, color: '#111', cursor: 'pointer' }}>Terms</button>
            <button onClick={() => setShowPrivacy(true)} className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6, color: '#111', cursor: 'pointer' }}>Privacy</button>
            <button onClick={openContact} className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6, color: '#111', cursor: 'pointer' }}>Contact</button>
            <a href="#pricing" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6, color: '#111' }}>Pricing</a>
          </div>
        </div>
        <div className="text-center text-[12px]" style={{ color: '#aaa' }}>
          Made with <span style={{ color: '#E03E3E' }}>&#9829;</span> by Ashish
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm p-8 bg-white rounded-[18px] relative" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-bold" style={{ color: '#111' }}>{authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
              <button onClick={resetAuth} className="hover:opacity-60 transition-opacity" style={{ cursor: 'pointer' }}>
                <svg className="w-5 h-5" fill="none" stroke="#888" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <button onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-[40px] transition-all duration-200"
              style={{ border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'transparent' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              <span className="text-sm font-medium" style={{ color: '#111' }}>Continue with Google</span>
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/[0.06]" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#aaa' }}>Or</span></div>
            </div>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <input type="email" placeholder="Email address" value={authEmail}
                  onChange={e => { setAuthEmail(e.target.value); setAuthError(''); setSubmittedEmail(false); if (!emailTouched) setEmailTouched(true) }}
                  className={`w-full px-4 py-3 text-sm outline-none transition-colors rounded-[40px] ${emailWarning ? 'border-[#E03E3E]' : ''}`}
                  style={{ border: `1px solid ${emailWarning ? '#E03E3E' : 'rgba(0,0,0,0.1)'}`, color: '#111' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                  onBlur={e => { if (!emailWarning) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
                {emailWarning && <p className="text-[#E03E3E] text-[11px] mt-1.5 font-medium">Please enter a valid email address</p>}
              </div>
              <div>
                <input type="password" placeholder="Password" value={authPassword}
                  onChange={e => { setAuthPassword(e.target.value); setAuthError(''); setSubmittedEmail(false) }}
                  className="w-full px-4 py-3 text-sm outline-none rounded-[40px] transition-colors"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#111' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
                {authMode === 'signup' && authPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {PASSWORD_RULES.map(r => {
                      const pass = r.test(authPassword)
                      return <div key={r.label} className={`text-[11px] flex items-center gap-1.5 ${pass ? 'text-[#0f8a5e]' : 'text-[#aaa]'}`}>
                        <span>{pass ? '✓' : '○'}</span> {r.label}
                      </div>
                    })}
                  </div>
                )}
              </div>
              {authError && submittedEmail && <p className="text-[#d9730d] text-[11px] text-center font-medium">{authError}</p>}
              <button type="submit" disabled={!canSubmit}
                className="w-full px-4 py-3 text-sm font-semibold rounded-[40px] transition-all disabled:opacity-40"
                style={{
                  background: canSubmit ? '#2383e2' : 'rgba(0,0,0,0.06)',
                  color: canSubmit ? '#fff' : '#aaa',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}>
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <p className="text-[12px] text-center mt-4" style={{ color: '#888' }}>
              {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setAuthEmail(''); setAuthPassword(''); setAuthError(''); setEmailTouched(false); setSubmittedEmail(false) }} className="font-medium hover:underline" style={{ color: '#2383e2', cursor: 'pointer' }}>Switch</button>
            </p>
          </div>
        </div>
      )}

      {/* T&C Modal */}
      {showTc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg p-8 bg-white rounded-[18px] relative max-h-[80vh] overflow-y-auto" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2">
              <h2 className="text-[16px] font-bold" style={{ color: '#111' }}>Terms &amp; Conditions</h2>
              <button onClick={() => setShowTc(false)} className="hover:opacity-60 transition-opacity" style={{ cursor: 'pointer' }}>
                <svg className="w-5 h-5" fill="none" stroke="#888" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-[13px] leading-relaxed space-y-3" style={{ color: '#666' }}>
              <p><strong style={{ color: '#333' }}>1. Acceptance of Terms</strong><br />By accessing JEEIFY, you agree to these terms. If you do not agree, do not use the service.</p>
              <p><strong style={{ color: '#333' }}>2. Description of Service</strong><br />JEEIFY provides a personal study tracking dashboard for JEE aspirants. The service is provided &ldquo;as is&rdquo; without warranty.</p>
              <p><strong style={{ color: '#333' }}>3. User Accounts</strong><br />You are responsible for maintaining the confidentiality of your Google account credentials used to sign in.</p>
              <p><strong style={{ color: '#333' }}>4. Data Storage</strong><br />Your study data is stored locally in your browser via IndexedDB and optionally synced to Supabase cloud servers when signed in.</p>
              <p><strong style={{ color: '#333' }}>5. Acceptable Use</strong><br />You agree not to misuse the service for any unlawful purpose or to disrupt the service for other users.</p>
              <p><strong style={{ color: '#333' }}>6. Limitation of Liability</strong><br />JEEIFY is not liable for any direct or indirect damages arising from the use or inability to use the service.</p>
              <p><strong style={{ color: '#333' }}>7. Changes to Terms</strong><br />We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance.</p>
              <p className="pt-3" style={{ color: '#aaa' }}>Last updated: June 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg p-8 bg-white rounded-[18px] relative max-h-[80vh] overflow-y-auto" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2">
              <h2 className="text-[16px] font-bold" style={{ color: '#111' }}>Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="hover:opacity-60 transition-opacity" style={{ cursor: 'pointer' }}>
                <svg className="w-5 h-5" fill="none" stroke="#888" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-[13px] leading-relaxed space-y-3" style={{ color: '#666' }}>
              <p><strong style={{ color: '#333' }}>1. Information We Collect</strong><br />We collect your Google account email and name when you sign in. Study progress data is stored locally and optionally synced to our servers.</p>
              <p><strong style={{ color: '#333' }}>2. How We Use Information</strong><br />Your data is used solely to provide the study tracking service. We do not sell, share, or distribute your personal information.</p>
              <p><strong style={{ color: '#333' }}>3. Data Storage</strong><br />Primary storage is in your browser via IndexedDB. Cloud sync via Supabase is optional and only occurs when you sign in.</p>
              <p><strong style={{ color: '#333' }}>4. Third-Party Services</strong><br />We use Google OAuth for authentication and Supabase for optional cloud sync. Both services have their own privacy policies.</p>
              <p><strong style={{ color: '#333' }}>5. Your Rights</strong><br />You can export, clear, or delete all your data at any time from the Settings page. You can also sign out to stop cloud sync.</p>
              <p><strong style={{ color: '#333' }}>6. Contact</strong><br />For privacy concerns, reach out via the Contact page.</p>
              <p className="pt-3" style={{ color: '#aaa' }}>Last updated: June 2026</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
