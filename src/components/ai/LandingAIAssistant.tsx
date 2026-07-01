'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Send, ChevronRight, MessageSquare } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { findAnswer, SUGGESTED_QUESTIONS } from './landing-knowledge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { label: string; href: string }[]
  timestamp: number
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  )
}

function ChatMessage({ message, animate }: { message: Message; animate?: boolean }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'text-white' : ''}`}
        style={{
          background: isUser ? 'var(--c-blue)' : 'var(--c-tag)',
          color: isUser ? '#fff' : 'var(--c-text)',
        }}
      >
        <div style={{ color: 'inherit' }}><MarkdownContent content={message.content} /></div>
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {message.sources.map((s, i) => (
              <a key={i} href={s.href}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{ background: isUser ? 'rgba(255,255,255,0.15)' : 'var(--c-card)', color: isUser ? '#fff' : 'var(--c-blue)' }}
              >{s.label} <ChevronRight size={10} /></a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n').filter(line => line.trim())
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{line.slice(2, -2)}</p>
        }
        const rendered = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--c-blue);text-decoration:underline">$1</a>')
        return <p key={i} className="mb-1.5 last:mb-0" dangerouslySetInnerHTML={{ __html: rendered }} />
      })}
    </>
  )
}

const SUGGESTIONS_CURATED = [
  { q: 'What does this platform offer?', a: `JEEIFY is your all-in-one JEE prep command center. You get:\n\n• **Smart syllabus tracker** — real-time progress per chapter\n• **AI-powered tutoring** (Pro) — doubt-solving, concept teaching, strategy\n• **Timetable planner** — drag-and-drop weekly schedule\n• **Progress analytics** — pace tracking, mock test analysis\n• **Pomodoro timer** — built-in focus sessions\n• **Formula repository** — upload and organize sheets\n• **Cloud sync** — study across devices seamlessly\n\nEverything is built specifically for JEE Main & Advanced.` },
  { q: 'Compare Free vs Pro', a: `**Free Plan** — ₹0/month\nFull syllabus tracker, timetable, Pomodoro, progress dashboard, cloud sync.\n\n**Pro Plan** — ₹50/month (less than a coffee ☕)\nEverything in Free + AI Tutor, advanced analytics, PYQ library, formula repository, revision tools, priority support.\n\n7-day money-back guarantee. No hidden fees. Cancel anytime.` },
  { q: 'How does AI help me?', a: `The **AI Tutor** (Pro feature, ₹50/month) acts as your personal JEE mentor:\n\n• **Ask Doubts** — get step-by-step help on any problem\n• **Explain Concepts** — clear, structured teaching\n• **Solve Numericals** — worked solutions with formula breakdown\n• **Formula Revision** — instant formula sheets per chapter\n• **Quiz & Practice** — AI generates questions at your level\n• **Error Analysis** — the AI analyzes your mistakes\n\nThe AI adapts to your level and remembers your context.` },
  { q: 'What exams are supported?', a: `JEEIFY is purpose-built for **JEE Main** and **JEE Advanced**.\n\nWe cover the complete Physics, Chemistry, and Maths syllabus as per NCERT and the latest JEE pattern.\n\nMore exams coming in the future — let us know what you need at support@jeeify.app.` },
  { q: 'Show pricing', a: `**Free Plan** — ₹0/month\nFull syllabus tracker, timetable, Pomodoro, progress dashboard, cloud sync.\n\n**Pro Plan** — ₹50/month\nEverything in Free + AI Tutor, advanced analytics, PYQ library, formula repository, revision tools, priority support.\n\n7-day money-back guarantee. Cancel anytime.\n\n→ [View full pricing](/pricing)` },
  { q: 'Is there a refund policy?', a: `Yes! We offer a **7-day money-back guarantee** on all Pro subscriptions.\n\nNot satisfied within 7 days? Full refund — no questions asked.\n\nAfter 7 days, cancellations take effect at the end of your current billing cycle.\n\nEmail support@jeeify.app for refunds or cancellations.` },
  { q: 'Can I use on mobile?', a: `Yes! JEEIFY is fully **mobile-responsive**. Works great on phones and tablets through any browser.\n\nAdd to home screen:\n• **iOS**: Safari → Share → Add to Home Screen\n• **Android**: Chrome → Menu → Add to Home Screen\n\nNo native app download needed.` },
  { q: 'How do I contact support?', a: `We're here to help!\n\n• **Email**: support@jeeify.app\n• **Contact Form**: Visit our [Contact page](/contact)\n\nWe respond within 24 hours. Pro subscribers get priority support.` },
  { q: 'What makes JEEIFY different?', a: `What sets JEEIFY apart:\n\n• **AI-First** — AI isn't an add-on, it's woven into every feature\n• **Complete Ecosystem** — tracker, planner, analytics, tutor, all in one place\n• **Privacy-First** — encrypted cloud sync, no ads, no data sharing\n• **Built for JEE** — every feature calibrated for Main & Advanced\n• **Pro at ₹50/month** — less than a coffee for unlimited AI tutoring` },
  { q: 'How to get started?', a: `Getting started takes 30 seconds:\n\n1. **Sign up** — Click "Get Started" or "Sign In"\n2. **Set your target** — Choose JEE and set your exam date\n3. **Track your syllabus** — Mark what you've studied\n4. **Study with AI** — On Pro, use the AI Tutor for doubts and strategy\n\nNo credit card required. Free plan includes full tracker, timetable, and dashboard.` },
]

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hey! I'm **J**, your JEEIFY guide.\n\nAsk me anything about the platform — features, pricing, how to start, or what's available.\n\nWhat can I help you with?`,
  timestamp: Date.now(),
}

const VALID_LANDING_ROUTES = new Set(['/', '/pricing', '/terms', '/privacy', '/contact', '/about', '/ai-policies', '/auth'])

export default function LandingAIAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const is404 = !VALID_LANDING_ROUTES.has(pathname) && !pathname.startsWith('/auth/')

  useEffect(() => {
    if (is404) {
      const t1 = setTimeout(() => setShowHint(true), 1500)
      const t2 = setTimeout(() => setShowHint(false), 10000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [is404])

  useEffect(() => {
    if (isOpen) { setShowHint(false); setTimeout(() => inputRef.current?.focus(), 300) }
  }, [isOpen])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      if (viewport) viewport.scrollTop = viewport.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (!scrollRef.current) return
    const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    if (!viewport) return
  }, [])

  const addMessage = (msg: Message) => setMessages(prev => [...prev, msg])

  const handleSend = (text: string) => {
    const q = text.trim()
    if (!q || isTyping) return
    setInput('')
    addMessage({ id: generateId(), role: 'user', content: q, timestamp: Date.now() })
    setIsTyping(true)

    const lower = q.toLowerCase()

    // Match against curated suggestions
    const match = SUGGESTIONS_CURATED.find(s => q.toLowerCase().includes(s.q.toLowerCase().slice(0, 20)))
    if (match) {
      setTimeout(() => {
        setIsTyping(false)
        addMessage({ id: generateId(), role: 'assistant', content: match.a, timestamp: Date.now() })
      }, 400)
      return
    }

    // Check knowledge base
    const kbResult = findAnswer(q)
    if (kbResult) {
      setTimeout(() => {
        setIsTyping(false)
        addMessage({ id: generateId(), role: 'assistant', content: kbResult.answer, sources: kbResult.sources, timestamp: Date.now() })
      }, 400)
      return
    }

    // Fallback — suggest using predefined questions
    setTimeout(() => {
      setIsTyping(false)
      addMessage({
        id: generateId(), role: 'assistant',
        content: `I can help with questions about JEEIFY! Try one of the quick questions above, or ask about:\n\n• **Features** — What does JEEIFY offer?\n• **Pricing** — Compare Free vs Pro\n• **Getting started** — How to begin\n• **Support** — How to contact us`,
        timestamp: Date.now(),
      })
    }, 400)
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl"
        style={{
          background: 'linear-gradient(135deg, var(--c-blue), #6366f1)',
          padding: '12px 18px',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Sparkles size={16} />
        <span className="text-sm font-medium">Ask J</span>
      </motion.button>

      {/* 404 hint bubble */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 pointer-events-none"
            style={{ bottom: 90, right: 20 }}
          >
            <div className="relative rounded-[14px] px-4 py-2.5 shadow-lg" style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border-card)',
            }}>
              <p className="text-[12px] font-medium whitespace-nowrap" style={{ color: 'var(--c-text)' }}>
                Need help? <span className="text-[var(--c-blue)]">Talk to me!</span>
              </p>
              <div
                className="absolute w-3 h-3 rotate-45"
                style={{
                  bottom: -6, right: 24,
                  background: 'var(--c-card)',
                  borderRight: '1px solid var(--c-border-card)',
                  borderBottom: '1px solid var(--c-border-card)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed flex flex-col overflow-hidden rounded-[20px] shadow-xl"
            style={{
              bottom: 80,
              right: 24,
              width: 'min(92vw, 420px)',
              height: 'min(80vh, 520px)',
              background: 'var(--c-card)',
              border: '1px solid var(--c-border)',
              transformOrigin: 'bottom right',
              boxShadow: '0 16px 64px rgba(0,0,0,0.18)',
              zIndex: 50,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--c-blue), #6366f1)' }}>
                  <Sparkles size={13} color="#fff" />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Ask J</div>
                  <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>JEEIFY guide</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                <X size={15} style={{ color: 'var(--c-muted)' }} />
              </button>
            </div>

            {/* Messages + Quick questions inside scrollable area */}
            <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
              {/* Quick questions at the top — scroll up to reveal */}
              <div className="mb-2 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider pt-2 px-1 pb-1" style={{ color: 'var(--c-muted)' }}>Quick questions</p>
                <div className="space-y-1">
                  {SUGGESTIONS_CURATED.map((item, i) => (
                    <motion.button key={item.q} initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02, duration: 0.2 }}
                      onClick={() => handleSend(item.q)}
                      className="flex items-center gap-2 w-full text-left text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] group"
                      style={{ color: 'var(--c-text-secondary)' }}>
                      <MessageSquare size={13} className="shrink-0" style={{ color: 'var(--c-muted)' }} />
                      <span className="flex-1 truncate">{item.q}</span>
                      <ChevronRight size={13} className="shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" style={{ color: 'var(--c-blue)' }} />
                    </motion.button>
                  ))}
                </div>
              </div>
              {messages.map((msg, i) => (
                <ChatMessage key={msg.id} message={msg} animate={i > 1 || msg.id === 'welcome'} />
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-3">
                  <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--c-tag)' }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="px-4 pb-3 shrink-0">
              <form onSubmit={e => { e.preventDefault(); handleSend(input) }} className="flex items-center gap-2 mb-1.5">
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask J about JEEIFY..." disabled={isTyping}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
                  style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
                />
                <button type="submit" disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                  style={{ background: input.trim() ? 'var(--c-blue)' : 'var(--c-tag)' }}
                >
                  <Send size={15} color={input.trim() ? '#fff' : 'var(--c-muted)'} />
                </button>
              </form>
              <p className="text-[10px] text-center" style={{ color: 'var(--c-caption)' }}>AI can make mistakes. Verify important information.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
