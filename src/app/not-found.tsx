'use client'

import { useState } from 'react'
import Link from 'next/link'
import LandingNav from '@/components/layout/LandingNav'

export default function NotFound() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <LandingNav />

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-[30px] pt-16 md:pt-20 text-center mx-auto w-full" style={{ maxWidth: 700 }}>
        <div className="relative inline-block mb-6">
          <h1 className="text-[clamp(72px,12vw,120px)] font-bold tracking-[-3px] leading-none" style={{ color: 'var(--c-text)' }}>
            404
          </h1>
          <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full" style={{ background: 'var(--c-blue)', filter: 'blur(12px)', opacity: 0.6 }} />
          <div className="absolute -bottom-2 -left-4 w-4 h-4 rounded-full" style={{ background: 'var(--c-orange)', filter: 'blur(10px)', opacity: 0.5 }} />
        </div>

        <p className="text-[15px] mb-2 font-medium" style={{ color: 'var(--c-text)' }}>Page not found</p>
        <p className="text-[13px] mb-8" style={{ color: 'var(--c-muted)', maxWidth: 400 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Navigation Cards */}
        <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 420 }}>
          {[
            {
              href: '/',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
                  <path d="M9 21V12h6v9" stroke="var(--c-card)" strokeWidth="2" fill="currentColor" />
                </svg>
              ),
              title: 'Go Home',
              subtitle: 'Back to the main page',
            },
            {
              href: '/dashboard',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ),
              title: 'Dashboard',
              subtitle: 'Continue your JEE prep',
            },
          ].map((card, i) => (
            <Link
              key={card.title}
              href={card.href}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="flex items-center justify-between rounded-[18px] px-[22px] py-[18px] transition-all duration-200"
              style={{
                background: 'var(--c-card)',
                border: '1px solid var(--c-border-card)',
                boxShadow: hoveredCard === i ? 'var(--c-shadow-hover)' : 'var(--c-shadow)',
                transform: hoveredCard === i ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                  style={{ background: 'var(--c-tag)', transform: hoveredCard === i ? 'scale(1.05)' : 'scale(1)', color: 'var(--c-text)' }}
                >
                  {card.icon}
                </div>
                <div className="text-left">
                  <div className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>{card.title}</div>
                  <div className="text-[12px]" style={{ color: 'var(--c-muted)' }}>{card.subtitle}</div>
                </div>
              </div>
              <span
                className="text-[21px] transition-transform duration-200"
                style={{ transform: hoveredCard === i ? 'translateX(6px)' : 'translateX(0)', color: 'var(--c-muted)' }}
              >
                &rsaquo;
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
