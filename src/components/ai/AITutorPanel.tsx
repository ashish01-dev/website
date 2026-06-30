'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, ChevronDown, Sparkles, BookOpen, RotateCcw, MessageSquare, GraduationCap, Lock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/useUser'
import { TUTOR_MODES, type TutorMode, type TutorMessage, generateTutorId } from './dashboard-tutor'

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  )
}

interface Conversation { id: string; title: string; messages: TutorMessage[]; mode: TutorMode; subject?: string; chapter?: string; createdAt: number }

const SAMPLE_CONVERSATIONS: Conversation[] = [
  { id: 'sample-1', title: 'Projectile motion doubt', messages: [], mode: 'ask_doubt', subject: 'Physics', chapter: 'Kinematics', createdAt: Date.now() - 3600000 },
  { id: 'sample-2', title: 'Chemical bonding revision', messages: [], mode: 'quick_summary', subject: 'Chemistry', chapter: 'Chemical Bonding', createdAt: Date.now() - 7200000 },
]

function renderContent(content: string) {
  const lines = content.split('\n').filter(line => line.trim())
  return <>
    {lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{line.slice(2, -2)}</p>
      const rendered = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--c-blue);text-decoration:underline">$1</a>').replace(/^[-•]\s+(.*)/gm, '• $1')
      return <p key={i} className="mb-1.5 last:mb-0" dangerouslySetInnerHTML={{ __html: rendered }} />
    })}
  </>
}

const SUGGESTED_TUTOR_QUESTIONS = [
  "Explain Faraday's Law of Electromagnetic Induction",
  'Solve: A projectile is launched at 30° with 20 m/s. Find range.',
  'Give me a formula sheet for Chemical Bonding',
  'What are common mistakes in Kinematics?',
  'Derive the lens formula for a convex lens',
  'Quick summary of Organic Chemistry reactions',
  'Generate a JEE-level quadratic equations problem',
  'How to approach electrochemistry numericals?',
]

const WELCOME_PRO: TutorMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `🎓 **Welcome to your AI Tutor.**\n\nI'm your personal JEE mentor. I can help with:\n• Doubt-solving step by step\n• Concept explanations from basics to advanced\n• Numerical solving with formula breakdown\n• Formula revision and quick summaries\n• Quiz and practice questions\n• Error analysis from mock tests\n\nWhat would you like to work on today?`,
  mode: 'ask_doubt',
  timestamp: Date.now(),
}

