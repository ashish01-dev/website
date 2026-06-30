'use client'

import Link from 'next/link'

export default function AIPoliciesPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 28, filter: 'var(--c-logo-filter)' }} />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>
          <Link href="/ai" className="text-sm font-medium rounded-[40px] px-[16px] py-[5px] transition-all" style={{ color: 'var(--c-text-secondary)', border: '1px solid var(--c-border-input)' }}>&larr; Back to AI</Link>
        </div>
        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)', backgroundSize: '6px 1px' }} />
      </nav>

      <main className="max-w-[700px] mx-auto px-5 py-16 md:py-24">
        <h1 className="text-[clamp(28px,3vw,40px)] font-medium tracking-[-1px] mb-3" style={{ color: 'var(--c-text)' }}>
          AI Policies
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--c-muted)' }}>
          How we use AI, third-party APIs, and protect your data.
        </p>

        <div className="space-y-6">
          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Third-Party AI Providers</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              Our AI features use third-party APIs including NVIDIA AI Studio, which may process your study queries to generate responses.
              We carefully select providers that align with our privacy standards. No personal identifiable information beyond your study
              data is shared with these services.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Data Privacy</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              Your study data stays on your device via IndexedDB and is optionally synced to your Supabase account for cloud backup.
              We do not sell or share your data with third parties for advertising or other non-essential purposes.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>How Recommendations Are Generated</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              Recommendations are generated using your study history, chapter completion status, estimated chapter duration,
              revision gaps, exam date, and available study time. No external data or profiling is used.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Data Storage & Sync</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              All your data is stored locally in your browser using IndexedDB. If you connect a Supabase account, your data is
              synced to the cloud for backup and cross-device access. You can export or delete all your data at any time from
              the Settings page.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Limitations</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              AI recommendations are based on available data and estimated progress. They may not always reflect your current
              preparation level accurately. Always use your own judgment when planning your study schedule.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Protecting Your Data</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              Communication with third-party AI APIs is encrypted. We do not store AI conversation history on our servers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-10">
          <Link href="/terms"
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-[40px] transition-all"
            style={{ color: 'var(--c-text-secondary)', background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
            Terms & Conditions
          </Link>
          <Link href="/privacy"
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-[40px] transition-all"
            style={{ color: 'var(--c-text-secondary)', background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
            Privacy Policy
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
