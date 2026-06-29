'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

const FEATURES = [
  { icon: '📚', title: 'Syllabus Tracker', desc: 'Track every chapter and topic across Physics, Chemistry, and Maths with real-time progress.' },
  { icon: '🗺️', title: 'Smart Roadmap', desc: 'Personalized study roadmap that adapts to your pace and exam timeline.' },
  { icon: '📅', title: 'Hourly Timetable', desc: 'Drag-and-drop weekly planner with subject slots, breaks, and revision blocks.' },
  { icon: '📊', title: 'Progress Analytics', desc: 'Visual breakdown of completion rates, pace status, and subject-wise performance.' },
  { icon: '🍅', title: 'Pomodoro Timer', desc: 'Built-in focus timer with session tracking to optimize your study streaks.' },
  { icon: '📝', title: 'Test Analyzer', desc: 'Log mock test scores, track improvement, and identify weak areas.' },
]

const TESTIMONIALS = [
  { quote: 'The daily plan modal + pace tracking combo is a game changer. I know exactly what to study every day.', author: 'Arjun S.', role: 'JEE 2026 Aspirant' },
  { quote: 'Finally a tool that understands the JEE syllabus. The chapter-level tracking is incredibly detailed.', author: 'Priya M.', role: 'JEE 2027 Aspirant' },
  { quote: 'The Pomodoro timer + activity journal helped me stay consistent for 6+ hours daily.', author: 'Rahul K.', role: 'JEE 2026 Aspirant' },
]

