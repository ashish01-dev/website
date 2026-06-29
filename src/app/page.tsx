'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

const FAQS = [
  { q: 'Is JEEIFY really free?', a: 'Yes! The Free tier includes full syllabus tracking, timetable planner, Pomodoro timer, test score logging, activity journal, and 500 MB of storage — completely free, no credit card required.' },
  { q: 'What happens when I hit the 500 MB storage limit?', a: 'The Free version caps at 500 MB of storage. Upgrade to Pro ($9/month) for 5 GB storage, 1-on-1 live support, advanced analytics, faster support resolution, and priority access to new features.' },
  { q: 'How does the pace tracking algorithm work?', a: 'It analyzes your daily chapter completions, study hours, and test scores against your exam date and syllabus size. It determines whether you\'re ahead, on track, or behind — and adjusts recommendations accordingly.' },
  { q: 'Can I use JEEIFY on my phone?', a: 'Absolutely. The entire app is fully responsive and works seamlessly on mobile, tablet, and desktop. The mobile layout includes a compact bottom nav bar for easy one-handed use.' },
  { q: 'How is my data stored and synced?', a: 'All your progress is stored locally via IndexedDB and synced to your Google account through Supabase. Your data stays safe and accessible across devices.' },
  { q: 'Can I collaborate with study partners?', a: 'The Teams plan includes collaborative dashboards, shared progress tracking, and unlimited storage — perfect for study groups and coaching centers.' },
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
  { value: '50,000+', label: 'Hours Tracked' },
  { value: '10,000+', label: 'Active Students' },
  { value: '98.6%', label: 'Avg. Score Improvement' },
  { value: '250+', label: 'AIR Rankers Mentored' },
]

