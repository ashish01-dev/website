'use client'

import Link from 'next/link'
import LandingNav from '@/components/layout/LandingNav'

const MILESTONES = [
  { year: '2024', title: 'The Idea', desc: 'JEEIFY was born from late-night study sessions — a small tool to track syllabus progress that our founder built for himself.' },
  { year: '2025', title: 'First 100 Users', desc: 'Word spread among coaching institutes. Within months, 100+ JEE aspirants were using JEEIFY daily to organize their prep.' },
  { year: '2026', title: 'Full Platform Launch', desc: 'Syllabus tracker, timetable planner, test analyzer, Pomodoro timer, and cloud sync — a complete command center for JEE.' },
]

const TEAM = [
  { name: 'Ashish Singh', role: 'Student', text: 'As a JEE aspirant myself, I faced the exact same struggles — scattered notes, no clear way to track progress, hours of study with no direction. That frustration turned into determination. I decided to build the system I wished I had: a single command center that brings clarity, structure, and momentum to JEE preparation. JEEIFY is the result of that vision.' },
]

const TESTIMONIALS = [
  { quote: 'The daily plan modal + pace tracking combo is a game changer. I know exactly what to study every day.', author: 'Arjun S.', location: 'Delhi' },
  { quote: 'Finally a tool that understands the JEE syllabus. The chapter-level tracking is incredibly detailed.', author: 'Priya M.', location: 'Delhi' },
  { quote: 'The Pomodoro timer + activity journal helped me stay consistent for 6+ hours daily.', author: 'Rahul K.', location: 'Delhi' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-[80px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <LandingNav active="about" />

      {/* Hero */}
      <div className="px-5 py-20 md:py-28 max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--c-muted)' }}>About Us</p>
            <h1 className="text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.08] tracking-[-2px]" style={{ color: 'var(--c-text)' }}>
              We help you define<br />
              <span className="text-[var(--c-blue)]">your JEE journey.</span>
            </h1>
            <p className="text-[15px] mt-5 max-w-lg leading-relaxed" style={{ color: 'var(--c-muted)', lineHeight: 1.8 }}>
              JEEIFY isn&apos;t just a tracking app — it&apos;s a personal command center designed to bring structure, clarity, and momentum to your preparation. We believe every aspirant deserves a system that works as hard as they do.
            </p>
            <p className="text-[15px] mt-4 max-w-lg leading-relaxed" style={{ color: 'var(--c-muted)', lineHeight: 1.8 }}>
              From daily chapter progress to deep test analytics, we turn chaos into a clear, measurable path. Our pace algorithm tells you exactly where you stand and what to do next.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            {/* Two hands holding graphic */}
            <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px]">
              <svg viewBox="0 0 380 380" className="w-full h-full">
                <defs>
                  <linearGradient id="handGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2383e2" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2383e2" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="handGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2383e2" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2383e2" stopOpacity="0.04" />
                  </linearGradient>
                </defs>
                {/* Left hand */}
                <path d="M80 280 Q60 220 70 160 Q75 130 100 110 Q120 95 140 100 L130 140 Q125 160 140 170 L150 130 Q155 110 170 100 Q185 92 200 100 L190 140 Q185 160 200 170 L210 120 Q218 100 235 95 Q250 92 260 105 L250 145 Q245 165 260 175 L270 140 Q278 120 295 115 Q310 112 320 125 L310 160 Q305 180 300 220 Q295 260 280 300 L260 340 Q250 360 230 370 L210 375 Q190 370 180 350 L160 310 Q140 290 120 285 Z"
                  fill="url(#handGrad1)" stroke="#2383e2" strokeWidth="1.5" strokeOpacity="0.3" />
                {/* Right hand */}
                <path d="M300 280 Q320 220 310 160 Q305 130 280 110 Q260 95 240 100 L250 140 Q255 160 240 170 L230 130 Q225 110 210 100 Q195 92 180 100 L190 140 Q195 160 180 170 L170 120 Q162 100 145 95 Q130 92 120 105 L130 145 Q135 165 120 175 L110 140 Q102 120 85 115 Q70 112 60 125 L70 160 Q75 180 80 220 Q85 260 100 300 L120 340 Q130 360 150 370 L170 375 Q190 370 200 350 L220 310 Q240 290 260 285 Z"
                  fill="url(#handGrad2)" stroke="#2383e2" strokeWidth="1.5" strokeOpacity="0.3" />
                {/* Center glow */}
                <circle cx="190" cy="200" r="50" fill="#2383e2" opacity="0.06" />
                <circle cx="190" cy="200" r="30" fill="#2383e2" opacity="0.08" />
                {/* Star / sparkle in center */}
                <path d="M190 175 L194 190 L210 194 L194 198 L190 213 L186 198 L170 194 L186 190 Z"
                  fill="#2383e2" opacity="0.4" />
                <circle cx="190" cy="200" r="4" fill="#2383e2" opacity="0.5" />
                {/* Small dots around */}
                <circle cx="140" cy="160" r="2.5" fill="#2383e2" opacity="0.2" />
                <circle cx="240" cy="160" r="2.5" fill="#2383e2" opacity="0.2" />
                <circle cx="170" cy="140" r="2" fill="#2383e2" opacity="0.15" />
                <circle cx="210" cy="140" r="2" fill="#2383e2" opacity="0.15" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-[1100px] mx-auto px-5 pb-20" style={{ contentVisibility: 'auto' }}>
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          <div className="flex-1 flex">
            <div className="rounded-[18px] px-[28px] py-[32px] w-full" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)',
            }}>
              <h3 className="text-[20px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Our Mission</h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--c-muted)', lineHeight: 1.8 }}>
                Every year, over a million students appear for JEE. Most of them have the talent but lack the right system to track, measure, and optimize their preparation.
              </p>
              <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--c-muted)', lineHeight: 1.8 }}>
                We built JEEIFY to bridge that gap. Our platform replaces scattered notebooks, forgotten deadlines, and vague progress with one clean, data-driven interface.
              </p>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--c-muted)', lineHeight: 1.8 }}>
                We believe that with the right tools, every aspirant — regardless of their background or coaching access — can compete at the highest level.
              </p>
            </div>
          </div>
          <div className="flex-1 flex">
            <div className="rounded-[18px] px-[28px] py-[32px] w-full" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)',
            }}>
              <h3 className="text-[20px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Our Values</h3>
              <div className="space-y-4">
                {[
                  { title: 'Clarity', desc: 'Complex data, simple interface. Every number tells a story about your prep.' },
                  { title: 'Consistency', desc: 'Small daily actions compound into extraordinary results. We make consistency effortless.' },
                  { title: 'Community', desc: '20% of our earnings fund education for students who can\'t afford coaching.' },
                  { title: 'Continuous Improvement', desc: 'We ship updates every week based on real feedback from aspirants like you.' },
                ].map(v => (
                  <div key={v.title}>
                    <div className="text-[14px] font-semibold mb-0.5" style={{ color: 'var(--c-text)' }}>{v.title}</div>
                    <div className="text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>{v.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey timeline */}
      <div className="max-w-[800px] mx-auto px-5 pb-20" style={{ contentVisibility: 'auto' }}>
        <div className="text-center mb-14">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>Our Aim</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            A clear target,<span className="text-[#888]"> a clear path</span>
          </h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-[2px]" style={{ background: 'var(--c-border)' }} />
          <div className="space-y-10">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="relative pl-16">
                <div className="absolute left-[21px] top-1 w-[14px] h-[14px] rounded-full border-2" style={{
                  background: 'var(--c-bg-gradient)',
                  borderColor: 'var(--c-blue)',
                  boxShadow: '0 0 0 4px var(--c-card)',
                }} />
                <div className="text-[11px] font-bold tracking-wider mb-1" style={{ color: 'var(--c-blue)' }}>{m.year}</div>
                <h3 className="text-[17px] font-semibold mb-1" style={{ color: 'var(--c-text)' }}>{m.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-[1100px] mx-auto px-5 pb-20" style={{ contentVisibility: 'auto' }}>
        <div className="text-center mb-14">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>Team</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            Built with<span className="text-[#888]"> purpose</span>
          </h2>
        </div>
        <div className="flex justify-center">
          {TEAM.map(t => (
            <div key={t.name} className="rounded-[18px] px-[22px] py-[24px] text-center max-w-[380px]" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
            }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold" style={{ background: 'var(--c-tag)', color: 'var(--c-blue)' }}>
                {t.name.split(' ').map(n => n.charAt(0)).join('')}
              </div>
              <div className="text-[16px] font-semibold mb-1" style={{ color: 'var(--c-text)' }}>{t.name}</div>
              <div className="text-[12px] mb-3" style={{ color: 'var(--c-caption)' }}>{t.role}</div>
              <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--c-muted)' }}>{t.text}</p>
              <div className="flex items-center justify-center gap-3">
                <a href="https://www.linkedin.com/in/ashish-kumar0406/" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-[1px]"
                  style={{ background: 'var(--c-tag)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--c-blue)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://github.com/ashish01-dev" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-[1px]"
                  style={{ background: 'var(--c-tag)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--c-text)"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://x.com/TechMaster54321" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-[1px]"
                  style={{ background: 'var(--c-tag)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--c-text)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="mailto:ashish.jayshreeram@gmail.com"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-[1px]"
                  style={{ background: 'var(--c-tag)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-[1100px] mx-auto px-5 pb-20" style={{ contentVisibility: 'auto' }}>
        <div className="text-center mb-14">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>Stories</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            What our users say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.author} className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200 hover:-translate-y-[3px]" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--c-shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--c-shadow)' }}>
              <div className="text-[var(--c-blue)] text-2xl font-serif mb-3 leading-none">&ldquo;</div>
              <p className="text-[14px] mb-6 leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{t.quote}</p>
              <div className="border-t border-[var(--c-border)] pt-4">
                <div className="text-[14px] font-semibold" style={{ color: 'var(--c-text)' }}>{t.author}</div>
                <div className="text-[12px]" style={{ color: 'var(--c-muted)' }}>{t.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center px-5 pb-20">
        <h2 className="text-[clamp(24px,3vw,40px)] font-medium tracking-[-1px] mb-4" style={{ color: 'var(--c-text)' }}>
          Ready to own your prep?
        </h2>
        <p className="text-[14px] mb-6 max-w-md mx-auto" style={{ color: 'var(--c-muted)' }}>
          Join thousands of JEE aspirants who use JEEIFY to stay organized, motivated, and on track.
        </p>
        <Link href="/auth?mode=signup"
          className="inline-flex items-center gap-2 text-white text-[14px] font-medium rounded-[40px] px-[22px] py-[8px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
          style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </span>
          Start Free
        </Link>
      </div>

    </div>
  )
}