const STEPS = [
  { step: '1', title: 'Sign in', desc: 'Connect your Google account — that\'s it.' },
  { step: '2', title: 'Explore', desc: 'Browse the syllabus, set your timetable, and plan your day.' },
  { step: '3', title: 'Track', desc: 'Mark progress, log tests, and watch your scores grow.' },
]

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState(false)

  const emailValid = isValidEmail(authEmail)
  const emailWarning = emailTouched && authEmail.length > 0 && !emailValid
  const canSubmit = emailValid && authPassword.length >= 6

  useEffect(() => {
    const sb = getSupabase()
    if (sb) {
      sb.auth.getUser().then(({ data }) => { if (data.user) router.replace('/dashboard') })
      sb.auth.onAuthStateChange((_e, session) => { if (session?.user) router.replace('/dashboard') })
    }
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [router])

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) return
    const { data } = await sb.auth.getUser()
    if (data.user) { router.push('/dashboard'); return }
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    setShowAuth(false)
  }

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedEmail(true)
    setAuthError('This feature is in works. Please login with Google.')
  }

  const resetAuth = () => {
    setShowAuth(false)
    setAuthEmail('')
    setAuthPassword('')
    setAuthError('')
    setEmailTouched(false)
    setSubmittedEmail(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#2383e2] flex items-center justify-center text-sm font-bold tracking-tight">J</div>
              <span className="font-semibold text-sm tracking-tight">JEE<span className="text-white/40 mx-1">/</span>CC</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#features" className="text-white/50 hover:text-white transition-colors tracking-wide uppercase text-[11px] font-semibold">Features</a>
              <a href="#process" className="text-white/50 hover:text-white transition-colors tracking-wide uppercase text-[11px] font-semibold">Process</a>
              <a href="#testimonials" className="text-white/50 hover:text-white transition-colors tracking-wide uppercase text-[11px] font-semibold">Stories</a>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleGoogleSignIn} className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors px-4 py-2 tracking-tight">
                Log in
              </button>
              <button onClick={() => setShowAuth(true)} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all tracking-tight">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showAuth && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 p-8 bg-[#0A0A0F] border border-white/[0.08] relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#E03E3E] via-[#2383e2] to-[#F5A623]" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold tracking-tight">Access Platform</h2>
              <button onClick={resetAuth} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2.5 px-4 py-3 border border-white/[0.12] hover:bg-white/[0.05] transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              <span className="text-sm font-medium">Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
              <div className="relative flex justify-center"><span className="bg-[#0A0A0F] px-3 text-[11px] text-white/30 uppercase tracking-wider font-semibold">Or</span></div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <input
                  type="email" placeholder="Email address" value={authEmail}
                  onChange={e => { setAuthEmail(e.target.value); setAuthError(''); setSubmittedEmail(false); if (!emailTouched) setEmailTouched(true) }}
                  className={`w-full px-4 py-3 bg-white/[0.04] border text-sm text-white placeholder:text-white/25 outline-none transition-colors tracking-tight ${
                    emailWarning ? 'border-[#E03E3E]' : canSubmit || authEmail.length === 0 ? 'border-white/[0.08]' : 'border-white/[0.08]'
                  } focus:border-[#2383e2]`}
                />
                {emailWarning && <p className="text-[#E03E3E] text-[11px] mt-1.5 font-medium tracking-tight">Please enter a valid email address</p>}
              </div>
              <div>
                <input
                  type="password" placeholder="Password" value={authPassword}
                  onChange={e => { setAuthPassword(e.target.value); setAuthError(''); setSubmittedEmail(false) }}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#2383e2] tracking-tight"
                />
              </div>
              {authError && submittedEmail && <p className="text-[#F5A623] text-[11px] text-center font-medium tracking-tight">{authError}</p>}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full px-4 py-3 text-sm font-semibold tracking-tight transition-all ${
                  canSubmit
                    ? 'bg-[#2383e2] text-white hover:bg-[#2383e2]/90 shadow-lg shadow-[#2383e2]/30'
                    : 'bg-white/[0.06] text-white/30'
                }`}
              >
                Sign up with email
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full border border-[#2383e2]/10" />
          <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full border border-[#E03E3E]/10" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full border border-[#F5A623]/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#2383e2]/3 via-transparent to-[#E03E3E]/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/[0.08] text-[10px] text-white/50 uppercase tracking-[0.2em] font-semibold mb-8">
            JEE 2027 — Command Center
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight mb-6">
                Master<br />
                <span className="text-[#2383e2]">JEE 2027</span>
                <br />
                <span className="text-white/40 text-4xl md:text-5xl">with purpose.</span>
              </h1>
              <p className="text-base md:text-lg text-white/40 leading-relaxed max-w-md mb-8 tracking-tight">
                Track syllabus progress, optimize your timetable, analyze tests — a command center built for the systematic mind.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAuth(true)} className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all tracking-tight">
                  Start Free
                </button>
                <a href="#features" className="inline-flex items-center gap-2 text-sm font-medium px-7 py-3.5 border border-white/[0.12] text-white/70 hover:text-white hover:border-white/[0.2] transition-all tracking-tight">
                  Explore
                </a>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="aspect-square max-w-sm ml-auto relative">
                <div className="absolute inset-0 border border-white/[0.06]" />
                <div className="absolute inset-4 border border-[#2383e2]/20" />
                <div className="absolute inset-8 border border-[#F5A623]/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-7xl font-bold text-[#2383e2] tracking-tight">92<span className="text-3xl text-white/20">%</span></div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.15em] mt-2 font-semibold">Syllabus Coverage</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-[#E03E3E]/20 flex items-center justify-center">
                <div className="text-2xl font-bold text-[#E03E3E]">30</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-8 mb-16">
            <div className="md:col-span-5">
              <div className="text-[10px] text-[#2383e2] uppercase tracking-[0.2em] font-semibold mb-4">Capabilities</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                Everything you need.
                <br />
                <span className="text-white/40">Nothing you don&apos;t.</span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-sm text-white/40 leading-relaxed tracking-tight">
                Six tools, one command center. From syllabus tracking to test analysis, 
                each feature was designed with a single question: <span className="text-white/70">&ldquo;Does this help you study better?&rdquo;</span>
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06]">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-[#0A0A0F] p-8 group hover:bg-white/[0.02] transition-colors">
                <div className="text-2xl mb-5">{f.icon}</div>
                <h3 className="text-sm font-bold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="py-24 md:py-32 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[10px] text-[#F5A623] uppercase tracking-[0.2em] font-semibold mb-4">Process</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three steps to<span className="text-[#2383e2]"> clarity.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 border border-white/[0.1] flex items-center justify-center">
                    <span className={`text-sm font-bold ${i === 0 ? 'text-[#E03E3E]' : i === 1 ? 'text-[#2383e2]' : 'text-[#F5A623]'}`}>{s.step}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-white/[0.06] hidden md:block" />}
                </div>
                <h3 className="text-sm font-bold mb-2 tracking-tight">{s.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 md:py-32 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[10px] text-[#E03E3E] uppercase tracking-[0.2em] font-semibold mb-4">Stories</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built by a<span className="text-[#2383e2]"> JEE aspirant.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06]">
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="bg-[#0A0A0F] p-8">
                <div className="text-[#2383e2] text-2xl font-serif mb-4 leading-none">&ldquo;</div>
                <p className="text-sm text-white/70 mb-6 leading-relaxed tracking-tight">{t.quote}</p>
                <div className="border-t border-white/[0.06] pt-4">
                  <div className="text-xs font-bold tracking-tight">{t.author}</div>
                  <div className="text-[10px] text-white/30 tracking-tight">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2383e2]/3 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="text-[10px] text-[#2383e2] uppercase tracking-[0.2em] font-semibold mb-4">Ready</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ace JEE 2027.<br />
            <span className="text-white/40">Start today.</span>
          </h2>
          <p className="text-sm text-white/40 mb-8 max-w-md mx-auto tracking-tight">
            Free. No credit card. Just your Google account and the determination to succeed.
          </p>
          <button onClick={() => setShowAuth(true)} className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-4 bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all shadow-lg shadow-[#2383e2]/20 tracking-tight">
            Get Started Free
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-white/40 tracking-tight">
              <div className="w-6 h-6 bg-[#2383e2] flex items-center justify-center text-[10px] font-bold">J</div>
              JEE Command Center
            </div>
            <div className="flex items-center gap-6 text-[11px] font-medium tracking-tight">
              <a href="#features" className="text-white/40 hover:text-white transition-colors uppercase">Features</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors uppercase">Terms</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors uppercase">Privacy</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors uppercase">Contact</a>
            </div>
          </div>
          <div className="text-center text-xs text-white/25 tracking-tight">
            Made with <span className="text-[#E03E3E]">&#9829;</span> by Ashish
          </div>
        </div>
      </footer>
    </div>
  )
}
