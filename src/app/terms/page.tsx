'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 28, filter: 'brightness(0)' }} />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: '#111' }}>JEEIFY</span>
          </Link>
          <Link href="/" className="text-sm font-medium rounded-[40px] px-[16px] py-[5px] transition-all" style={{ color: 'var(--c-text-secondary)', border: '1px solid var(--c-border-input)' }}>&larr; Back</Link>
        </div>
        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)', backgroundSize: '6px 1px' }} />
      </nav>

      <main className="max-w-[700px] mx-auto px-5 py-16 md:py-24">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-1px] mb-2" style={{ color: '#0f0f0f' }}>Terms &amp; Conditions</h1>
        <p className="text-[13px] mb-10" style={{ color: 'var(--c-caption)' }}>Last updated: June 2026</p>

        <div className="space-y-8 text-[14px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>1. Acceptance of Terms</h2>
            <p>By accessing or using JEEIFY (&quot;the Service&quot;), you agree to be bound by these terms. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>2. Description of Service</h2>
            <p>JEEIFY provides a personal study tracking dashboard designed for JEE aspirants. The Service includes syllabus tracking, timetable planning, pomodoro timer, test analysis, and progress analytics. The Service is provided &quot;as is&quot; without warranty of any kind.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your Google account credentials used to sign in. You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>4. Data Storage &amp; Sync</h2>
            <p>Your study data is stored locally in your browser via IndexedDB. When you sign in with Google, data may be synced to our Supabase cloud servers to enable cross-device access. You can export or delete your data at any time from the Settings page.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>5. Acceptable Use</h2>
            <p>You agree not to misuse the Service for any unlawful purpose. This includes but is not limited to attempting to disrupt the Service, accessing other users&apos; data, or using the Service for any purpose other than personal study tracking.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>6. Limitation of Liability</h2>
            <p>JEEIFY and its creators are not liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use the Service. This includes but is not limited to loss of data, loss of study time, or exam performance.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>7. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Changes will be effective immediately upon posting. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>8. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and without prior notice. Upon termination, your right to use the Service will immediately cease.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: '#0f0f0f' }}>9. Contact</h2>
            <p>For questions about these terms, reach out via our <Link href="/contact" className="text-[var(--c-blue)] hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-black/[0.06] py-8 px-5 max-w-[1100px] mx-auto text-center text-[12px]" style={{ color: 'var(--c-caption)' }}>
        Made with <span style={{ color: '#E03E3E' }}>&#9829;</span> by Ashish
      </footer>
    </div>
  )
}
