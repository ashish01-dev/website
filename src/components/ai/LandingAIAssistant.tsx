'use client'

import { useState, useRef, useEffect } from 'react'
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
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'text-white'
            : ''
        }`}
        style={{
          background: isUser ? 'var(--c-blue)' : 'var(--c-tag)',
          color: isUser ? '#fff' : 'var(--c-text)',
        }}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert" style={{ color: 'inherit' }}>
          <MarkdownContent content={message.content} />
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {message.sources.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{
                  background: isUser ? 'rgba(255,255,255,0.15)' : 'var(--c-card)',
                  color: isUser ? '#fff' : 'var(--c-blue)',
                }}
              >
                {s.label} <ChevronRight size={10} />
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  const lines = content.split('\n').filter(line => line.trim())
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{line.slice(2, -2)}</p>
        }
        const rendered = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--c-blue);text-decoration:underline">$1</a>')
        return (
          <p key={i} className="mb-1.5 last:mb-0" dangerouslySetInnerHTML={{ __html: rendered }} />
        )
      })}
    </>
  )
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 **Hi there! Welcome to JEEIFY.**

I'm your personal platform guide. I can help you understand what JEEIFY offers, how it works, and which plan fits your needs.

What would you like to know?`,
  timestamp: Date.now(),
}

export default function LandingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg])
  }

  const handleSend = (text: string) => {
    const q = text.trim()
    if (!q || isTyping) return
    setInput('')

    addMessage({ id: generateId(), role: 'user', content: q, timestamp: Date.now() })
    setIsTyping(true)

    const lower = q.toLowerCase()
    const jeeAcademicPatterns = [
      /^(solve|explain|derive|calculate|find|what is|how to|prove|show that).*(physics|chemistry|maths?|mathematics|mechanic|kinematic|thermo|electro|magneti|optics|wave|sound|modern|atom|nuclear|organic|inorganic|physical|algebra|calculus|geometry|trigonometry|vector|matrix|differentiat|integrat|probability)/i,
      /(numerical|problem|question|doubt|equation|formula|concept|chapter|topic|reaction|mechanism).*(class 11|class 12|ncert|jee|iit)/i,
    ]
    const isAcademic = jeeAcademicPatterns.some(p => p.test(lower))

    setTimeout(() => {
      setIsTyping(false)

      if (isAcademic && !lower.includes('what does') && !lower.includes('what is jeeify') && !lower.includes('how does')) {
        addMessage({
          id: generateId(),
          role: 'assistant',
          content: `I'd love to help with that, but I'm here to answer questions about JEEIFY as a platform. For JEE academic questions, **please sign in and head to the dashboard** — the AI Tutor there is built specifically for Physics, Chemistry, and Mathematics and can help you with everything from doubt-solving to exam strategy.`,
          timestamp: Date.now(),
        })
        return
      }

      const result = findAnswer(q)
      if (result) {
        addMessage({
          id: generateId(),
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          timestamp: Date.now(),
        })
      } else {
        addMessage({
          id: generateId(),
          role: 'assistant',
          content: `I'm not sure I have the answer to that yet. Try asking about features, pricing, how to get started, or check our [FAQ](/faq). You can also email **support@jeeify.app** for specific questions.`,
          timestamp: Date.now(),
        })
      }
    }, 800 + Math.random() * 700)
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full shadow-lg transition-shadow duration-200 hover:shadow-xl"
        style={{
          background: 'linear-gradient(135deg, var(--c-blue), #6366f1)',
          padding: '14px 20px',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Sparkles size={18} />
        <span className="text-sm font-medium whitespace-nowrap">Ask AI</span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 md:hidden"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={chatContainerRef}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-50 flex flex-col overflow-hidden"
              style={{
                bottom: 0,
                right: 0,
                width: '100vw',
                height: '100dvh',
                maxWidth: 440,
                maxHeight: '100dvh',
                background: 'var(--c-card)',
                borderLeft: '1px solid var(--c-border)',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b" style={{ borderColor: 'var(--c-border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--c-blue), #6366f1)' }}>
                    <Sparkles size={14} color="#fff" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>JEEIFY Assistant</div>
                    <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Platform guide</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <X size={16} style={{ color: 'var(--c-muted)' }} />
                </button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
                {messages.map((msg, i) => (
                  <ChatMessage key={msg.id} message={msg} animate={i > 0 || msg.id === 'welcome'} />
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start mb-3"
                  >
                    <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--c-tag)' }}>
                      <TypingDots />
                    </div>
                  </motion.div>
                )}

                {/* Starter suggestions (shown only after welcome) */}
                {messages.length === 1 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="mt-2 space-y-1.5"
                  >
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.2 }}
                        onClick={() => handleSend(q)}
                        className="flex items-center gap-2 w-full text-left text-sm px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] group"
                        style={{ color: 'var(--c-text-secondary)' }}
                      >
                        <MessageSquare size={14} className="shrink-0" style={{ color: 'var(--c-muted)' }} />
                        <span className="flex-1">{q}</span>
                        <ChevronRight size={14} className="shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" style={{ color: 'var(--c-blue)' }} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 shrink-0 border-t" style={{ borderColor: 'var(--c-border)' }}>
                <form
                  onSubmit={e => { e.preventDefault(); handleSend(input) }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about JEEIFY..."
                    disabled={isTyping}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'var(--c-input)',
                      border: '1px solid var(--c-border-input)',
                      color: 'var(--c-text)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                    style={{ background: input.trim() ? 'var(--c-blue)' : 'var(--c-tag)' }}
                  >
                    <Send size={16} color={input.trim() ? '#fff' : 'var(--c-muted)'} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
