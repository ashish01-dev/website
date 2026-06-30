'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  return (
    <Suspense fallback={null}>
      <AuthPageContent />
    </Suspense>
  )
}

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signup' | 'login'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState(false)
  const [newEmailMessage, setNewEmailMessage] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const m = searchParams.get('mode')
    setMode(m === 'signup' ? 'signup' : 'login')
    const err = searchParams.get('error')
    if (err === 'auth_failed') setError('Sign-in failed. Please try again.')
    else if (err === 'missing_config') setError('Authentication is not configured yet.')
  }, [searchParams])

  const emailValid = isValidEmail(email)
  const emailWarning = emailTouched && email.length > 0 && !emailValid
  const canSubmit = emailValid && PASSWORD_RULES.every(r => r.test(password))

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then((res: { data: { user: any } }) => { if (res.data?.user) router.replace('/dashboard') })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => {
      if (session?.user) router.replace('/dashboard')
    })
    return () => subscription?.unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) return
    const { data } = await sb.auth.getUser()
    if (data?.user) { router.push('/dashboard'); return }
    setGoogleLoading(true)
    setError('')
    const redirectTo = `${window.location.origin}/auth/callback`
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedEmail(true)
    if (mode === 'login') {
      setError('This email is not registered. Please sign up instead.')
      setTimeout(() => {
        setMode('signup')
        setNewEmailMessage('We found your email. Complete registration below.')
        setError('')
      }, 1500)
    } else {
      setError('Email sign-up is being set up. Please sign in with Google.')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      {/* Left: Auth form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-[9px] mb-8 sm:mb-10">
            <img
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg"
              alt="logo"
              style={{ height: 28, filter: 'var(--c-logo-filter)' }}
            />
            <span className="text-xl font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>

          {/* Title */}
          <h1 className="text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.5px] mb-1.5" style={{ color: 'var(--c-text)' }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm mb-7 sm:mb-8" style={{ color: 'var(--c-muted)' }}>
            {mode === 'signup' ? 'Start your JEE 2027 journey.' : 'Continue your JEE 2027 journey.'}
          </p>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-[12px] text-xs font-medium" style={{
              background: 'rgba(224,62,62,0.08)',
              border: '1px solid rgba(224,62,62,0.15)',
              color: 'var(--c-red)',
            }}>
              {error}
            </div>
          )}
          {newEmailMessage && (
            <div className="mb-5 px-4 py-2.5 rounded-[12px] text-xs font-medium" style={{
              background: 'rgba(35,131,226,0.08)',
              border: '1px solid rgba(35,131,226,0.15)',
              color: 'var(--c-blue)',
            }}>
              {newEmailMessage}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-[14px] text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-input)',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              color: 'var(--c-text)',
              boxShadow: 'var(--c-shadow)',
            }}
            onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.borderColor = 'var(--c-text-secondary)'; e.currentTarget.style.boxShadow = 'var(--c-shadow-hover)' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)'; e.currentTarget.style.boxShadow = 'var(--c-shadow)' }}
          >
            {googleLoading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--c-border)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--c-blue)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            )}
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--c-border)' }} /></div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--c-caption)', background: 'var(--c-bg-gradient)' }}>
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3.5">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); setSubmittedEmail(false); if (!emailTouched) setEmailTouched(true) }}
                className="w-full px-4 py-3 text-sm outline-none rounded-[12px] transition-all"
                style={{
                  border: `1px solid ${emailWarning ? 'var(--c-red)' : 'var(--c-border-input)'}`,
                  color: 'var(--c-text)',
                  background: 'var(--c-card)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(35,131,226,0.1)' }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none'; if (!emailWarning) e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
              />
              {emailWarning && (
                <p className="mt-1.5 text-[11px] font-medium" style={{ color: 'var(--c-red)' }}>
                  Please enter a valid email address
                </p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); setSubmittedEmail(false) }}
                className="w-full px-4 py-3 text-sm outline-none rounded-[12px] transition-all"
                style={{
                  border: '1px solid var(--c-border-input)',
                  color: 'var(--c-text)',
                  background: 'var(--c-card)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(35,131,226,0.1)' }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
              />
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map(r => {
                    const pass = r.test(password)
                    return (
                      <div key={r.label} className="text-[11px] flex items-center gap-1.5"
                        style={{ color: pass ? 'var(--c-green)' : 'var(--c-caption)' }}
                      >
                        <span>{pass ? '✓' : '○'}</span> {r.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full px-4 py-3 text-sm font-semibold rounded-[12px] transition-all duration-200 disabled:opacity-40"
              style={{
                background: canSubmit ? 'var(--c-btn-primary)' : 'var(--c-border)',
                color: canSubmit ? '#fff' : 'var(--c-caption)',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-xs text-center mt-5" style={{ color: 'var(--c-muted)' }}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setEmail(''); setPassword(''); setError(''); setEmailTouched(false); setSubmittedEmail(false); setNewEmailMessage('') }}
              className="font-medium hover:underline transition-colors"
              style={{ color: 'var(--c-blue)', cursor: 'pointer' }}
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Terms */}
          <p className="text-[11px] text-center mt-6 leading-relaxed" style={{ color: 'var(--c-caption)' }}>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:opacity-70 transition-opacity" style={{ color: 'var(--c-text-secondary)' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:opacity-70 transition-opacity" style={{ color: 'var(--c-text-secondary)' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Right: Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden" style={{ background: 'var(--c-card)' }}>
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
          <path d="M300 700 Q295 550 290 450 Q285 380 295 320" stroke="#2383e2" strokeWidth="3" fill="none" strokeOpacity="0.2" />
          <path d="M300 700 Q305 550 310 450 Q315 380 305 320" stroke="#2383e2" strokeWidth="3" fill="none" strokeOpacity="0.2" />
          <path d="M295 320 Q260 290 220 270" stroke="#2383e2" strokeWidth="2" fill="none" strokeOpacity="0.2" />
          <path d="M220 270 Q200 260 180 265" stroke="#2383e2" strokeWidth="1.5" fill="none" strokeOpacity="0.15" />
          <path d="M305 320 Q340 290 380 270" stroke="#2383e2" strokeWidth="2" fill="none" strokeOpacity="0.2" />
          <path d="M380 270 Q400 260 420 265" stroke="#2383e2" strokeWidth="1.5" fill="none" strokeOpacity="0.15" />
          <circle cx="200" cy="240" r="45" fill="url(#leafGrad1)" />
          <circle cx="230" cy="220" r="40" fill="url(#leafGrad1)" />
          <circle cx="170" cy="250" r="35" fill="url(#leafGrad2)" />
          <circle cx="250" cy="200" r="38" fill="url(#leafGrad2)" />
          <circle cx="180" cy="220" r="30" fill="url(#leafGrad1)" />
          <circle cx="400" cy="240" r="45" fill="url(#leafGrad1)" />
          <circle cx="370" cy="220" r="40" fill="url(#leafGrad1)" />
          <circle cx="430" cy="250" r="35" fill="url(#leafGrad2)" />
          <circle cx="350" cy="200" r="38" fill="url(#leafGrad2)" />
          <circle cx="420" cy="220" r="30" fill="url(#leafGrad1)" />
          <circle cx="260" cy="180" r="35" fill="url(#leafGrad2)" />
          <circle cx="300" cy="160" r="40" fill="url(#leafGrad1)" />
          <circle cx="340" cy="180" r="35" fill="url(#leafGrad2)" />
          <circle cx="280" cy="150" r="30" fill="url(#leafGrad1)" />
          <circle cx="320" cy="140" r="32" fill="url(#leafGrad2)" />
          <circle cx="240" cy="230" r="4" fill="#2383e2" fillOpacity="0.15" />
          <circle cx="360" cy="230" r="4" fill="#2383e2" fillOpacity="0.15" />
          <circle cx="300" cy="170" r="4" fill="#2383e2" fillOpacity="0.15" />
          <circle cx="200" cy="260" r="3" fill="#2383e2" fillOpacity="0.1" />
          <circle cx="400" cy="260" r="3" fill="#2383e2" fillOpacity="0.1" />
          <circle cx="300" cy="120" r="3" fill="#2383e2" fillOpacity="0.12" />
        </svg>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--c-muted)' }}>Grow your knowledge. <span style={{ color: 'var(--c-blue)' }}>Branch out.</span></p>
        </div>
      </div>
    </div>
  )
}
