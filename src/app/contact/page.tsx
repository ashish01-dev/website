'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()
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
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button onClick={() => router.back()} className="text-white/40 hover:text-white text-sm mb-8 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        {sent ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">&#9993;</div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Message Sent!</h1>
            <p className="text-sm text-white/40 mb-6 tracking-tight">We&apos;ll get back to you within 24 hours.</p>
            <button onClick={() => router.push('/')} className="text-sm font-semibold px-6 py-3 bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all tracking-tight">Back to Home</button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Contact Us</h1>
            <p className="text-sm text-white/40 mb-8 tracking-tight">Have a question or feedback? We&apos;d love to hear from you.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2 block">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 outline-none focus:border-[#2383e2] transition-colors tracking-tight" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2 block">Message</label>
                <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 outline-none focus:border-[#2383e2] transition-colors tracking-tight resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" className="w-full py-3 text-sm font-semibold bg-[#2383e2] hover:bg-[#2383e2]/90 text-white transition-all tracking-tight">Send Message</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
