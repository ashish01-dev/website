'use client'

import Link from 'next/link'
import BackButton from '@/components/layout/BackButton'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 28, filter: 'var(--c-logo-filter)' }} />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>
        </div>
        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)', backgroundSize: '6px 1px' }} />
      </nav>

      <main className="max-w-[700px] mx-auto px-5 py-16 md:py-24">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-1px] mb-2" style={{ color: 'var(--c-text)' }}>Terms &amp; Conditions</h1>
        <p className="text-[13px] mb-10" style={{ color: 'var(--c-caption)' }}>Last updated: June 2026</p>

        <div className="space-y-4">
          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>By accessing or using JEEIFY (&quot;the Service&quot;), you agree to be bound by these terms. If you do not agree to these terms, do not use the Service.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>2. Description of Service</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>JEEIFY provides a personal study tracking dashboard designed for JEE aspirants. The Service includes syllabus tracking, timetable planning, pomodoro timer, test analysis, and progress analytics. The Service is provided &quot;as is&quot; without warranty of any kind.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>3. User Accounts</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>You are responsible for maintaining the confidentiality of your Google account credentials used to sign in. You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>4. Data Storage &amp; Sync</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>Your study data is stored locally in your browser via IndexedDB. When you sign in with Google, data may be synced to our Supabase cloud servers to enable cross-device access. You can export or delete your data at any time from the Settings page.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>5. Acceptable Use</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>You agree not to misuse the Service for any unlawful purpose. This includes but is not limited to attempting to disrupt the Service, accessing other users&apos; data, or using the Service for any purpose other than personal study tracking.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>6. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>JEEIFY and its creators are not liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use the Service. This includes but is not limited to loss of data, loss of study time, or exam performance.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>7. Changes to Terms</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>We reserve the right to update these terms at any time. Changes will be effective immediately upon posting. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>8. Termination</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and without prior notice. Upon termination, your right to use the Service will immediately cease.</p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>9. Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>For questions about these terms, reach out via our <Link href="/contact" className="text-[var(--c-blue)] hover:underline">Contact page</Link>.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-10">
          <BackButton />
          <Link href="/privacy"
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-[40px] transition-all"
            style={{ color: 'var(--c-text-secondary)', background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
            Privacy Policy
          </Link>
          <Link href="/ai-policies"
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-[40px] transition-all"
            style={{ color: 'var(--c-text-secondary)', background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
            AI Policies
          </Link>
        </div>
      </main>

      <footer className="border-t border-[var(--c-border)] py-8 px-5 max-w-[1100px] mx-auto text-center text-[12px]" style={{ color: 'var(--c-caption)' }}>
        <div className="flex items-center justify-center gap-4 text-xs mb-3" style={{ color: 'var(--c-caption)' }}>
          <Link href="/terms" className="hover:underline" style={{ color: 'var(--c-muted)' }}>Terms & Conditions</Link>
          <Link href="/privacy" className="hover:underline" style={{ color: 'var(--c-muted)' }}>Privacy Policy</Link>
          <Link href="/contact" className="hover:underline" style={{ color: 'var(--c-muted)' }}>Contact</Link>
        </div>
        <p>&copy; 2026 JEEIFY. All rights reserved.</p>
      </footer>
    </div>
  )
}
