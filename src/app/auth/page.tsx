'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

const PASSWORD_RULES = [
  { label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'At least 1 number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'At least 6 characters', test: (v: string) => v.length >= 6 },
]

function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState(false)

  const emailValid = isValidEmail(email)
  const emailWarning = emailTouched && email.length > 0 && !emailValid
  const canSubmit = emailValid && PASSWORD_RULES.every(r => r.test(password))

  useEffect(() => {
    const sb = getSupabase()
    if (sb) {
      sb.auth.getUser().then((res: { data: { user: Session['user'] | null } }) => { if (res.data.user) router.replace('/dashboard') })
      sb.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => { if (session?.user) router.replace('/dashboard') })
    }
  }, [router])

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
  }

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedEmail(true)
    setError('This feature is in works. Please login with Google.')
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to top left, #F5F5F5, #F7F7F7)' }}>
      {/* Left: Auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-[9px] mb-10">
            <img
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg"
              alt="logo"
              style={{ height: 28, filter: 'brightness(0)' }}
            />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: '#111' }}>JEEIFY</span>
          </Link>

          <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-1px] mb-2" style={{ color: '#0f0f0f' }}>
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-[14px] mb-8" style={{ color: '#888' }}>
            {mode === 'signup' ? 'Start your JEE 2027 journey.' : 'Continue your JEE 2027 journey.'}
          </p>

          <button onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-[40px] transition-all duration-200 mb-6"
            style={{ border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', background: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = '#fff' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            <span className="text-sm font-medium" style={{ color: '#111' }}>Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="bg-[#F5F5F5] px-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#aaa' }}>Or</span></div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <input type="email" placeholder="Email address" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); setSubmittedEmail(false); if (!emailTouched) setEmailTouched(true) }}
                className={`w-full px-4 py-3 text-sm outline-none transition-colors rounded-[40px] ${emailWarning ? 'border-[#E03E3E]' : ''}`}
                style={{ border: `1px solid ${emailWarning ? '#E03E3E' : 'rgba(0,0,0,0.1)'}`, color: '#111', background: '#fff' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                onBlur={e => { if (!emailWarning) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
              {emailWarning && <p className="text-[#E03E3E] text-[11px] mt-1.5 font-medium">Please enter a valid email address</p>}
            </div>
            <div>
              <input type="password" placeholder="Password" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); setSubmittedEmail(false) }}
                className="w-full px-4 py-3 text-sm outline-none rounded-[40px] transition-colors"
                style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#111', background: '#fff' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }} />
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map(r => {
                    const pass = r.test(password)
                    return <div key={r.label} className={`text-[11px] flex items-center gap-1.5 ${pass ? 'text-[#0f8a5e]' : 'text-[#aaa]'}`}>
                      <span>{pass ? '✓' : '○'}</span> {r.label}
                    </div>
                  })}
                </div>
              )}
            </div>
            {error && submittedEmail && <p className="text-[#d9730d] text-[11px] text-center font-medium">{error}</p>}
            <button type="submit" disabled={!canSubmit}
              className="w-full px-4 py-3 text-sm font-semibold rounded-[40px] transition-all disabled:opacity-40"
              style={{
                background: canSubmit ? '#2383e2' : 'rgba(0,0,0,0.06)',
                color: canSubmit ? '#fff' : '#aaa',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}>
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-[12px] text-center mt-6" style={{ color: '#888' }}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setEmail(''); setPassword(''); setError(''); setEmailTouched(false); setSubmittedEmail(false) }}
              className="font-medium hover:underline" style={{ color: '#2383e2', cursor: 'pointer' }}>
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <p className="text-[11px] text-center mt-6 leading-relaxed" style={{ color: '#aaa' }}>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[#2383e2]">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-[#2383e2]">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Right: Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden" style={{ background: '#fff' }}>
        <svg viewBox="0 0 600 700" className="w-full h-full max-w-[500px]" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.9 }}>
          <defs>
            <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2383e2" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2383e2" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2383e2" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2383e2" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          {/* Trunk */}
          <path d="M300 700 Q295 550 290 450 Q285 380 295 320" stroke="#2383e2" strokeWidth="3" fill="none" strokeOpacity="0.2" />
          <path d="M300 700 Q305 550 310 450 Q315 380 305 320" stroke="#2383e2" strokeWidth="3" fill="none" strokeOpacity="0.2" />
          {/* Branch left */}
          <path d="M295 320 Q260 290 220 270" stroke="#2383e2" strokeWidth="2" fill="none" strokeOpacity="0.2" />
          <path d="M220 270 Q200 260 180 265" stroke="#2383e2" strokeWidth="1.5" fill="none" strokeOpacity="0.15" />
          {/* Branch right */}
          <path d="M305 320 Q340 290 380 270" stroke="#2383e2" strokeWidth="2" fill="none" strokeOpacity="0.2" />
          <path d="M380 270 Q400 260 420 265" stroke="#2383e2" strokeWidth="1.5" fill="none" strokeOpacity="0.15" />
          {/* Leaves - left cluster */}
          <circle cx="200" cy="240" r="45" fill="url(#leafGrad1)" />
          <circle cx="230" cy="220" r="40" fill="url(#leafGrad1)" />
          <circle cx="170" cy="250" r="35" fill="url(#leafGrad2)" />
          <circle cx="250" cy="200" r="38" fill="url(#leafGrad2)" />
          <circle cx="180" cy="220" r="30" fill="url(#leafGrad1)" />
          {/* Leaves - right cluster */}
          <circle cx="400" cy="240" r="45" fill="url(#leafGrad1)" />
          <circle cx="370" cy="220" r="40" fill="url(#leafGrad1)" />
          <circle cx="430" cy="250" r="35" fill="url(#leafGrad2)" />
          <circle cx="350" cy="200" r="38" fill="url(#leafGrad2)" />
          <circle cx="420" cy="220" r="30" fill="url(#leafGrad1)" />
          {/* Leaves - top */}
          <circle cx="260" cy="180" r="35" fill="url(#leafGrad2)" />
          <circle cx="300" cy="160" r="40" fill="url(#leafGrad1)" />
          <circle cx="340" cy="180" r="35" fill="url(#leafGrad2)" />
          <circle cx="280" cy="150" r="30" fill="url(#leafGrad1)" />
          <circle cx="320" cy="140" r="32" fill="url(#leafGrad2)" />
          {/* Small decorative dots */}
          <circle cx="240" cy="230" r="4" fill="#2383e2" fillOpacity="0.15" />
          <circle cx="360" cy="230" r="4" fill="#2383e2" fillOpacity="0.15" />
          <circle cx="300" cy="170" r="4" fill="#2383e2" fillOpacity="0.15" />
          <circle cx="200" cy="260" r="3" fill="#2383e2" fillOpacity="0.1" />
          <circle cx="400" cy="260" r="3" fill="#2383e2" fillOpacity="0.1" />
          <circle cx="300" cy="120" r="3" fill="#2383e2" fillOpacity="0.12" />
        </svg>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm font-medium" style={{ color: '#888' }}>Grow your knowledge. <span style={{ color: '#2383e2' }}>Branch out.</span></p>
        </div>
      </div>
    </div>
  )
}
