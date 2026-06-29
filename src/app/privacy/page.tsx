'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 28, filter: 'var(--c-logo-filter)' }} />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>
          <Link href="/" className="text-sm font-medium rounded-[40px] px-[16px] py-[5px] transition-all" style={{ color: 'var(--c-text-secondary)', border: '1px solid var(--c-border-input)' }}>&larr; Back</Link>
        </div>
        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)', backgroundSize: '6px 1px' }} />
      </nav>

      <main className="max-w-[700px] mx-auto px-5 py-16 md:py-24">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-1px] mb-2" style={{ color: 'var(--c-text)' }}>Privacy Policy</h1>
        <p className="text-[13px] mb-10" style={{ color: 'var(--c-caption)' }}>Last updated: June 2026</p>

        <div className="space-y-8 text-[14px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>1. Information We Collect</h2>
            <p>We collect your Google account email and name when you sign in via Google OAuth. Study progress data — including chapter completion, test scores, pomodoro sessions, and daily plans — is stored locally in your browser via IndexedDB and optionally synced to our Supabase cloud servers when you are signed in.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>2. How We Use Information</h2>
            <p>Your data is used solely to provide the JEE study tracking service. We use your email for authentication and account identification. Study data powers your dashboard, progress tracking, pace calculations, and personalized recommendations. We do not sell, share, or distribute your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>3. Data Storage</h2>
            <p>Primary storage is in your browser via IndexedDB — your data stays on your device by default. Cloud sync via Supabase is optional and only occurs when you sign in with your Google account. You can disable sync at any time from the Settings page.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>4. Third-Party Services</h2>
            <p>We use Google OAuth for authentication and Supabase for optional cloud sync and file storage. Both services operate under their own privacy policies. We do not control how these third parties handle your data.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>5. Your Rights</h2>
            <p>You can export, clear, or delete all your data at any time from the Settings page. You can also sign out to stop cloud sync. If you wish to have your account data permanently removed from our servers, contact us via the Contact page.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>6. Cookies</h2>
            <p>We use essential cookies for authentication and theme preferences. No tracking cookies or analytics cookies are used. You can clear your cookies at any time through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>7. Contact</h2>
            <p>For privacy concerns or data removal requests, reach out via our <Link href="/contact" className="text-[var(--c-blue)] hover:underline">Contact page</Link>.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--c-border)] py-8 px-5 max-w-[1100px] mx-auto text-center text-[12px]" style={{ color: 'var(--c-caption)' }}>
        Made with <span style={{ color: '#E03E3E' }}>&#9829;</span> by Ashish
      </footer>
    </div>
  )
}
