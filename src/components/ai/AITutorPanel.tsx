'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, ChevronDown, Sparkles, BookOpen, Brain, RotateCcw, MessageSquare, GraduationCap } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useSettingsStore } from '@/store/settingsStore'
import { useUser } from '@/lib/useUser'
import { TUTOR_MODES, type TutorMode, type TutorMessage, generateTutorId, buildPrompt } from './dashboard-tutor'
import { useProgressStore } from '@/store/progressStore'

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  )
}

interface Conversation {
  id: string
  title: string
  messages: TutorMessage[]
  mode: TutorMode
  subject?: string
  chapter?: string
  createdAt: number
}

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 'sample-1',
    title: 'Projectile motion doubt',
    messages: [],
    mode: 'ask_doubt',
    subject: 'Physics',
    chapter: 'Kinematics',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'sample-2',
    title: 'Chemical bonding revision',
    messages: [],
    mode: 'quick_summary',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    createdAt: Date.now() - 7200000,
  },
]

export default function AITutorPanel() {
  const { settings } = useSettingsStore()
  const user = useUser()
  const progressStore = useProgressStore()
  const isPro = user?.isPro ?? false

  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState<TutorMode>('ask_doubt')
  const [messages, setMessages] = useState<TutorMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: isPro
      ? `🎓 **Welcome to your AI Tutor.**\n\nI'm your personal JEE mentor. I can help with doubts, concepts, numericals, revision, and strategy. What would you like to work on?`
      : `**AI Tutor is a Pro feature.**\n\nUpgrade to unlock unlimited doubt-solving, concept explanations, personalized study plans, and more.\n\n→ [View Pro Plans](/pricing)`,
    mode: 'ask_doubt',
    timestamp: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showModes, setShowModes] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [contextInfo, setContextInfo] = useState<{ subject?: string; chapter?: string }>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentChapter = contextInfo.chapter
  const currentSubject = contextInfo.subject

  const activeModeConfig = TUTOR_MODES.find(m => m.id === activeMode)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const addMessage = useCallback((msg: TutorMessage) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const handleSend = useCallback((text: string) => {
    const q = text.trim()
    if (!q || isTyping || !isPro) return
    setInput('')

    const userMsg: TutorMessage = {
      id: generateTutorId(),
      role: 'user',
      content: q,
      mode: activeMode,
      timestamp: Date.now(),
    }
    addMessage(userMsg)
    setIsTyping(true)

    const prompt = buildPrompt(activeMode, q, {
      subject: contextInfo.subject,
      chapter: contextInfo.chapter,
    })

    setTimeout(() => {
      setIsTyping(false)
      const responseContent = `I've received your question about **${q.slice(0, 60)}${q.length > 60 ? '...' : ''}**. This is a preview of the AI Tutor's response capability.

In production, this would connect to our RAG pipeline that retrieves relevant content from NCERT textbooks, JEE notes, and PYQ solutions to generate a contextual, accurate response.

**What would happen next:**
1. Your query would be embedded and matched against our knowledge base
2. Relevant chunks (NCERT paragraphs, solved examples, formula sheets) would be retrieved
3. The LLM would synthesize a response tailored to your level and the current chapter
4. The response would stream back in real-time with references

**For now, try:**
- Asking a specific Physics doubt
- Requesting a concept explanation
- Asking for formula revision on a chapter
- Generating practice questions

*The full AI pipeline will be connected once the RAG backend service is deployed.*`

      const assistantMsg: TutorMessage = {
        id: generateTutorId(),
        role: 'assistant',
        content: responseContent,
        mode: activeMode,
        sources: currentChapter ? ['NCERT ' + currentSubject || '', 'JEE Notes'] : undefined,
        timestamp: Date.now(),
      }
      addMessage(assistantMsg)
    }, 1000 + Math.random() * 500)
  }, [input, isTyping, isPro, activeMode, contextInfo, addMessage])

  const switchMode = useCallback((mode: TutorMode) => {
    setActiveMode(mode)
    setShowModes(false)
    const modeLabel = TUTOR_MODES.find(m => m.id === mode)?.label || 'Ask'
    addMessage({
      id: generateTutorId(),
      role: 'assistant',
      content: `Switched to **${modeLabel}** mode. What would you like me to help with?`,
      mode,
      timestamp: Date.now(),
    })
  }, [addMessage])

  const startNewChat = useCallback(() => {
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `🎓 **New conversation started.**\n\nPick a mode and ask away. I'm here to help with anything JEE-related.`,
      mode: activeMode,
      timestamp: Date.now(),
    }])
    setActiveConversationId(null)
  }, [activeMode])

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full shadow-lg"
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
        <Brain size={18} />
        <span className="text-sm font-medium whitespace-nowrap">AI Tutor</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setIsOpen(false)}
            />

            {/* Full chat panel */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-40 flex flex-col overflow-hidden"
              style={{
                bottom: 0,
                right: 0,
                width: '100vw',
                maxWidth: 500,
                height: '100dvh',
                maxHeight: '100dvh',
                background: 'var(--c-card)',
                borderLeft: '1px solid var(--c-border)',
                boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
              }}
            >
              {/* Header */}
              <div className="shrink-0 border-b" style={{ borderColor: 'var(--c-border)' }}>
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--c-blue), #6366f1)' }}>
                      <GraduationCap size={14} color="#fff" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>AI Tutor</span>
                        {!isPro && <Badge variant="premium">Pro</Badge>}
                      </div>
                      {currentChapter && (
                        <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>
                          {currentSubject} · {currentChapter}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                      title="Conversation history"
                    >
                      <MessageSquare size={14} style={{ color: 'var(--c-muted)' }} />
                    </button>
                    <button
                      onClick={startNewChat}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                      title="New conversation"
                    >
                      <RotateCcw size={14} style={{ color: 'var(--c-muted)' }} />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <X size={16} style={{ color: 'var(--c-muted)' }} />
                    </button>
                  </div>
                </div>

                {/* Mode selector */}
                <div className="relative px-3 pb-3">
                  <button
                    onClick={() => setShowModes(!showModes)}
                    className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-sm transition-all"
                    style={{
                      background: 'var(--c-tag)',
                      color: 'var(--c-text)',
                    }}
                  >
                    <span className="text-[16px]">{activeModeConfig?.icon}</span>
                    <span className="flex-1 text-left font-medium">{activeModeConfig?.label}</span>
                    <ChevronDown size={14} style={{ color: 'var(--c-muted)' }} className={`transition-transform ${showModes ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showModes && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-lg"
                        style={{
                          background: 'var(--c-card)',
                          border: '1px solid var(--c-border)',
                        }}
                      >
                        {TUTOR_MODES.map(mode => (
                          <button
                            key={mode.id}
                            onClick={() => switchMode(mode.id)}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all ${
                              activeMode === mode.id ? '' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                            }`}
                            style={{
                              color: activeMode === mode.id ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                              background: activeMode === mode.id ? 'rgba(35,131,226,0.06)' : 'transparent',
                            }}
                          >
                            <span className="text-[16px]">{mode.icon}</span>
                            <div className="text-left flex-1">
                              <div className="text-sm font-medium">{mode.label}</div>
                              <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{mode.description}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Conversation history sidebar */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 overflow-hidden border-b"
                    style={{ borderColor: 'var(--c-border)' }}
                  >
                    <div className="px-3 py-2 space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: 'var(--c-muted)' }}>Recent conversations</div>
                      {conversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => {
                            setActiveConversationId(conv.id)
                            setShowHistory(false)
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left text-sm transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                          style={{ color: 'var(--c-text-secondary)' }}
                        >
                          <BookOpen size={14} style={{ color: 'var(--c-muted)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm">{conv.title}</div>
                            <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>
                              {conv.subject} · {conv.chapter}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
                {messages.map((msg, i) => {
                  const isUser = msg.role === 'user'
                  return (
                    <motion.div
                      key={msg.id}
                      initial={i > 0 ? { opacity: 0, y: 12 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser ? 'text-white' : ''
                        }`}
                        style={{
                          background: isUser ? 'var(--c-blue)' : 'var(--c-tag)',
                          color: isUser ? '#fff' : 'var(--c-text)',
                        }}
                      >
                        <div style={{ color: 'inherit' }}>
                          {renderContent(msg.content)}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            {msg.sources.map((s, i) => (
                              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: isUser ? 'rgba(255,255,255,0.15)' : 'var(--c-card)', color: 'var(--c-muted)' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
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
              </ScrollArea>

              {/* Input */}
              <div className="p-4 shrink-0 border-t" style={{ borderColor: 'var(--c-border)' }}>
                {isPro ? (
                  <form
                    onSubmit={e => { e.preventDefault(); handleSend(input) }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder={activeModeConfig ? `Ask a ${activeModeConfig.label.toLowerCase()} question...` : 'Type your question...'}
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
                ) : (
                  <div className="rounded-xl px-4 py-3 text-center" style={{ background: 'var(--c-tag)' }}>
                    <p className="text-sm mb-2" style={{ color: 'var(--c-text-secondary)' }}>
                      <Sparkles size={14} className="inline mr-1.5" style={{ color: 'var(--c-blue)' }} />
                      Upgrade to Pro for unlimited AI tutoring
                    </p>
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
                      style={{ background: 'var(--c-blue)', color: '#fff' }}
                    >
                      View Plans
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function renderContent(content: string) {
  const lines = content.split('\n').filter(line => line.trim())
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{line.slice(2, -2)}</p>
        }
        const rendered = line
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--c-blue);text-decoration:underline">$1</a>')
          .replace(/^[-•]\s+(.*)/gm, '• $1')
        return (
          <p key={i} className="mb-1.5 last:mb-0" dangerouslySetInnerHTML={{ __html: rendered }} />
        )
      })}
    </>
  )
}
