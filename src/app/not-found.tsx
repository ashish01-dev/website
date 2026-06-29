'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NotFound() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ─── Navbar ─── */}
      <nav className="relative max-w-[1100px] mx-auto w-full px-[40px] py-[28px] max-md:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg"
              alt="logo"
              style={{ height: 28, filter: 'brightness(0)' }}
            />
            <span className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: '#111' }}>nexto.</span>
          </Link>

          <div className="hidden md:flex items-center gap-9">
            <Link href="/" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Our Team</Link>
            <Link href="/" className="text-sm font-normal hover:opacity-100 transition-opacity flex items-center gap-1" style={{ opacity: 0.65, color: '#111' }}>
              Solutions <span className="text-xs">▾</span>
            </Link>
            <Link href="/" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>Showcase</Link>
            <Link href="/" className="text-sm font-normal hover:opacity-100 transition-opacity" style={{ opacity: 0.65, color: '#111' }}>News</Link>
          </div>

          <div className="hidden md:block">
            <button
              className="flex items-center gap-2 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110"
              style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)')}
            >
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
              Let&apos;s Connect
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col items-center justify-center w-6 h-6 gap-[5px]"
            style={{ cursor: 'pointer' }}
          >
            <span className={`block h-[2px] w-6 bg-[#111] rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
            <span className={`block h-[2px] w-6 bg-[#111] rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[2px] w-6 bg-[#111] rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-0 left-[40px] right-[40px] h-[1px] max-md:left-5 max-md:right-5 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)',
          backgroundSize: '6px 1px',
        }} />
      </nav>

      {/* ─── Mobile Menu ─── */}
      <div
        className={`fixed inset-0 z-50 bg-white flex flex-col px-10 py-8 transition-transform duration-500 md:hidden`}
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      >
        <div className="flex justify-end mb-16">
          <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center" style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col">
          {['Our Team', 'Solutions', 'Showcase', 'News'].map((label, i) => (
            <Link
              key={label}
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-[38px] font-extrabold tracking-[-1.5px] py-6 border-b border-black/[0.06]"
              style={{ color: '#111' }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="mt-auto">
          <button
            className="flex items-center gap-3 text-white text-[13px] font-medium rounded-[40px] px-[16px] py-[5px]"
            style={{ background: 'linear-gradient(180deg, #2c2c2c 0%, #111111 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' }}
          >
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Let&apos;s Connect
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-5 pb-[30px] pt-5 text-center mx-auto w-full"
        style={{ maxWidth: 700 }}
      >
        <p className="text-[15px] mb-3" style={{ color: 'var(--text-secondary)' }}>Seems you&apos;ve wandered off...</p>

        <div className="relative inline-block mb-[14px]">
          <span
            className="material-symbols-rounded absolute animate-float-slow"
            style={{
              top: -18, left: -24, fontSize: 42,
              background: 'linear-gradient(to bottom, #F7B2FB 50%, #786EF1 80%, #5588FB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
              animationDelay: '0.3s',
            }}
          >
            cloud
          </span>
          <span
            className="material-symbols-rounded absolute animate-float-slow"
            style={{
              bottom: -15, right: 20, fontSize: 32,
              background: 'linear-gradient(to bottom, #F7B2FB 50%, #786EF1 80%, #5588FB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
              animationDelay: '1s',
              animationDuration: '4.5s',
            }}
          >
            favorite
          </span>
          <h1
            className="font-medium leading-[1.08] tracking-[-1.5px]"
            style={{
              fontSize: 'clamp(34px, 5vw, 52px)',
              color: '#0f0f0f',
            }}
          >
            Whoops! Nothing here yet
          </h1>
        </div>

        <p className="text-[14px] leading-[1.7] mb-7" style={{ color: 'var(--text-secondary)', maxWidth: 470 }}>
          Grab a 30-minute{' '}
          <span className="inline-flex items-center text-[12.5px] font-semibold px-[12px] py-[2px] rounded-md" style={{ background: '#E0E2E7' }}>
            chat
          </span>{' '}
          to explore your ideas, scope, and vision. We&apos;ll find common ground, sync and{' '}
          <span className="inline-flex items-center text-[12.5px] font-semibold px-[12px] py-[2px] rounded-md" style={{ background: '#E0E2E7' }}>
            define
          </span>{' '}
          a clear roadmap.
        </p>

        {/* ─── Navigation Cards ─── */}
        <div className="flex flex-col gap-3 w-full mt-auto" style={{ maxWidth: 460 }}>
          {[
            {
              href: '/',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
                  <path d="M9 21V12h6v9" stroke="#fff" strokeWidth="2" fill="#fff" />
                </svg>
              ),
              title: 'Main Page',
              subtitle: 'Back where it all begins...',
            },
            {
              href: '/',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#111" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3.5" fill="#fff" stroke="#fff" strokeWidth="1" />
                </svg>
              ),
              title: 'Showcase',
              subtitle: 'Where we walk the walk',
            },
          ].map((card, i) => (
            <Link
              key={card.title}
              href={card.href}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="flex items-center justify-between rounded-[18px] px-[22px] py-[18px] transition-all duration-200"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: hoveredCard === i ? '0 8px 28px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
                transform: hoveredCard === i ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                  style={{ background: '#eaecf0', transform: hoveredCard === i ? 'scale(1.05)' : 'scale(1)' }}
                >
                  {card.icon}
                </div>
                <div className="text-left">
                  <div className="text-[15px] font-semibold" style={{ color: 'var(--text-main)' }}>{card.title}</div>
                  <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{card.subtitle}</div>
                </div>
              </div>
              <span
                className="text-[21px] transition-transform duration-200"
                style={{ transform: hoveredCard === i ? 'translateX(6px)' : 'translateX(0)' }}
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
