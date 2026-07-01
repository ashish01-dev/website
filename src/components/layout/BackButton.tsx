'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({ label = 'Back' }: { label?: string }) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <button onClick={handleBack}
      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-[40px] transition-all duration-200 hover:-translate-y-[0.5px]"
      style={{ color: 'var(--c-text-secondary)', background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
      &larr; {label}
    </button>
  )
}
