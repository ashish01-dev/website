'use client'

import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

export default function AIPoliciesPage() {
  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <div className="max-w-[700px] mx-auto px-5 pt-[17px] pb-6 animate-page-in" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <Link href="/ai" className="inline-flex items-center gap-1.5 text-sm mb-8" style={{ color: 'var(--c-muted)' }}>
          <span className="material-symbols-rounded text-[18px]">arrow_back</span>
          Back to AI Assistant
        </Link>

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
              Your study data — including chapter progress, test scores, and study patterns — stays on your device via IndexedDB
              and is optionally synced to your Supabase account for cloud backup. We do not sell or share your data with third parties
              for advertising or other non-essential purposes. AI queries may be processed by third-party models, but we
              minimize data exposure to only what is necessary.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>How Recommendations Are Generated</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              Recommendations are generated using your study history, chapter completion status, estimated chapter duration,
              revision gaps, exam date, and available study time. The system scores chapters based on priority factors including
              JEE weightage, days since last study, and completion percentage. No external data or profiling is used.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Data Storage & Sync</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              All your data is stored locally in your browser using IndexedDB. If you connect a Supabase account, your data is
              synced to the cloud for backup and cross-device access. You can export or delete all your data at any time from
              the Settings page. Sync is optional and you can use the app fully offline.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Limitations</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              AI recommendations are based on available data and estimated progress. They may not always reflect your current
              preparation level accurately. Always use your own judgment when planning your study schedule. As more data is
              collected, recommendations will become more precise. Future versions will incorporate mock test performance,
              question-level accuracy, and detailed topic mastery analysis.
            </p>
          </div>

          <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Protecting Your Data</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              We implement reasonable security measures to protect your data. Communication with third-party AI APIs is
              encrypted. We do not store AI conversation history on our servers. Your Supabase sync data is isolated per user
              and accessible only with your authentication token. We recommend using a strong password and enabling
              two-factor authentication on your Supabase account.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/ai" className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]" style={{ background: 'var(--c-btn-primary)' }}>
            <span className="material-symbols-rounded text-[18px]">auto_awesome</span>
            Back to AI Assistant
          </Link>
        </div>
      </div>
    </div>
  )
}
