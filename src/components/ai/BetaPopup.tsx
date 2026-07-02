'use client'

import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

export default function BetaPopup({ onAcknowledge, onClose }: { onAcknowledge: () => void; onClose?: () => void }) {
  const handleClose = onClose || onAcknowledge
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 rounded-[18px] p-6 w-full relative"
        style={{
          maxWidth: 400,
          background: 'var(--c-card)',
          border: '1px solid var(--c-border-card)',
          boxShadow: 'var(--c-shadow-hover)',
        }}
      >
        <button onClick={handleClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
          style={{ color: 'var(--c-muted)' }}>
          <X size={15} />
        </button>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--c-blue), #6366f1)' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <h3 className="text-base font-bold" style={{ color: 'var(--c-text)' }}>AI Assistant is still in Beta</h3>
        </div>

        <p className="text-[13px] mb-4 leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
          Thanks for being an early adopter! Here&apos;s what to know:
        </p>

        <ul className="space-y-2.5 mb-5">
          {[
            'Recommendations are based on your study data and may not always be perfect.',
            'AI responses use third-party models and may occasionally be inaccurate.',
            'New features and improvements are being added regularly.',
            'Your feedback helps us make the AI better — share it anytime.',
            'Data from your AI interactions is used only to improve your experience.',
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              <span className="w-1.5 h-1.5 rounded-full mt-[6px] flex-shrink-0" style={{ background: 'var(--c-blue)' }} />
              {point}
            </li>
          ))}
        </ul>

        <button onClick={onAcknowledge}
          className="w-full py-2.5 text-sm font-semibold rounded-[40px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'var(--c-btn-primary)' }}>
          I Understand
        </button>
      </motion.div>
    </motion.div>
  )
}