export default function AITutorPanel() {
  const { user } = useUser()
  const isPro = user?.isPro ?? false

  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState<TutorMode>('ask_doubt')
  const [messages, setMessages] = useState<TutorMessage[]>([WELCOME_PRO])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showModes, setShowModes] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeModeConfig = TUTOR_MODES.find(m => m.id === activeMode)

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300) }, [isOpen])
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      if (viewport) viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages, isTyping])

  const addMessage = useCallback((msg: TutorMessage) => setMessages(prev => [...prev, msg]), [])

  const handleSend = useCallback((text: string) => {
    const q = text.trim()
    if (!q || isTyping || !isPro) return
    setInput('')
    addMessage({ id: generateTutorId(), role: 'user', content: q, mode: activeMode, timestamp: Date.now() })
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addMessage({
        id: generateTutorId(), role: 'assistant',
        content: `Great question! Here's help with **${q.slice(0, 80)}${q.length > 80 ? '...' : ''}**:\n\n• Retrieving relevant NCERT and JEE content\n• Breaking it down step by step\n• Providing clear explanations with formulas\n• Ready to test your understanding with practice questions\n\n*The full AI pipeline connects to our knowledge base for contextual responses.*`,
        mode: activeMode, timestamp: Date.now(),
      })
    }, 1000 + Math.random() * 500)
  }, [isTyping, isPro, activeMode, addMessage])

  const switchMode = useCallback((mode: TutorMode) => {
    setActiveMode(mode); setShowModes(false)
    const label = TUTOR_MODES.find(m => m.id === mode)?.label || 'Ask'
    addMessage({ id: generateTutorId(), role: 'assistant', content: `Switched to **${label}** mode. What would you like me to help with?`, mode, timestamp: Date.now() })
  }, [addMessage])

  const startNewChat = useCallback(() => {
    setMessages([{ ...WELCOME_PRO, id: 'welcome-' + Date.now() }])
  }, [])

  return (
    <>
      <motion.button onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl"
        style={{ background: 'linear-gradient(135deg, var(--c-blue), #6366f1)', padding: '12px 18px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <GraduationCap size={16} />
        <span className="text-sm font-medium">AI Tutor</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed flex flex-col overflow-hidden rounded-[20px] shadow-xl"
            style={{
              bottom: 80, right: 24,
              width: 'min(92vw, 480px)', height: 'min(80vh, 560px)',
              background: 'var(--c-card)',
              border: '1px solid var(--c-border)',
              transformOrigin: 'bottom right',
              boxShadow: '0 16px 64px rgba(0,0,0,0.18)',
              zIndex: 50,
            }}
          >
            {/* Header */}
            <div className="shrink-0 border-b" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--c-blue), #6366f1)' }}>
                    <GraduationCap size={13} color="#fff" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>AI Tutor</span>
                      {!isPro && <Badge variant="premium">Pro</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowHistory(!showHistory)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors" title="Conversation history">
                    <MessageSquare size={13} style={{ color: 'var(--c-muted)' }} />
                  </button>
                  <button onClick={startNewChat} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors" title="New conversation">
                    <RotateCcw size={13} style={{ color: 'var(--c-muted)' }} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                    <X size={15} style={{ color: 'var(--c-muted)' }} />
                  </button>
                </div>
              </div>
              <div className="relative px-3 pb-3">
                <button onClick={() => setShowModes(!showModes)}
                  className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--c-tag)', color: 'var(--c-text)' }}>
                  <span className="text-[15px]">{activeModeConfig?.icon}</span>
                  <span className="flex-1 text-left font-medium">{activeModeConfig?.label}</span>
                  <ChevronDown size={13} style={{ color: 'var(--c-muted)' }} className={`transition-transform ${showModes ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showModes && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-lg"
                      style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)' }}>
                      {TUTOR_MODES.map(mode => (
                        <button key={mode.id} onClick={() => switchMode(mode.id)}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all ${activeMode === mode.id ? '' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'}`}
                          style={{ color: activeMode === mode.id ? 'var(--c-blue)' : 'var(--c-text-secondary)', background: activeMode === mode.id ? 'rgba(35,131,226,0.06)' : 'transparent' }}>
                          <span className="text-[15px]">{mode.icon}</span>
                          <div className="text-left flex-1"><div className="text-sm font-medium">{mode.label}</div><div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{mode.description}</div></div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Conversation history */}
            {showHistory && (
              <div className="shrink-0 border-b px-3 py-2" style={{ borderColor: 'var(--c-border)' }}>
                <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: 'var(--c-muted)' }}>Recent conversations</div>
                {conversations.map(conv => (
                  <button key={conv.id} onClick={() => {}} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left text-sm transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04]" style={{ color: 'var(--c-text-secondary)' }}>
                    <BookOpen size={13} style={{ color: 'var(--c-muted)' }} />
                    <div className="flex-1 min-w-0"><div className="truncate text-sm">{conv.title}</div><div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{conv.subject} · {conv.chapter}</div></div>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user'
                return (
                  <motion.div key={msg.id} initial={i > 1 ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'text-white' : ''}`}
                      style={{ background: isUser ? 'var(--c-blue)' : 'var(--c-tag)', color: isUser ? '#fff' : 'var(--c-text)' }}>
                      <div style={{ color: 'inherit' }}>{renderContent(msg.content)}</div>
                    </div>
                  </motion.div>
                )
              })}
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-3">
                  <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--c-tag)' }}><TypingDots /></div>
                </motion.div>
              )}
            </ScrollArea>

            {/* Suggested questions inside scroll area when no user messages */}
            {isPro && messages.length <= 1 && (
              <div className="space-y-1 mt-4 pt-3" style={{ borderTop: '1px solid var(--c-border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider px-1 py-1" style={{ color: 'var(--c-muted)' }}>Try asking</p>
                {SUGGESTED_TUTOR_QUESTIONS.map((q, i) => (
                  <motion.button key={q} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.015, duration: 0.15 }}
                    onClick={() => handleSend(q)}
                    className="flex items-center gap-2 w-full text-left text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] group"
                    style={{ color: 'var(--c-text-secondary)' }}>
                    <Sparkles size={13} className="shrink-0" style={{ color: 'var(--c-blue)' }} />
                    <span className="flex-1 truncate">{q}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 shrink-0 border-t" style={{ borderColor: 'var(--c-border)' }}>
              {isPro ? (
                <form onSubmit={e => { e.preventDefault(); handleSend(input) }} className="flex items-center gap-2">
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder={activeModeConfig ? `Ask a ${activeModeConfig.label.toLowerCase()} question...` : 'Type your question...'} disabled={isTyping}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
                    style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
                  <button type="submit" disabled={!input.trim() || isTyping}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                    style={{ background: input.trim() ? 'var(--c-blue)' : 'var(--c-tag)' }}>
                    <Send size={15} color={input.trim() ? '#fff' : 'var(--c-muted)'} />
                  </button>
                </form>
              ) : (
                <div className="rounded-xl px-4 py-3 text-center" style={{ background: 'var(--c-tag)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--c-text-secondary)' }}>
                    <Lock size={13} className="inline mr-1.5" style={{ color: 'var(--c-blue)' }} /> AI Tutor is a Pro feature
                  </p>
                  <a href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
                    style={{ background: 'var(--c-blue)', color: '#fff' }}>Upgrade to Pro</a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
