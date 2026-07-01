'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import LandingNav from '@/components/layout/LandingNav'
import ProActivationPopup from '@/components/ProActivationPopup'
import { useUser } from '@/lib/useUser'
import { useSettingsStore } from '@/store/settingsStore'

const ASTERISK_FEATURES = new Set(['Unlimited storage'])

const MONTHLY_PLANS = [
  {
    name: 'Free', price: '0', desc: 'Start your prep journey',
    features: ['Full syllabus tracking', 'Timetable planner', 'Pomodoro timer', 'Test score logging', 'Activity journal', '500 MB storage'],
    cta: 'Get Started Free', popular: false,
  },
  {
    name: 'Pro', price: '50', desc: 'Accelerate your preparation',
    features: ['Everything in Free', 'Unlimited storage', 'Advanced analytics', 'Priority support', 'Direct file downloads across devices', 'Custom study insights'],
    cta: 'Subscribe to Pro', popular: true,
  },
]

const YEARLY_PLANS = [
  {
    name: 'Free', price: '0', desc: 'Start your prep journey',
    features: ['Full syllabus tracking', 'Timetable planner', 'Pomodoro timer', 'Test score logging', 'Activity journal', '500 MB storage'],
    cta: 'Get Started Free', popular: false,
  },
  {
    name: 'Pro', price: '500', desc: 'Best value — 2 months free',
    features: ['Everything in Free', 'Unlimited storage', 'Advanced analytics', 'Priority support', 'Direct file downloads across devices', 'Custom study insights', 'Early access to new features'],
    cta: 'Subscribe Yearly', popular: true,
  },
]

const TESTIMONIALS = [
  { name: 'Neha G.', role: 'JEE 2027 Aspirant', text: 'Pro analytics showed me exactly which chapters I was weak in. My accuracy improved from 65% to 89% in 3 months.', rating: 5, avatar: '' },
  { name: 'Aarav K.', role: 'JEE 2027 Aspirant', text: 'The file sync across devices is seamless. I study on my tablet and review on my phone — everything stays in sync.', rating: 5, avatar: '' },
  { name: 'Sneha R.', role: 'JEE 2027 Aspirant', text: 'I switched from Free to Pro after a month. Unlimited storage means I never delete old test papers. Game changer.', rating: 5, avatar: '' },
  { name: 'Rahul M.', role: 'JEE 2027 Aspirant', text: 'Priority support responds in minutes, not hours. When I had a sync issue, they fixed it before my next study session.', rating: 5, avatar: '' },
  { name: 'Priya S.', role: 'JEE 2027 Aspirant', text: 'Custom study insights helped me realize I was spending too much time on topics I already knew. Now I focus better.', rating: 5, avatar: '' },
  { name: 'Vikram P.', role: 'JEE 2027 Aspirant', text: 'The daily study planner alone is worth upgrading for. It auto-adjusts when you fall behind. Incredible tool.', rating: 5, avatar: '' },
]

