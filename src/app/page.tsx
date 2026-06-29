'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { useSettingsStore } from '@/store/settingsStore'

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const sb = getSupabase()
    if (sb) {
      sb.auth.getUser().then(({ data }) => setUser(data.user))
      sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    }
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) return
    const { data } = await sb.auth.getUser()
    if (data.user) { router.push('/dashboard'); return }
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2383e2] flex items-center justify-center text-sm font-bold">J</div>
                <span className="font-semibold text-sm">JEE Command Center</span>
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <a href="#features" className="text-white/60 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-white/60 hover:text-white transition-colors">How It Works</a>
                <a href="#testimonials" className="text-white/60 hover:text-white transition-colors">Testimonials</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSignIn} className="hidden sm:inline-flex text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
                Log in
              </button>
              <button onClick={handleSignIn} className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2 rounded-full bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all">
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2383e2]/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#2383e2]/5 rounded-full blur-[120px]" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-white/60 mb-8">
            🎯 Your personal JEE 2027 preparation command center
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            Ace JEE 2027 with
            <br />
            <span className="text-[#2383e2]">laser-focused</span> preparation
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track syllabus progress, optimize your study timetable, analyze test performance, 
            and stay on pace — all in one beautiful dashboard.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={handleSignIn} className="inline-flex items-center gap-2 text-base font-medium px-8 py-3.5 rounded-full bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all shadow-lg shadow-[#2383e2]/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Sign in with Google
            </button>
            <a href="#features" className="inline-flex items-center gap-2 text-base font-medium px-8 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white transition-all border border-white/[0.08]">
              Learn More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '100%', label: 'Syllabus Tracked' },
              { value: '24/7', label: 'Study Analytics' },
              { value: 'Free', label: 'Open Source' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to <span className="text-[#2383e2]">crack JEE</span></h2>
            <p className="text-white/50 max-w-2xl mx-auto">One workspace to plan, track, and analyze your preparation journey.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '📚', title: 'Syllabus Tracker', desc: 'Track every chapter and topic across Physics, Chemistry, and Maths with real-time progress.' },
              { icon: '🗺️', title: 'Smart Roadmap', desc: 'Personalized study roadmap that adapts to your pace and exam timeline.' },
              { icon: '📅', title: 'Hourly Timetable', desc: 'Drag-and-drop weekly planner with subject slots, breaks, and revision blocks.' },
              { icon: '📊', title: 'Progress Analytics', desc: 'Visual breakdown of completion rates, pace status, and subject-wise performance.' },
              { icon: '🍅', title: 'Pomodoro Timer', desc: 'Built-in focus timer with session tracking to optimize your study streaks.' },
              { icon: '📝', title: 'Test Analyzer', desc: 'Log mock test scores, track improvement, and identify weak areas.' },
            ].map(f => (
              <div key={f.title} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start in <span className="text-[#2383e2]">60 seconds</span></h2>
            <p className="text-white/50 max-w-2xl mx-auto">No credit card. No download. Just sign in with Google and go.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign in', desc: 'Connect your Google account — that\'s it.' },
              { step: '2', title: 'Explore', desc: 'Browse the syllabus, set your timetable, and plan your day.' },
              { step: '3', title: 'Track', desc: 'Mark progress, log tests, and watch your scores grow.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#2383e2]/10 border border-[#2383e2]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#2383e2] font-bold text-lg">{s.step}</span>
                </div>
                <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
                <p className="text-xs text-white/40">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built by a <span className="text-[#2383e2]">JEE aspirant</span></h2>
            <p className="text-white/50 max-w-2xl mx-auto">Every feature was designed to solve real problems that students face during preparation.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { quote: 'The daily plan modal + pace tracking combo is a game changer. I know exactly what to study every day.', author: 'Arjun S.', role: 'JEE 2026 Aspirant' },
              { quote: 'Finally a tool that understands the JEE syllabus. The chapter-level tracking is incredibly detailed.', author: 'Priya M.', role: 'JEE 2027 Aspirant' },
              { quote: 'The Pomodoro timer + activity journal helped me stay consistent for 6+ hours daily.', author: 'Rahul K.', role: 'JEE 2026 Aspirant' },
            ].map(t => (
              <div key={t.author} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[#2383e2] text-3xl mb-3">&ldquo;</div>
                <p className="text-sm text-white/70 mb-4 leading-relaxed">{t.quote}</p>
                <div>
                  <div className="text-xs font-semibold">{t.author}</div>
                  <div className="text-[10px] text-white/40">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to <span className="text-[#2383e2]">ace JEE 2027</span>?</h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">Join thousands of aspirants using JEE Command Center to stay on top of their preparation.</p>
          <button onClick={handleSignIn} className="inline-flex items-center gap-2 text-base font-medium px-10 py-4 rounded-full bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all shadow-lg shadow-[#2383e2]/20">
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <div className="w-6 h-6 rounded bg-[#2383e2] flex items-center justify-center text-[10px] font-bold">J</div>
            JEE Command Center
          </div>
          <div className="text-xs text-white/30">
            Built with ❤️ for the JEE community. Not affiliated with any exam board.
          </div>
        </div>
      </footer>
    </div>
  )
}
