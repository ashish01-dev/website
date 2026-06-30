'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import LandingNav from '@/components/layout/LandingNav'
import { useUser } from '@/lib/useUser'

const FEATURES = [
  { icon: 'menu_book', label: 'Syllabus Tracker', desc: 'Track every chapter and topic across Physics, Chemistry, and Maths with real-time progress.' },
  { icon: 'map', label: 'Smart Roadmap', desc: 'Personalized study roadmap that adapts to your pace and exam timeline.' },
  { icon: 'calendar_month', label: 'Hourly Timetable', desc: 'Drag-and-drop weekly planner with subject slots, breaks, and revision blocks.' },
  { icon: 'trending_up', label: 'Progress Analytics', desc: 'Visual breakdown of completion rates, pace status, and subject-wise performance.' },
  { icon: 'timer', label: 'Pomodoro Timer', desc: 'Built-in focus timer with session tracking to optimize your study streaks.' },
  { icon: 'assignment', label: 'Test Analyzer', desc: 'Log mock test scores, track improvement, and identify weak areas.' },
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

export default function LandingPage() {
  const { user } = useUser()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <LandingNav />

      {/* Hero */}
      <motion.section {...fadeUp} className="flex flex-col items-center justify-center text-center px-5 py-24 md:py-32 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-30 pointer-events-none" style={{ background: 'var(--c-blue)' }} />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ background: 'var(--c-blue)' }} />
        <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-6" style={{ color: 'var(--c-muted)' }}>JEE 2027 — Command Center</p>
        <h1 className="text-[clamp(42px,7vw,72px)] font-medium leading-[1.05] tracking-[-2px] max-w-4xl" style={{ color: 'var(--c-text)' }}>
          Master your JEE prep<br />
          <span className="text-[var(--c-blue)] font-semibold">with purpose.</span>
        </h1>
        <p className="text-[15px] mt-5 max-w-lg" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
          Track syllabus progress, optimize your timetable, analyze tests — a command center built for the systematic mind.
        </p>
        <div className="flex items-center gap-4 mt-8 flex-wrap justify-center">
          <Link href="/auth?mode=signup"
            className="flex items-center gap-2 text-white text-[14px] font-medium rounded-[40px] px-[22px] py-[8px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
            style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Start Free
          </Link>
          <a href="#features"
            className="text-[14px] font-medium rounded-[40px] px-[22px] py-[8px] transition-all duration-200 hover:-translate-y-[1px]"
            style={{ color: 'var(--c-text-secondary)', border: '1px solid var(--c-border-input)' }}>Explore</a>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section {...fadeUp} id="features" className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>Capabilities</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            Everything you need.<span className="text-[#888]"> Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.label} className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[2px]" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)', willChange: 'transform',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--c-shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--c-shadow)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--c-tag)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 24, color: 'var(--c-text)' }}>{f.icon}</span>
              </div>
              <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>{f.label}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section {...fadeUp} className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>How It Works</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            From zero to<span className="text-[#888]"> hero.</span>
          </h2>
          <p className="text-[14px] mt-4 max-w-md mx-auto" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Four simple steps to transform your preparation into a structured, trackable system.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {STEPS.map(s => (
            <div key={s.step} className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[2px]" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)', willChange: 'transform',
            }}>
              <div className="text-[32px] font-bold tracking-[-1px] mb-3" style={{ color: 'var(--c-blue)' }}>{s.step}</div>
              <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>{s.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section {...fadeUp} className="px-5 py-24 md:py-32 max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>FAQ</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>Got questions?<span className="text-[#888]"> We&apos;ve got answers.</span></h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-[18px] transition-all duration-200" style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-card)',
              boxShadow: openFaq === i ? '0 4px 20px rgba(0,0,0,0.06)' : 'var(--c-shadow)',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-[22px] py-[16px] text-left"
              >
                <span className="text-[14px] font-medium pr-4" style={{ color: 'var(--c-text)' }}>{faq.q}</span>
                <span className="text-[#888] text-lg flex-shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              <div className="overflow-hidden transition-all duration-300" style={{
                maxHeight: openFaq === i ? '300px' : '0px',
                opacity: openFaq === i ? 1 : 0,
              }}>
                <div className="px-[22px] pb-[16px] text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section {...fadeUp} className="px-5 py-24 md:py-32 text-center">
        <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--c-muted)' }}>Ready</p>
        <h2 className="text-[clamp(32px,5vw,52px)] font-medium tracking-[-1.5px] mb-4" style={{ color: 'var(--c-text)' }}>
          Ace JEE 2027.<br /><span style={{ color: 'var(--c-muted)' }}>Start today.</span>
        </h2>
        <p className="text-[14px] mb-8 max-w-md mx-auto" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
          Free. No credit card. Just your Google account and the determination to succeed.
        </p>
        <Link href="/auth?mode=signup"
          className="inline-flex items-center gap-2 text-white text-[14px] font-medium rounded-[40px] px-[24px] py-[10px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
          style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Get Started Free
          </Link>
      </motion.section>

      {/* Footer is rendered by layout.tsx */}
    </div>
  )
}
