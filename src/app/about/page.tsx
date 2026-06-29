'use client'

import Link from 'next/link'

const MILESTONES = [
  { year: '2024', title: 'The Idea', desc: 'JEEIFY was born from late-night study sessions — a small tool to track syllabus progress that our founder built for himself.' },
  { year: '2025', title: 'First 100 Users', desc: 'Word spread among coaching institutes. Within months, 100+ JEE aspirants were using JEEIFY daily to organize their prep.' },
  { year: '2026', title: 'Full Platform Launch', desc: 'Syllabus tracker, timetable planner, test analyzer, Pomodoro timer, and cloud sync — a complete command center for JEE.' },
  { year: '2027+', title: 'Empowering Millions', desc: 'Our vision: every JEE aspirant in India has access to world-class preparation tools, regardless of their background.' },
]

const TEAM = [
  { name: 'Ashish Singh', role: 'GGSIPU Student', text: 'A passionate JEE mentor and self-taught developer who built JEEIFY from his own preparation experience. Believes that the right system can turn any aspirant into a top performer.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-[80px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      {/* Navbar */}
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 28, filter: 'var(--c-logo-filter)' }} />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>
          <div className="hidden md:flex items-center gap-9">
            <Link href="/" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: 'var(--c-text)' }}>Home</Link>
            <Link href="/pricing" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: 'var(--c-text)' }}>Pricing</Link>
            <Link href="/about" className="text-sm font-normal" style={{ color: 'var(--c-blue)' }}>About</Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth?mode=login" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: 'var(--c-text)' }}>Sign In</Link>
            <Link href="/auth?mode=signup"
              className="flex items-center gap-2 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
              style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </span>
              Get Started
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px] pointer-events-none max-md:left-5 max-md:right-5" style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)',
          backgroundSize: '6px 1px',
        }} />
      </nav>

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

      {/* NGO Donation Banner */}
      <div className="max-w-[1100px] mx-auto px-5 pb-20">
        <div className="rounded-[20px] px-8 py-10 md:py-12 md:px-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, var(--c-card) 0%, rgba(35,131,226,0.06) 100%)',
          border: '1px solid rgba(35,131,226,0.15)',
        }}>
          {/* Decorative bg glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ background: 'var(--c-blue)' }} />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[60px] opacity-15 pointer-events-none" style={{ background: 'var(--c-blue)' }} />

          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-5" style={{ background: 'rgba(35,131,226,0.1)', color: 'var(--c-blue)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              Social Impact
            </div>
            <h2 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-[-1.5px] leading-[1.1]" style={{ color: 'var(--c-text)' }}>
              20% of our earnings<br />
              <span className="text-[var(--c-blue)]">goes to NGOs</span>
            </h2>
            <p className="text-[14px] mt-4 max-w-md leading-relaxed" style={{ color: 'var(--c-muted)', lineHeight: 1.8 }}>
              Every subscription directly supports education nonprofits across India. We donate to organizations that provide free coaching, study materials, and scholarships to underprivileged JEE aspirants.
            </p>
            <p className="text-[13px] mt-3 max-w-md leading-relaxed" style={{ color: 'var(--c-caption)', lineHeight: 1.7 }}>
              When you upgrade to Pro, you&apos;re not just investing in yourself — you&apos;re helping someone else get a fair shot at their dream too.
            </p>
          </div>

          <div className="flex-shrink-0 relative z-10">
            {/* Money with heart graphic */}
            <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px]">
              <svg viewBox="0 0 220 220" className="w-full h-full">
                <defs>
                  <radialGradient id="moneyGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#2383e2" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#2383e2" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="110" r="90" fill="url(#moneyGlow)" />
                {/* Bag / money symbol */}
                <rect x="65" y="80" width="90" height="90" rx="12" fill="none" stroke="#2383e2" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M65 100 L155 100" stroke="#2383e2" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M85 80 L85 65 Q85 55 95 55 L125 55 Q135 55 135 65 L135 80" fill="none" stroke="#2383e2" strokeWidth="2" strokeOpacity="0.3" />
                {/* Rupee symbol */}
                <text x="110" y="130" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#2383e2" opacity="0.5">₹</text>
                {/* Heart */}
                <path d="M110 155 C110 155 90 140 80 130 C70 120 70 105 80 95 C90 85 100 90 110 100 C120 90 130 85 140 95 C150 105 150 120 140 130 C130 140 110 155 110 155 Z"
                  fill="#2383e2" opacity="0.25" />
                {/* Small hearts floating around */}
                <path d="M35 60 C35 60 28 52 24 47 C20 42 20 34 24 30 C28 26 33 28 35 33 C37 28 42 26 46 30 C50 34 50 42 46 47 C42 52 35 60 35 60 Z"
                  fill="#2383e2" opacity="0.18" />
                <path d="M175 50 C175 50 169 44 166 40 C163 36 163 30 166 27 C169 24 173 26 175 30 C177 26 181 24 184 27 C187 30 187 36 184 40 C181 44 175 50 175 50 Z"
                  fill="#2383e2" opacity="0.15" />
                <path d="M185 150 C185 150 180 145 178 142 C176 139 176 134 178 132 C180 130 183 131 185 134 C187 131 190 130 192 132 C194 134 194 139 192 142 C190 145 185 150 185 150 Z"
                  fill="#2383e2" opacity="0.12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="max-w-[900px] mx-auto px-5 pb-20">
        <div className="rounded-[18px] px-[28px] py-[32px] grid grid-cols-2 md:grid-cols-4 gap-8" style={{
          background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
        }}>
          {[
            { value: '10,000+', label: 'Active Aspirants' },
            { value: '50,000+', label: 'Chapters Tracked' },
            { value: '2,00,000+', label: 'Test Scores Logged' },
            { value: '₹5,00,000+', label: 'Donated to NGOs' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[clamp(24px,3vw,36px)] font-bold tracking-[-1px]" style={{ color: 'var(--c-text)' }}>{s.value}</div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--c-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-[1100px] mx-auto px-5 pb-20">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="rounded-[18px] px-[28px] py-[32px]" style={{
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
          <div className="flex-1">
            <div className="rounded-[18px] px-[28px] py-[32px]" style={{
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
      <div className="max-w-[800px] mx-auto px-5 pb-20">
        <div className="text-center mb-14">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>Our Journey</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            From a side project to<span className="text-[#888]"> a movement</span>
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
      <div className="max-w-[1100px] mx-auto px-5 pb-20">
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
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>{t.text}</p>
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

      {/* Footer */}
      <div className="text-center px-5">
        <p className="text-[12px]" style={{ color: 'var(--c-caption)' }}>
          © 2026 JEEIFY. All rights reserved.
        </p>
      </div>
    </div>
  )
}
