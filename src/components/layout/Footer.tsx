'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--c-border)] py-16 md:py-20 px-5 w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--c-text)' }}>Product</h3>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Features</a></li>
              <li><Link href="/pricing" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Pricing</Link></li>
              <li><a href="#about" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Testimonials</a></li>
              <li><Link href="/auth?mode=signup" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--c-text)' }}>Explore</h3>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Dashboard</Link></li>
              <li><Link href="/syllabus" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Syllabus</Link></li>
              <li><Link href="/roadmap" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Roadmap</Link></li>
              <li><Link href="/timetable" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Timetable</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--c-text)' }}>Company</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>About</Link></li>
              <li><Link href="/contact" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Contact</Link></li>
              <li><Link href="/auth?mode=login" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--c-text)' }}>Legal</h3>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>Terms of Service</Link></li>
              <li><Link href="/ai-policies" className="text-[13px] transition-colors hover:text-[var(--c-blue)]" style={{ color: 'var(--c-muted)' }}>AI Policies</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--c-border)]">
          <div className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" loading="lazy" style={{ height: 22, filter: 'var(--c-logo-filter)' }} />
            <span className="text-[18px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </div>
          <div className="text-[12px]" style={{ color: 'var(--c-caption)' }}>
            Made with <span style={{ color: '#E03E3E' }}>&#9829;</span> by Ashish
          </div>
          <div className="text-[12px]" style={{ color: 'var(--c-caption)' }}>
            &copy; 2026 JEEIFY. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