export default function PricingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isYearly, setIsYearly] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showProUpgrade, setShowProUpgrade] = useState(false)

  const plans = isYearly ? YEARLY_PLANS : MONTHLY_PLANS

  const handleSubscribe = async (price: string) => {
    setLoading(true)
    const sb = getSupabase()
    if (!sb) { setLoading(false); return }
    const { data: { session } } = await sb.auth.getSession()
    if (price === '0') {
      if (session?.user) {
        if (user?.isPro) { setLoading(false); return }
        router.push('/dashboard')
      } else {
        router.push('/auth?mode=signup')
      }
      return
    }
    if (user?.isPro) { setLoading(false); return }
    if (!session?.user) {
      router.push('/auth?mode=signup')
      return
    }
    setShowProUpgrade(true)
  }

  return (
    <div className="min-h-screen pb-[80px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <LandingNav active="pricing" />

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-5 py-20 md:py-28 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[100px] opacity-25 pointer-events-none" style={{ background: 'var(--c-blue)' }} />
        <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--c-muted)' }}>Pricing</p>
        <h1 className="text-[clamp(36px,5vw,56px)] font-medium leading-[1.05] tracking-[-2px]" style={{ color: 'var(--c-text)' }}>
          Choose your<span className="text-[var(--c-blue)]"> plan.</span>
        </h1>
        <p className="text-[15px] mt-4 max-w-md" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
          Start free. Upgrade when you&apos;re ready to go deeper.
        </p>

        {/* Toggle */}
        <div className="flex items-center gap-3 mt-8 p-1 rounded-full" style={{ border: '1px solid var(--c-border)', background: 'var(--c-card)' }}>
          <button onClick={() => setIsYearly(false)}
            className="px-5 py-2 text-sm font-medium rounded-full transition-all"
            style={{ background: !isYearly ? 'var(--c-blue)' : 'transparent', color: !isYearly ? '#fff' : 'var(--c-text)' }}>
            Monthly
          </button>
          <button onClick={() => setIsYearly(true)}
            className="px-5 py-2 text-sm font-medium rounded-full transition-all"
            style={{ background: isYearly ? 'var(--c-blue)' : 'transparent', color: isYearly ? '#fff' : 'var(--c-text)' }}>
            Yearly <span className="text-[11px] opacity-80">(save 17%)</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-[900px] mx-auto px-5 pb-24">
        <div className="grid md:grid-cols-2 gap-6 max-w-[650px] mx-auto">
          {plans.map((plan, i) => (
            <div key={plan.name} onMouseEnter={() => setHoveredPlan(i)} onMouseLeave={() => setHoveredPlan(null)}
              className="rounded-[18px] px-[28px] py-[28px] transition-all duration-200 relative" style={{
                background: 'var(--c-card)',
                border: plan.popular ? '1px solid var(--c-blue)' : '1px solid var(--c-border-card)',
                boxShadow: hoveredPlan === i ? 'var(--c-shadow-hover)' : 'var(--c-shadow)',
                transform: hoveredPlan === i ? 'translateY(-3px)' : 'translateY(0)',
              }}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: 'var(--c-blue)' }}>
                  Most Popular
                </div>
              )}
              <div className="text-[18px] font-bold mb-1" style={{ color: 'var(--c-text)' }}>{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[42px] font-bold tracking-[-1px]" style={{ color: plan.price === '0' ? 'var(--c-muted)' : 'var(--c-text)' }}>
                  ₹{plan.price}{plan.price !== '0' ? <sup className="text-base ml-0.5" style={{ color: 'var(--c-caption)' }}>*</sup> : null}
                </span>
                {plan.price !== '0' && <span className="text-[13px]" style={{ color: 'var(--c-muted)' }}>/{isYearly ? 'year' : 'month'}</span>}
              </div>
              {plan.price !== '0' && (
                <div className="text-[12px] font-medium mb-3 flex items-center gap-1" style={{ color: 'var(--c-green)' }}>
                  FREE for all until 31st July 2026<sup className="text-[8px]" style={{ color: 'var(--c-caption)' }}>*</sup>
                </div>
              )}
              <p className="text-[13px] mb-6" style={{ color: 'var(--c-muted)' }}>{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="text-[13px] flex items-center gap-2" style={{ color: 'var(--c-text-secondary)' }}>
                    <span className="text-[var(--c-blue)]">✓</span> {f}{ASTERISK_FEATURES.has(f) ? <sup className="text-[var(--c-muted)]">*</sup> : null}
                  </li>
                ))}
              </ul>
              {plan.price === '0' && user?.isPro ? (
                <div className="w-full py-3 text-[13px] font-medium rounded-[40px] text-center"
                  style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', color: 'var(--c-caption)', cursor: 'default' }}>
                  N/A
                </div>
              ) : plan.price !== '0' && user?.isPro ? (
                <div className="w-full py-3 text-[13px] font-medium rounded-[40px] text-center"
                  style={{ background: 'var(--c-card)', border: '1px solid var(--c-green)', color: 'var(--c-green)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline mr-1.5 -mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Already Pro
                </div>
              ) : (
                <button onClick={() => handleSubscribe(plan.price)} disabled={loading}
                  className="w-full py-3 text-[13px] font-medium rounded-[40px] text-white text-center transition-all duration-300"
                  style={{
                    background: 'var(--c-btn-primary)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    cursor: loading ? 'default' : 'pointer',
                    opacity: loading ? 0 : 1,
                    transform: loading ? 'translateY(8px)' : 'translateY(0)',
                    pointerEvents: loading ? 'none' : 'auto',
                  }}>
                  {plan.price === '0' && user ? 'Your Current Plan' : loading ? 'Processing...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footnotes */}
      <div className="max-w-[650px] mx-auto px-5 pb-10 text-center">
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--c-caption)' }}>
          <sup>*</sup> 5GB limited as of now &mdash; working to expand.
        </p>
        <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'var(--c-caption)' }}>
          <sup>*</sup> Launching offer &mdash; free for all until 31st July 2026. No payment required.
        </p>
      </div>

      {/* Testimonials */}
      <div className="max-w-[1100px] mx-auto px-5 pb-24" style={{ contentVisibility: 'auto' }}>
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--c-muted)' }}>Testimonials</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            How Pro helps<span className="text-[#888]"> real students</span>
          </h2>
          <p className="text-[14px] mt-4 max-w-md mx-auto" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Hear from JEE aspirants who upgraded their prep with Pro features.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="rounded-[18px] px-[22px] py-[24px] transition-all duration-200" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
            }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--c-tag)', color: 'var(--c-blue)' }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: 'var(--c-text)' }}>{t.name}</div>
                  <div className="text-[11px]" style={{ color: 'var(--c-muted)' }}>{t.role}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, ri) => (
                  <svg key={ri} width="14" height="14" viewBox="0 0 24 24" fill="#eab308"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
                ))}
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-[700px] mx-auto px-5 pb-24" style={{ contentVisibility: 'auto' }}>
        <div className="text-center mb-12">
          <h2 className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-1px]" style={{ color: 'var(--c-text)' }}>Billing FAQs</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your Pro subscription at any time. Your access continues until the end of the billing period.' },
            { q: 'Is there a free trial for Pro?', a: 'The Free plan is always available with no time limit. Upgrade to Pro only when you need the extra features.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets through Razorpay.' },
            { q: 'Can I switch from monthly to yearly?', a: 'Absolutely. You can switch anytime — we\'ll prorate the remaining balance.' },
          ].map((faq, i) => (
            <details key={i} className="rounded-[14px] px-5 py-4 group" style={{ border: '1px solid var(--c-border-card)', background: 'var(--c-card)' }}>
              <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between" style={{ color: 'var(--c-text)' }}>
                {faq.q}
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" style={{ color: 'var(--c-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </summary>
              <p className="text-[13px] mt-3 leading-relaxed" style={{ color: 'var(--c-muted)' }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      <ProActivationPopup show={showProUpgrade} onGoToDashboard={() => { setLoading(false); setShowProUpgrade(false); router.push('/dashboard') }} />
    </div>
  )
}