const NAV_ITEMS = [
  { href: '#features', label: 'Features' },
  { href: '#results', label: 'Results' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#about', label: 'About' },
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

export default function LandingPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
  const [topHovered, setTopHovered] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showFloatingBar, setShowFloatingBar] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowFloatingBar(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sb = getSupabase()
    if (sb) {
      sb.auth.getUser().then((res: { data: { user: Session['user'] | null } }) => { if (res.data.user) router.replace('/dashboard') })
      sb.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => { if (session?.user) router.replace('/dashboard') })
    }
  }, [router])

  const openContact = () => router.push('/contact')

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }

  return (
    <div className="min-h-screen pb-[80px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to top left, #F5F5F5, #F7F7F7)' }}>
      {/* Navbar */}
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-[9px]" style={{ cursor: 'pointer' }}>
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 28, filter: 'brightness(0)' }} />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: '#111' }}>JEEIFY</span>
          </button>

          <div className="hidden md:flex items-center gap-9">
            <a href="#features" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Features</a>
            <a href="#results" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Results</a>
            <a href="#pricing" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Pricing</a>
            <a href="#about" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>About</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth?mode=login" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Sign In</Link>
            <Link
              href="/auth"
              className="flex items-center gap-2 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
              style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
            >
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
              Get Started
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col items-center justify-center w-6 h-6 gap-[5px]" style={{ cursor: 'pointer' }}>
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
      <div className={`fixed inset-0 z-50 bg-white flex flex-col px-10 py-8 transition-transform duration-500 md:hidden`}
        style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(100%)', transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)' }}>
        <div className="flex justify-end mb-16">
          <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center" style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-col">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Results', href: '#results' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'About', href: '#about' },
            { label: 'Sign In', href: '/auth?mode=login', isLink: true },
          ].map(item => {
            if (item.isLink) {
              return (
                <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                  className="text-[38px] font-extrabold tracking-[-1.5px] py-6 border-b border-black/[0.06]" style={{ color: '#111' }}>
                  {item.label}
                </Link>
              )
            }
            return (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                className="text-[38px] font-extrabold tracking-[-1.5px] py-6 border-b border-black/[0.06]" style={{ color: '#111' }}>
                {item.label}
              </a>
            )
          })}
        </div>
        <div className="mt-auto">
          <Link href="/auth" onClick={() => setMenuOpen(false)}
            className="inline-flex items-center gap-3 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px]"
            style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Get Started
          </Link>
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
          <Link href="/auth"
            className="flex items-center gap-2 text-white text-[14px] font-medium rounded-[40px] px-[22px] py-[8px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
            style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Start Free
          </Link>
          <a href="#features"
            className="text-[14px] font-medium rounded-[40px] px-[22px] py-[8px] transition-all duration-200 hover:-translate-y-[1px]"
            style={{ color: '#555', border: '1px solid rgba(0,0,0,0.1)' }}>Explore</a>
        </div>
      </motion.section>

      {/* Stats Strip */}
      <motion.div {...fadeUp} className="max-w-[900px] mx-auto px-5 pb-12">
        <div className="rounded-[18px] px-[28px] py-[32px] grid grid-cols-2 md:grid-cols-4 gap-8" style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          {STATS.map(s => (<CountUp key={s.label} value={s.value} label={s.label} />))}
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
          {FEATURES.map(f => (
            <div key={f.label} className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[3px]" style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)' }}>
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
      <motion.section {...fadeUp} className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
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
          {STEPS.map(s => (
            <div key={s.step} className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[3px]" style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
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
            <div key={t.name} onMouseEnter={() => setTopHovered(i)} onMouseLeave={() => setTopHovered(null)}
              className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200" style={{
                background: '#fff', border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: topHovered === i ? '0 8px 28px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
                transform: topHovered === i ? 'translateY(-3px)' : 'translateY(0)',
              }}>
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
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>Choose your plan</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <div key={plan.name} onMouseEnter={() => setHoveredPlan(i)} onMouseLeave={() => setHoveredPlan(null)}
              className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200" style={{
                background: '#fff',
                border: plan.popular ? '1px solid #2383e2' : '1px solid rgba(0,0,0,0.05)',
                boxShadow: hoveredPlan === i ? '0 8px 28px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
                transform: hoveredPlan === i ? 'translateY(-3px)' : 'translateY(0)',
              }}>
              {plan.popular && <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2383e2] mb-3">Most Popular</div>}
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
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#555' }}>
                  Contact Us
                </button>
              ) : (
                <Link href="/auth"
                  className="block w-full py-3 text-[13px] font-medium rounded-[40px] text-white text-center transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
                  style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section {...fadeUp} id="about" className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: '#888' }}>Stories</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>What our users say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { quote: 'The daily plan modal + pace tracking combo is a game changer. I know exactly what to study every day.', author: 'Arjun S.', role: 'JEE 2026 Aspirant' },
            { quote: 'Finally a tool that understands the JEE syllabus. The chapter-level tracking is incredibly detailed.', author: 'Priya M.', role: 'JEE 2027 Aspirant' },
            { quote: 'The Pomodoro timer + activity journal helped me stay consistent for 6+ hours daily.', author: 'Rahul K.', role: 'JEE 2026 Aspirant' },
          ].map(t => (
            <div key={t.author} className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[3px]" style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)' }}>
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

      {/* FAQ */}
      <motion.section {...fadeUp} className="px-5 py-24 md:py-32 max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: '#888' }}>FAQ</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: '#0f0f0f' }}>Got questions?<span className="text-[#888]"> We&apos;ve got answers.</span></h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-[18px] transition-all duration-200" style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: openFaq === i ? '0 4px 20px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-[22px] py-[16px] text-left"
              >
                <span className="text-[14px] font-medium pr-4" style={{ color: '#0f0f0f' }}>{faq.q}</span>
                <span className="text-[#888] text-lg flex-shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              <div className="overflow-hidden transition-all duration-300" style={{
                maxHeight: openFaq === i ? '300px' : '0px',
                opacity: openFaq === i ? 1 : 0,
              }}>
                <div className="px-[22px] pb-[16px] text-[13px] leading-relaxed" style={{ color: '#888' }}>
                  {faq.a}
                </div>
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
        <Link href="/auth"
          className="inline-flex items-center gap-2 text-white text-[14px] font-medium rounded-[40px] px-[24px] py-[10px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
          style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
          Get Started Free
        </Link>
      </motion.section>

      {/* Floating Nav Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500" style={{
        transform: showFloatingBar ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
        opacity: showFloatingBar ? 1 : 0,
        pointerEvents: showFloatingBar ? 'auto' : 'none',
      }}>
        <div className="flex items-center gap-1 px-3 py-2 rounded-[18px]" style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          {NAV_ITEMS.map(item => (
            <a key={item.label} href={item.href}
              className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 hover:bg-black/[0.04]"
              style={{ color: '#555' }}>
              {item.label}
            </a>
          ))}
          <div className="w-px h-5 mx-1" style={{ background: 'rgba(0,0,0,0.08)' }} />
          <Link href="/auth"
            className="px-4 py-1.5 rounded-xl text-[12px] font-medium text-white transition-all duration-200"
            style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)' }}>
            Get Started
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-16 md:py-20 px-5 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#0f0f0f' }}>Product</h3>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Features</a></li>
              <li><a href="#pricing" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Pricing</a></li>
              <li><a href="#about" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Testimonials</a></li>
              <li><Link href="/auth" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#0f0f0f' }}>Explore</h3>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Dashboard</Link></li>
              <li><Link href="/syllabus" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Syllabus</Link></li>
              <li><Link href="/roadmap" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Roadmap</Link></li>
              <li><Link href="/timetable" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Timetable</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#0f0f0f' }}>Company</h3>
            <ul className="space-y-2.5">
              <li><a href="#about" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>About</a></li>
              <li><Link href="/contact" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Contact</Link></li>
              <li><Link href="/auth?mode=login" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#0f0f0f' }}>Legal</h3>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[13px] transition-colors hover:text-[#2383e2]" style={{ color: '#888' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-black/[0.06]">
          <div className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 22, filter: 'brightness(0)' }} />
            <span className="text-[18px] font-bold tracking-[-0.3px]" style={{ color: '#111' }}>JEEIFY</span>
          </div>
          <div className="text-[12px]" style={{ color: '#aaa' }}>
            Made with <span style={{ color: '#E03E3E' }}>&#9829;</span> by Ashish
          </div>
          <div className="text-[12px]" style={{ color: '#aaa' }}>
            &copy; 2026 JEEIFY. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
