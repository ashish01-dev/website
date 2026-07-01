'use client'

import { useState } from 'react'
import Link from 'next/link'
import BackButton from '@/components/layout/BackButton'

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return
    const pending = JSON.parse(localStorage.getItem('contact_messages') || '[]')
    pending.push({ email, message, date: new Date().toISOString() })
    localStorage.setItem('contact_messages', JSON.stringify(pending))
    setSent(true)
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      {/* Navbar */}
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg"
              alt="logo"
              style={{ height: 28, filter: 'var(--c-logo-filter)' }}
            />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>
        </div>
        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px] pointer-events-none max-md:left-5 max-md:right-5" style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)',
          backgroundSize: '6px 1px',
        }} />
      </nav>

      {/* Hero */}
      <section className="px-5 pt-20 pb-16 md:pt-28 md:pb-20 max-w-[1100px] mx-auto text-center">
        <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--c-muted)' }}>Get in touch</p>
        <h1 className="text-[clamp(32px,5vw,52px)] font-medium tracking-[-1.5px] mb-4" style={{ color: 'var(--c-text)' }}>
          Let&apos;s build something<br /><span style={{ color: 'var(--c-muted)' }}>great together.</span>
        </h1>
        <p className="text-[14px] mb-10 max-w-md mx-auto" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
          Have a question, feedback, or just want to say hi? We&apos;d love to hear from you.
        </p>

        <div className="max-w-lg mx-auto">
          {sent ? (
            <div className="rounded-[18px] px-[22px] py-[32px]" style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-card)',
              boxShadow: 'var(--c-shadow)',
            }}>
              <div className="text-5xl mb-4">&#9993;</div>
              <h2 className="text-xl font-bold tracking-tight mb-2" style={{ color: 'var(--c-text)' }}>Message Sent!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>We&apos;ll get back to you within 24 hours.</p>
              <Link href="/"
                className="inline-flex items-center gap-2 text-white text-[13px] font-medium rounded-[40px] px-[20px] py-[8px] transition-all duration-200 hover:-translate-y-[1px]"
                style={{ background: 'var(--c-btn-primary)' }}
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="rounded-[18px] px-[26px] py-[28px] text-left" style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-card)',
              boxShadow: 'var(--c-shadow)',
            }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold mb-2 block" style={{ color: 'var(--c-muted)' }}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-colors rounded-[40px]"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
                    placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold mb-2 block" style={{ color: 'var(--c-muted)' }}>Message</label>
                  <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-colors resize-none rounded-[18px]"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
                    placeholder="How can we help?" />
                </div>
                <button type="submit"
                  className="w-full py-3 text-sm font-semibold rounded-[40px] text-white transition-all duration-200 hover:-translate-y-[1px]"
                  style={{ background: 'var(--c-btn-primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)')}
                >
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-lg mx-auto px-5 pb-4">
        <BackButton label="Back to Home" />
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--c-border)] py-12 md:py-16 px-5 max-w-[1100px] mx-auto">
        <div className="text-center text-[12px]" style={{ color: 'var(--c-caption)' }}>
          Made with <span style={{ color: '#E03E3E' }}>&#9829;</span> by Ashish
        </div>
      </footer>
    </div>
  )
}
