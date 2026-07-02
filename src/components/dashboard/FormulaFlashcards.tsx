'use client'

import { useState, useMemo } from 'react'
import { useProgressStore } from '@/store/progressStore'
import syllabusData from '@/data/syllabus.json'
import type { Subject } from '@/types'

const syllabus = syllabusData as unknown as { physics: { divisions: { chapters: { id: string; name: string }[] }[] }; chemistry: { divisions: { chapters: { id: string; name: string }[] }[] }; maths: { divisions: { chapters: { id: string; name: string }[] }[] } }

const SUBJECTS: { value: Subject; label: string; emoji: string }[] = [
  { value: 'physics', label: 'Physics', emoji: '⚡' },
  { value: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { value: 'maths', label: 'Maths', emoji: '📐' },
]

interface Props {
  onClose: () => void
}

export default function FormulaFlashcards({ onClose }: Props) {
  const [subject, setSubject] = useState<Subject>('physics')
  const [chapterIdx, setChapterIdx] = useState(0)
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const chapters = useMemo(() => {
    const all: { id: string; name: string }[] = []
    const divs = (syllabus as any)[subject].divisions
    for (const d of divs) {
      for (const ch of d.chapters) {
        if (!ch.deleted) all.push({ id: ch.id, name: ch.name })
      }
    }
    return all
  }, [subject])

  const currentChapter = chapters[chapterIdx] || chapters[0]

  const cards = useMemo(() => {
    if (!currentChapter) return [
      { front: 'F = ma', back: 'Newton\'s Second Law of Motion' },
      { front: 'E = mc²', back: 'Mass-Energy Equivalence' },
    ]
    const chName = currentChapter.name.toLowerCase()
    if (chName.includes('kinematics')) return [
      { front: 'v = u + at', back: 'First equation of motion' },
      { front: 's = ut + ½at²', back: 'Second equation of motion' },
      { front: 'v² = u² + 2as', back: 'Third equation of motion' },
    ]
    if (chName.includes('newton') || chName.includes('force')) return [
      { front: 'F = ma', back: 'Newton\'s Second Law' },
      { front: 'F₁₂ = -F₂₁', back: 'Newton\'s Third Law (action-reaction)' },
    ]
    if (chName.includes('thermodynamics')) return [
      { front: 'ΔU = Q - W', back: 'First Law of Thermodynamics' },
      { front: 'ΔS ≥ 0', back: 'Second Law of Thermodynamics' },
    ]
    if (subject === 'physics') return [
      { front: 'W = F·d·cosθ', back: 'Work done by a force' },
      { front: 'KE = ½mv²', back: 'Kinetic Energy' },
      { front: 'PE = mgh', back: 'Potential Energy' },
    ]
    if (subject === 'chemistry') return [
      { front: 'PV = nRT', back: 'Ideal Gas Equation' },
      { front: 'ΔG = ΔH - TΔS', back: 'Gibbs Free Energy' },
    ]
    return [
      { front: 'd/dx(xⁿ) = nxⁿ⁻¹', back: 'Power rule of differentiation' },
      { front: '∫xⁿdx = xⁿ⁺¹/(n+1) + C', back: 'Power rule of integration' },
    ]
  }, [currentChapter, subject])

  const currentCard = cards[cardIdx] || cards[0]

  const nextCard = () => {
    if (cardIdx < cards.length - 1) {
      setCardIdx(cardIdx + 1)
    } else if (chapterIdx < chapters.length - 1) {
      setChapterIdx(chapterIdx + 1)
      setCardIdx(0)
    }
    setFlipped(false)
  }

  const prevCard = () => {
    if (cardIdx > 0) {
      setCardIdx(cardIdx - 1)
    } else if (chapterIdx > 0) {
      setChapterIdx(chapterIdx - 1)
      const prevCh = chapters[chapterIdx - 1]
      const prevCards = []
      setCardIdx(0)
    }
    setFlipped(false)
  }

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-sm mx-4 rounded-[18px] px-[26px] py-[28px]" style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>📄 Formula Flashcards</h2>
          <button onClick={onClose} className="text-[18px] leading-none" style={{ color: 'var(--c-muted)' }}>✕</button>
        </div>

        <div className="flex gap-1.5 mb-4">
          {SUBJECTS.map(s => (
            <button key={s.value} onClick={() => { setSubject(s.value); setChapterIdx(0); setCardIdx(0); setFlipped(false) }}
              className={`flex-1 text-[10px] font-medium py-1.5 rounded-[40px] transition-all`}
              style={{
                background: subject === s.value ? 'var(--c-blue)' : 'var(--c-tag)',
                color: subject === s.value ? '#fff' : 'var(--c-muted)',
              }}
            >{s.emoji} {s.label}</button>
          ))}
        </div>

        <div className="text-[10px] mb-3 text-center" style={{ color: 'var(--c-caption)' }}>
          {currentChapter?.name || 'General'} · Card {cardIdx + 1}/{cards.length}
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          className="rounded-[18px] p-6 min-h-[180px] flex items-center justify-center cursor-pointer select-none transition-all hover:scale-[1.02]"
          style={{
            background: 'var(--c-card-alt)',
            border: '1px solid var(--c-border)',
          }}
        >
          <div className="text-center">
            <div className="text-[11px] font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>
              {flipped ? 'Definition' : 'Formula'}
            </div>
            <div className="text-xl font-semibold leading-snug" style={{ color: 'var(--c-text)' }}>
              {flipped ? currentCard.back : currentCard.front}
            </div>
            <div className="text-[10px] mt-4" style={{ color: 'var(--c-muted)' }}>
              Tap to {flipped ? 'show formula' : 'show definition'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4">
          <button onClick={prevCard}
            className="flex-1 text-xs font-medium px-3 py-2 rounded-[40px] transition-all"
            style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
          >← Prev</button>
          <button onClick={() => setFlipped(!flipped)}
            className="flex-1 text-xs font-medium px-3 py-2 rounded-[40px] transition-all text-white"
            style={{ background: 'var(--c-blue)' }}
          >Flip</button>
          <button onClick={nextCard}
            className="flex-1 text-xs font-medium px-3 py-2 rounded-[40px] transition-all"
            style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
          >Next →</button>
        </div>
      </div>
    </div>
  )
}
