'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import FeaturedVideoSection from '@/components/landing/FeaturedVideoSection'
import PhilosophySection from '@/components/landing/PhilosophySection'
import ServicesSection from '@/components/landing/ServicesSection'
import { getSupabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

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

const TESTIMONIALS = [
  { quote: 'The daily plan modal + pace tracking combo is a game changer. I know exactly what to study every day.', author: 'Arjun S.', role: 'JEE 2026 Aspirant' },
  { quote: 'Finally a tool that understands the JEE syllabus. The chapter-level tracking is incredibly detailed.', author: 'Priya M.', role: 'JEE 2027 Aspirant' },
  { quote: 'The Pomodoro timer + activity journal helped me stay consistent for 6+ hours daily.', author: 'Rahul K.', role: 'JEE 2026 Aspirant' },
]

const PASSWORD_RULES = [
  { label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'At least 1 number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'At least 6 characters', test: (v: string) => v.length >= 6 },
]

function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }

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

  return (
    <div className="bg-black text-white font-sans overflow-x-hidden">
      <HeroSection onOpenAuth={openAuth} />
      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />

      {/* ─── Pricing ─── */}
      <section id="pricing" className="bg-black py-28 md:py-40 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Pricing</p>
            <h2 className="text-4xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Choose your plan
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`liquid-glass rounded-3xl p-8 ${plan.popular ? 'scale-[1.02]' : ''}`}
              >
                {plan.popular && (
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#2383e2] mb-3">Most Popular</div>
                )}
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
                  <button onClick={openContact} className="liquid-glass rounded-full w-full py-3 text-sm font-medium text-white/70 hover:text-white transition-colors">Contact Us</button>
                ) : (
                  <button onClick={() => openAuth('signup')} className="w-full py-3 text-sm font-medium rounded-full bg-white text-black hover:bg-white/90 transition-colors">
                    {plan.cta}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-black py-28 md:py-40 px-6 overflow-hidden border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Stories</p>
            <h2 className="text-4xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              What our users say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="liquid-glass rounded-2xl p-8"
              >
                <div className="text-[#2383e2] text-2xl font-serif mb-4 leading-none">&ldquo;</div>
                <p className="text-sm text-white/70 mb-6 leading-relaxed tracking-tight">{t.quote}</p>
                <div className="border-t border-white/[0.06] pt-4">
                  <div className="text-xs font-bold tracking-tight text-white">{t.author}</div>
                  <div className="text-[10px] text-white/30 tracking-tight">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-black py-28 md:py-40 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Ready</p>
          <h2 className="text-4xl md:text-6xl text-white tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Ace JEE 2027.<br /><span className="text-white/40">Start today.</span>
          </h2>
          <p className="text-sm text-white/50 mb-8 max-w-md mx-auto tracking-tight">
            Free. No credit card. Just your Google account and the determination to succeed.
          </p>
          <button onClick={() => openAuth('signup')} className="bg-white text-black rounded-full px-8 py-4 text-sm font-medium hover:bg-white/90 transition-colors">
            Get Started Free
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.04] py-12 md:py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-white/40 tracking-tight">
              <div className="liquid-glass rounded-md p-1.5 flex items-center justify-center">
                <span className="text-white text-xs font-bold">J</span>
              </div>
              JEEIFY
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

      {/* ─── Auth Modal ─── */}
      {showAuth && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm p-8 bg-[#0A0A0F] border border-white/[0.08] relative rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#E03E3E] via-[#2383e2] to-[#F5A623]" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold tracking-tight text-white">{authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
              <button onClick={resetAuth} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2.5 px-4 py-3 border border-white/[0.12] hover:bg-white/[0.05] transition-colors rounded-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              <span className="text-sm font-medium text-white">Continue with Google</span>
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
              <div className="relative flex justify-center"><span className="bg-[#0A0A0F] px-3 text-[11px] text-white/30 uppercase tracking-wider font-semibold">Or</span></div>
            </div>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <input type="email" placeholder="Email address" value={authEmail}
                  onChange={e => { setAuthEmail(e.target.value); setAuthError(''); setSubmittedEmail(false); if (!emailTouched) setEmailTouched(true) }}
                  className={`w-full px-4 py-3 bg-white/[0.04] border text-sm text-white placeholder:text-white/25 outline-none transition-colors tracking-tight rounded-full ${emailWarning ? 'border-[#E03E3E]' : 'border-white/[0.08]'} focus:border-[#2383e2]`} />
                {emailWarning && <p className="text-[#E03E3E] text-[11px] mt-1.5 font-medium tracking-tight">Please enter a valid email address</p>}
              </div>
              <div>
                <input type="password" placeholder="Password" value={authPassword}
                  onChange={e => { setAuthPassword(e.target.value); setAuthError(''); setSubmittedEmail(false) }}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#2383e2] tracking-tight rounded-full" />
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
                className={`w-full px-4 py-3 text-sm font-semibold tracking-tight rounded-full transition-all ${canSubmit ? 'bg-[#2383e2] text-white' : 'bg-white/[0.06] text-white/30'}`}>
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
          <div className="w-full max-w-lg p-8 bg-[#0A0A0F] border border-white/[0.08] relative max-h-[80vh] overflow-y-auto rounded-2xl">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0A0A0F] pb-2">
              <h2 className="text-base font-bold tracking-tight text-white">Terms &amp; Conditions</h2>
              <button onClick={() => setShowTc(false)} className="text-white/40 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="text-xs text-white/50 leading-relaxed space-y-3 tracking-tight">
              <p><strong className="text-white/70">1. Acceptance of Terms</strong><br />By accessing JEEIFY, you agree to these terms. If you do not agree, do not use the service.</p>
              <p><strong className="text-white/70">2. Description of Service</strong><br />JEEIFY provides a personal study tracking dashboard for JEE aspirants. The service is provided &ldquo;as is&rdquo; without warranty.</p>
              <p><strong className="text-white/70">3. User Accounts</strong><br />You are responsible for maintaining the confidentiality of your Google account credentials used to sign in.</p>
              <p><strong className="text-white/70">4. Data Storage</strong><br />Your study data is stored locally in your browser via IndexedDB and optionally synced to Supabase cloud servers when signed in.</p>
              <p><strong className="text-white/70">5. Acceptable Use</strong><br />You agree not to misuse the service for any unlawful purpose or to disrupt the service for other users.</p>
              <p><strong className="text-white/70">6. Limitation of Liability</strong><br />JEEIFY is not liable for any direct or indirect damages arising from the use or inability to use the service.</p>
              <p><strong className="text-white/70">7. Changes to Terms</strong><br />We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance.</p>
              <p className="text-white/30 pt-3">Last updated: June 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Privacy Modal ─── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg p-8 bg-[#0A0A0F] border border-white/[0.08] relative max-h-[80vh] overflow-y-auto rounded-2xl">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0A0A0F] pb-2">
              <h2 className="text-base font-bold tracking-tight text-white">Privacy Policy</h2>
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
    </div>
  )
}
