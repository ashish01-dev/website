'use client'

import { useEffect, useState, useCallback } from 'react'

const COLORS = ['var(--c-blue)', 'var(--c-green)', 'var(--c-orange)', 'var(--c-red)', '#da3690', '#6940a5', '#f59e0b', 'var(--heat-3)']

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  size: number
  drift: number
}

interface ConfettiOverlayProps {
  fire: boolean
  message?: string
  messageContent?: React.ReactNode
  onDone?: () => void
}

export default function ConfettiOverlay({ fire, message, messageContent, onDone }: ConfettiOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [visible, setVisible] = useState(false)

  const launch = useCallback(() => {
    const p: Particle[] = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 720 - 360,
      size: Math.random() * 6 + 4,
      drift: (Math.random() - 0.5) * 30,
    }))
    setParticles(p)
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!fire) return
    launch()
    const timer = setTimeout(() => {
      setVisible(false)
      setParticles([])
      onDone?.()
    }, 3500)
    return () => clearTimeout(timer)
  }, [fire, launch, onDone])

  if (!visible && !fire) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotation}deg)`,
            '--drift': `${p.drift}px`,
            '--fall': '110vh',
          } as React.CSSProperties}
        />
      ))}
      {messageContent}
      {message && !messageContent && (
        <div className="pointer-events-auto animate-confetti-message bg-notion-bg-dark/80 backdrop-blur-sm border border-notion-border-dark rounded-notion px-6 py-4 shadow-2xl text-center">
          <p className="text-lg font-bold text-notion-text-dark">{message}</p>
        </div>
      )}
    </div>
  )
}
