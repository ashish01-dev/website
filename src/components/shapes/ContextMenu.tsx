'use client'

import { useEffect, useRef } from 'react'

interface MenuItem {
  label: string
  icon?: string
  danger?: boolean
  divider?: boolean
  onClick: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    if (rect.right > window.innerWidth) ref.current.style.left = `${x - rect.width}px`
    if (rect.bottom > window.innerHeight) ref.current.style.top = `${y - rect.height}px`
  }, [x, y])

  return (
    <div
      ref={ref}
      className="fixed z-[9999] rounded-[12px] py-1.5 min-w-[180px] shadow-xl border animate-scale-in"
      style={{
        left: x, top: y,
        background: 'var(--c-card)',
        borderColor: 'var(--c-border-card)',
        boxShadow: 'var(--c-shadow-hover)',
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 mx-2" style={{ borderTop: '1px solid var(--c-border)' }} />
        ) : (
          <button
            key={i}
            onClick={item.onClick}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors"
            style={{ color: item.danger ? 'var(--c-red)' : 'var(--c-text)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-sidebar-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {item.icon && <span className="material-symbols-rounded text-[18px]" style={{ color: 'var(--c-muted)' }}>{item.icon}</span>}
            {item.label}
          </button>
        )
      )}
    </div>
  )
}
