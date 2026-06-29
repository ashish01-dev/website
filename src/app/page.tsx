'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

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

const STATS_DATA = [
  { value: '500+', label: 'Active Users' },
  { value: '10K+', label: 'Topics Tracked' },
  { value: '50K+', label: 'Study Hours Logged' },
  { value: '100%', label: 'Free & Open Source' },
]

const PASSWORD_RULES = [
  { label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'At least 1 number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'At least 6 characters', test: (v: string) => v.length >= 6 },
]

function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }

function useScrollIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState(false)
  const [showTc, setShowTc] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const emailValid = isValidEmail(authEmail)
  const emailWarning = emailTouched && authEmail.length > 0 && !emailValid
  const canSubmit = emailValid && PASSWORD_RULES.every(r => r.test(authPassword))

  const { ref: hRef, visible: hVis } = useScrollIn()
  const { ref: fRef, visible: fVis } = useScrollIn()
  const { ref: pRef, visible: pVis } = useScrollIn()
  const { ref: sRef, visible: sVis } = useScrollIn()
  const { ref: tRef, visible: tVis } = useScrollIn()
  const { ref: statRef, visible: statVis } = useScrollIn()

  useEffect(() => {
    const sb = getSupabase()
    if (sb) {
      sb.auth.getUser().then((res: { data: { user: Session['user'] | null } }) => { if (res.data.user) router.replace('/dashboard') })
      sb.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => { if (session?.user) router.replace('/dashboard') })
    }
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden">

      {/* ─── Scroll animation styles ─── */}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(35,131,226,0.2); } 50% { box-shadow: 0 0 40px rgba(35,131,226,0.4); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .anim-fade-up { opacity: 0; }
        .anim-fade-up.visible { animation: fadeUp 0.7s ease-out forwards; }
        .anim-fade-in { opacity: 0; }
        .anim-fade-in.visible { animation: fadeIn 0.8s ease-out forwards; }
        .anim-float { animation: float 4s ease-in-out infinite; }
        .anim-glow { animation: pulseGlow 2s ease-in-out infinite; }
      `}</style>

      {/* ─── Nav ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#2383e2] flex items-center justify-center text-sm font-bold tracking-tight">J</div>
              <span className="font-semibold text-sm tracking-tight hidden sm:inline">JEE<span className="text-white/40 mx-1">/</span>CC</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#features" className="text-white/50 hover:text-white transition-colors tracking-wide uppercase text-[11px] font-semibold">Features</a>
              <a href="#pricing" className="text-white/50 hover:text-white transition-colors tracking-wide uppercase text-[11px] font-semibold">Pricing</a>
              <a href="#process" className="text-white/50 hover:text-white transition-colors tracking-wide uppercase text-[11px] font-semibold">Process</a>
              <a href="#testimonials" className="text-white/50 hover:text-white transition-colors tracking-wide uppercase text-[11px] font-semibold">Stories</a>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => openAuth('login')} className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors px-4 py-2 tracking-tight">Log in</button>
              <button onClick={() => openAuth('signup')} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all tracking-tight">Get Started</button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-white/60 p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
              </button>
            </div>
          </div>
          {mobileMenu && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm text-white/60 hover:text-white py-2 uppercase text-[11px] font-semibold tracking-wide">Features</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)} className="block text-sm text-white/60 hover:text-white py-2 uppercase text-[11px] font-semibold tracking-wide">Pricing</a>
              <a href="#process" onClick={() => setMobileMenu(false)} className="block text-sm text-white/60 hover:text-white py-2 uppercase text-[11px] font-semibold tracking-wide">Process</a>
              <a href="#testimonials" onClick={() => setMobileMenu(false)} className="block text-sm text-white/60 hover:text-white py-2 uppercase text-[11px] font-semibold tracking-wide">Stories</a>
              <button onClick={() => { setMobileMenu(false); openAuth('login') }} className="block text-sm text-white/60 hover:text-white py-2">Log in</button>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Auth Modal ─── */}
      {showAuth && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm p-8 bg-[#0A0A0F] border border-white/[0.08] relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#E03E3E] via-[#2383e2] to-[#F5A623]" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold tracking-tight">{authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
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
                <input type="email" placeholder="Email address" value={authEmail}
                  onChange={e => { setAuthEmail(e.target.value); setAuthError(''); setSubmittedEmail(false); if (!emailTouched) setEmailTouched(true) }}
                  className={`w-full px-4 py-3 bg-white/[0.04] border text-sm text-white placeholder:text-white/25 outline-none transition-colors tracking-tight ${emailWarning ? 'border-[#E03E3E]' : 'border-white/[0.08]'} focus:border-[#2383e2]`} />
                {emailWarning && <p className="text-[#E03E3E] text-[11px] mt-1.5 font-medium tracking-tight">Please enter a valid email address</p>}
              </div>
              <div>
                <input type="password" placeholder="Password" value={authPassword}
                  onChange={e => { setAuthPassword(e.target.value); setAuthError(''); setSubmittedEmail(false) }}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#2383e2] tracking-tight" />
                {authMode === 'signup' && authPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {PASSWORD_RULES.map(r => {
                      const pass = r.test(authPassword)
                      return <div key={r.label} className={`text-[10px] flex items-center gap-1.5 tracking-tight ${pass ? 'text-[#0f8a5e]' : 'text-white/30'}`}>
                        <span>{pass ? '✓' : '○'}</span> {r.label}
                      </div>
                    })}
                  </div>
                )}
              </div>
              {authError && submittedEmail && <p className="text-[#F5A623] text-[11px] text-center font-medium tracking-tight">{authError}</p>}
              <button type="submit" disabled={!canSubmit}
                className={`w-full px-4 py-3 text-sm font-semibold tracking-tight transition-all ${canSubmit ? 'bg-[#2383e2] text-white shadow-lg shadow-[#2383e2]/30 anim-glow' : 'bg-white/[0.06] text-white/30'}`}>
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <p className="text-[11px] text-white/30 text-center mt-4 tracking-tight">
              {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setAuthEmail(''); setAuthPassword(''); setAuthError(''); setEmailTouched(false); setSubmittedEmail(false) }} className="text-[#2383e2] hover:underline font-medium">Switch</button>
            </p>
          </div>
        </div>
      )}

      {/* ─── T&C Modal ─── */}
      {showTc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg p-8 bg-[#0A0A0F] border border-white/[0.08] relative max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0A0A0F] pb-2">
              <h2 className="text-base font-bold tracking-tight">Terms &amp; Conditions</h2>
              <button onClick={() => setShowTc(false)} className="text-white/40 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="text-xs text-white/50 leading-relaxed space-y-3 tracking-tight">
              <p><strong className="text-white/70">1. Acceptance of Terms</strong><br />By accessing JEE Command Center, you agree to these terms. If you do not agree, do not use the service.</p>
              <p><strong className="text-white/70">2. Description of Service</strong><br />JEE Command Center provides a personal study tracking dashboard for JEE aspirants. The service is provided &ldquo;as is&rdquo; without warranty.</p>
              <p><strong className="text-white/70">3. User Accounts</strong><br />You are responsible for maintaining the confidentiality of your Google account credentials used to sign in.</p>
              <p><strong className="text-white/70">4. Data Storage</strong><br />Your study data is stored locally in your browser via IndexedDB and optionally synced to Supabase cloud servers when signed in.</p>
              <p><strong className="text-white/70">5. Acceptable Use</strong><br />You agree not to misuse the service for any unlawful purpose or to disrupt the service for other users.</p>
              <p><strong className="text-white/70">6. Limitation of Liability</strong><br />JEE Command Center is not liable for any direct or indirect damages arising from the use or inability to use the service.</p>
              <p><strong className="text-white/70">7. Changes to Terms</strong><br />We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance.</p>
              <p className="text-white/30 pt-3">Last updated: June 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Privacy Modal ─── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg p-8 bg-[#0A0A0F] border border-white/[0.08] relative max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0A0A0F] pb-2">
              <h2 className="text-base font-bold tracking-tight">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="text-white/40 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="text-xs text-white/50 leading-relaxed space-y-3 tracking-tight">
              <p><strong className="text-white/70">1. Information We Collect</strong><br />We collect your Google account email and name when you sign in. Study progress data is stored locally and optionally synced to our servers.</p>
              <p><strong className="text-white/70">2. How We Use Information</strong><br />Your data is used solely to provide the study tracking service. We do not sell, share, or distribute your personal information.</p>
              <p><strong className="text-white/70">3. Data Storage</strong><br />Primary storage is in your browser via IndexedDB. Cloud sync via Supabase is optional and only occurs when you sign in.</p>
              <p><strong className="text-white/70">4. Third-Party Services</strong><br />We use Google OAuth for authentication and Supabase for optional cloud sync. Both services have their own privacy policies.</p>
              <p><strong className="text-white/70">5. Your Rights</strong><br />You can export, clear, or delete all your data at any time from the Settings page. You can also sign out to stop cloud sync.</p>
              <p><strong className="text-white/70">6. Contact</strong><br />For privacy concerns, reach out via the Contact page.</p>
              <p className="text-white/30 pt-3">Last updated: June 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero ─── */}
      <section ref={hRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full border border-[#2383e2]/10 anim-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full border border-[#E03E3E]/10 anim-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full border border-[#F5A623]/10 anim-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#2383e2]/3 via-transparent to-[#E03E3E]/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>
        <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 w-full ${hVis ? 'visible' : ''}`}>
          <div className={`anim-fade-up ${hVis ? 'visible' : ''}`} style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/[0.08] text-[10px] text-white/50 uppercase tracking-[0.2em] font-semibold mb-8">JEE 2027 — Command Center</div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`anim-fade-up ${hVis ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
              <h1 className="text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight mb-6">
                Master<br /><span className="text-[#2383e2]">JEE 2027</span><br /><span className="text-white/40 text-4xl md:text-5xl">with purpose.</span>
              </h1>
              <p className="text-base md:text-lg text-white/40 leading-relaxed max-w-md mb-8 tracking-tight">
                Track syllabus progress, optimize your timetable, analyze tests — a command center built for the systematic mind.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => openAuth('signup')} className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all tracking-tight anim-glow">Start Free</button>
                <a href="#features" className="inline-flex items-center gap-2 text-sm font-medium px-7 py-3.5 border border-white/[0.12] text-white/70 hover:text-white hover:border-white/[0.2] transition-all tracking-tight">Explore</a>
              </div>
            </div>
            <div className={`hidden md:block anim-fade-up ${hVis ? 'visible' : ''}`} style={{ animationDelay: '0.4s' }}>
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

      {/* ─── Stats Banner ─── */}
      <section ref={statRef} className="py-12 border-t border-white/[0.06]">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${statVis ? 'visible' : ''}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS_DATA.map((s, i) => (
              <div key={s.label} className={`text-center anim-fade-up ${statVis ? 'visible' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">{s.value}</div>
                <div className="text-[11px] text-white/30 uppercase tracking-[0.1em] mt-1 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" ref={fRef} className="py-24 md:py-32">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${fVis ? 'visible' : ''}`}>
          <div className="grid md:grid-cols-12 gap-8 mb-16">
            <div className="md:col-span-5 anim-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-[10px] text-[#2383e2] uppercase tracking-[0.2em] font-semibold mb-4">Capabilities</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">Everything you need.<br /><span className="text-white/40">Nothing you don&apos;t.</span></h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 anim-fade-up flex items-end" style={{ animationDelay: '0.2s' }}>
              <p className="text-sm text-white/40 leading-relaxed tracking-tight">
                Six tools, one command center. From syllabus tracking to test analysis, each feature was designed with a single question: <span className="text-white/70">&ldquo;Does this help you study better?&rdquo;</span>
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06]">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`bg-[#0A0A0F] p-8 group hover:bg-white/[0.02] transition-colors anim-fade-up ${fVis ? 'visible' : ''}`} style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                <div className="text-2xl mb-5">{f.icon}</div>
                <h3 className="text-sm font-bold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" ref={pRef} className="py-24 md:py-32 border-t border-white/[0.06]">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${pVis ? 'visible' : ''}`}>
          <div className="text-center mb-16 anim-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-[10px] text-[#F5A623] uppercase tracking-[0.2em] font-semibold mb-4">Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose your<span className="text-[#2383e2]"> plan.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <div key={plan.name} className={`relative p-8 border transition-all anim-fade-up ${pVis ? 'visible' : ''} ${plan.popular ? 'border-[#2383e2] bg-[#2383e2]/[0.03]' : 'border-white/[0.06] hover:border-white/[0.12]'} ${plan.popular ? 'scale-[1.02]' : ''}`}
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2383e2] text-[10px] font-semibold uppercase tracking-wider">Most Popular</div>}
                <div className="text-lg font-bold tracking-tight mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price === '—' ? '—' : `$${plan.price}`}</span>
                  {plan.price !== '—' && <span className="text-xs text-white/30">/month</span>}
                </div>
                <p className="text-xs text-white/40 mb-6 tracking-tight">{plan.desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs text-white/50 flex items-center gap-2 tracking-tight">
                      <span className="text-[#2383e2]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {plan.name === 'Teams' ? (
                  <button onClick={openContact} className="w-full py-3 text-sm font-semibold tracking-tight border border-white/[0.12] text-white/70 hover:text-white hover:border-white/[0.2] transition-all">Contact Us</button>
                ) : (
                  <button onClick={() => openAuth('signup')} className={`w-full py-3 text-sm font-semibold tracking-tight transition-all ${plan.popular ? 'bg-[#2383e2] hover:bg-[#2383e2]/90 text-white' : 'border border-white/[0.12] text-white/70 hover:text-white hover:border-white/[0.2]'}`}>
                    {plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section id="process" ref={sRef} className="py-24 md:py-32 border-t border-white/[0.06]">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${sVis ? 'visible' : ''}`}>
          <div className="text-center mb-16 anim-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-[10px] text-[#2383e2] uppercase tracking-[0.2em] font-semibold mb-4">Process</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Three steps to<span className="text-[#2383e2]"> clarity.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className={`anim-fade-up ${sVis ? 'visible' : ''}`} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
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

      {/* ─── Testimonials ─── */}
      <section id="testimonials" ref={tRef} className="py-24 md:py-32 border-t border-white/[0.06]">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${tVis ? 'visible' : ''}`}>
          <div className="text-center mb-16 anim-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-[10px] text-[#E03E3E] uppercase tracking-[0.2em] font-semibold mb-4">Stories</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built by a<span className="text-[#2383e2]"> JEE aspirant.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06]">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.author} className={`bg-[#0A0A0F] p-8 anim-fade-up ${tVis ? 'visible' : ''}`} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
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

      {/* ─── CTA ─── */}
      <section className="py-24 md:py-32 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2383e2]/3 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="text-[10px] text-[#2383e2] uppercase tracking-[0.2em] font-semibold mb-4 anim-fade-in visible">Ready</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 anim-fade-up visible" style={{ animationDelay: '0.1s' }}>
            Ace JEE 2027.<br /><span className="text-white/40">Start today.</span>
          </h2>
          <p className="text-sm text-white/40 mb-8 max-w-md mx-auto tracking-tight anim-fade-up visible" style={{ animationDelay: '0.2s' }}>
            Free. No credit card. Just your Google account and the determination to succeed.
          </p>
          <button onClick={() => openAuth('signup')} className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-4 bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all shadow-lg shadow-[#2383e2]/20 tracking-tight anim-glow anim-fade-up visible" style={{ animationDelay: '0.3s' }}>
            Get Started Free
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.06] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-white/40 tracking-tight">
              <div className="w-6 h-6 bg-[#2383e2] flex items-center justify-center text-[10px] font-bold">J</div>
              JEE Command Center
            </div>
            <div className="flex items-center gap-6 text-[11px] font-medium tracking-tight flex-wrap justify-center">
              <a href="#features" className="text-white/40 hover:text-white transition-colors uppercase">Features</a>
              <button onClick={() => setShowTc(true)} className="text-white/40 hover:text-white transition-colors uppercase">Terms</button>
              <button onClick={() => setShowPrivacy(true)} className="text-white/40 hover:text-white transition-colors uppercase">Privacy</button>
              <button onClick={openContact} className="text-white/40 hover:text-white transition-colors uppercase">Contact</button>
              <a href="#pricing" className="text-white/40 hover:text-white transition-colors uppercase">Pricing</a>
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
