'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'none'
  delay?: number
}

export default function GlassCard({ children, className, hover = true, glow = 'none', delay = 0 }: GlassCardProps) {
  const glowBorder = glow === 'primary' ? 'hover:border-primary/50' :
    glow === 'secondary' ? 'hover:border-secondary/50' :
    glow === 'tertiary' ? 'hover:border-tertiary/50' :
    glow === 'error' ? 'hover:border-status-error/50' : 'hover:border-outline/50'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={cn(
        'bg-surface-card backdrop-blur-xl border border-surface-border rounded-2xl p-card-padding',
        hover && 'transition-all duration-300 hover:scale-[1.02]',
        glowBorder,
        className
      )}
    >
      {children}
    </motion.div>
  )
}
