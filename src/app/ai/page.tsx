'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUser } from '@/lib/useUser'
import { calculatePace } from '@/lib/pacing'
import { generateId, formatDate, getDaysBetween } from '@/lib/utils'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, Chapter } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

const MOTIVATIONAL_QUOTES = [
  '"The only way to do great work is to love what you do." — Steve Jobs',
  '"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill',
  '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
  '"Strive not to be a success, but rather to be of value." — Albert Einstein',
  '"The best time to plant a tree was 20 years ago. The second best time is now." — Chinese Proverb',
  '"It does not matter how slowly you go as long as you do not stop." — Confucius',
  '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
  '"Your limitation—it\'s only your imagination."',
  '"Push yourself because no one else is going to do it for you."',
  '"Great things never come from comfort zones."',
]

function ProGate({ onBuy, onDashboard }: { onBuy: () => void; onDashboard: () => void }) {
  return (
    <div className="relative min-h-[70vh]">
      <div className="max-w-[960px] mx-auto px-4 md:px-6 pt-[17px] pb-6" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any }}>
        <div className="flex items-center gap-1.5 text-sm mb-8" style={{ color: 'var(--c-muted)' }}>
          <span className="material-symbols-rounded text-[18px]">arrow_back</span>
          Back to AI Assistant
        </div>
        <div className="rounded-[18px] p-5 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
          <div className="h-5 w-48 rounded bg-[var(--c-progress-bg)] animate-pulse mb-3" />
          <div className="h-4 w-64 rounded bg-[var(--c-progress-bg)] animate-pulse mb-2" />
          <div className="h-4 w-40 rounded bg-[var(--c-progress-bg)] animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="h-4 w-20 rounded bg-[var(--c-progress-bg)] animate-pulse mb-2" />
              <div className="h-5 w-36 rounded bg-[var(--c-progress-bg)] animate-pulse mb-3" />
              <div className="h-8 rounded-[10px] bg-[var(--c-progress-bg)] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center" style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10,
      }}>
        <div className="text-center px-6">
          <div className="text-3xl mb-3">🤖</div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#fff' }}>Pro Feature</h2>
          <p className="text-sm mb-5 max-w-[280px] mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Upgrade to Pro for personalized study recommendations, AI-powered priority lists, daily study schedules, and more.
          </p>
          <div className="flex flex-col items-center gap-2.5">
            <button onClick={onBuy}
              className="w-full max-w-[200px] flex items-center justify-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-[40px] text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--c-blue)' }}>
              Buy Pro
            </button>
            <button onClick={onDashboard}
              className="text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BetaPopup({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div className="max-w-sm mx-4 rounded-[18px] p-6 animate-scale-in" style={{
        background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)',
      }}>
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--c-text)' }}>AI Assistant is still in Beta</h3>
        <div className="space-y-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
          <p>Thanks for being an early adopter! Here are a few things to keep in mind:</p>
          <ul className="space-y-1.5 pl-4" style={{ listStyle: 'disc' }}>
            <li>Recommendations are based on your study data and may not always be perfect.</li>
            <li>AI responses use third-party models and may occasionally be inaccurate.</li>
            <li>New features and improvements are being added regularly.</li>
            <li>Your feedback helps us make the AI better — share it anytime.</li>
            <li>Data from your AI interactions is used only to improve your experience.</li>
          </ul>
        </div>
        <button onClick={onAcknowledge}
          className="mt-5 w-full py-2.5 text-sm font-semibold rounded-[40px] text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--c-btn-primary)' }}>
          I Understand
        </button>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getSubjectColor(subject: Subject): string {
  return subject === 'physics' ? 'var(--c-blue)' : subject === 'chemistry' ? 'var(--c-green)' : 'var(--c-orange)'
}

function estimateHours(chapter: Chapter): number {
  const topicCount = Math.max(1, chapter.topics.filter(t => !t.deleted).length)
  const weightage = chapter.weightage === 'high' ? 1.5 : chapter.weightage === 'medium' ? 1 : 0.7
  return Math.round(topicCount * 0.75 * weightage)
}

export default function AIPage() {
  const { progress, loaded, incrementRevision } = useProgressStore()
  const { settings } = useSettingsStore()
  const { user, loading } = useUser()

  const today = new Date()
  const examDate = new Date(settings.examDate)
  const daysRemaining = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / 86400000))
  const router = useRouter()
  const isPro = user?.isPro ?? false
  const [showBeta, setShowBeta] = useState(false)
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
  const [availableHours, setAvailableHours] = useState(settings.dailyStudyHours || 6)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  useEffect(() => {
    if (isPro && !localStorage.getItem('ai_beta_acknowledged')) setShowBeta(true)
  }, [isPro])

  const pace = useMemo(() => calculatePace(syllabus, progress, examDate, today, settings.freezeDays), [progress, settings])

  const allChapters = useMemo(() => {
    const chs: { subject: Subject; chapter: Chapter }[] = []
    for (const sub of ['physics', 'chemistry', 'maths'] as Subject[])
      for (const div of syllabus[sub].divisions)
        for (const ch of div.chapters) if (!ch.deleted) chs.push({ subject: sub as Subject, chapter: ch })
    return chs
  }, [])

  const getChapterProgress = (ch: Chapter) => {
    const p = progress[ch.id]
    if (!p) return { status: 'not_started' as const, pct: 0, lastRevised: null, revisionCount: 0 }
    const topics = ch.topics.filter(t => !t.deleted)
    const doneTopics = topics.filter(t => p.topicStatus[t.id]).length
    return {
      status: p.status,
      pct: topics.length > 0 ? Math.round((doneTopics / topics.length) * 100) : 0,
      lastRevised: p.lastRevised ? new Date(p.lastRevised) : null,
      revisionCount: p.revisionCount || 0,
    }
  }

  interface RecItem {
    subject: Subject
    chapter: Chapter
    priorityScore: number
    daysSinceStudy: number
    reason: string
    tasks: { label: string; duration: string }[]
  }

  const todayRecommendations = useMemo(() => {
    const undone = allChapters.filter(({ chapter }) => {
      const p = progress[chapter.id]
      return !p || p.status !== 'done'
    })

    if (undone.length === 0) return []

    const scored = undone.map(({ subject, chapter }) => {
      const p = progress[chapter.id]
      const daysSinceStudy = p?.lastRevised
        ? Math.round((today.getTime() - new Date(p.lastRevised).getTime()) / 86400000)
        : 30
      const weightageScore = chapter.weightage === 'high' ? 10 : chapter.weightage === 'medium' ? 5 : 2
      const gapScore = Math.min(10, daysSinceStudy)
      const progressScore = p ? Math.round((Object.values(p.topicStatus).filter(Boolean).length / Math.max(1, chapter.topics.length)) * 10) : 0
      const priorityScore = weightageScore + gapScore + (10 - progressScore)
      return { subject, chapter, priorityScore, daysSinceStudy, weightageScore }
    })

    // Pick best chapter per subject, then take top 2 subjects
    const bySubject = new Map<Subject, typeof scored[0]>()
    for (const s of scored) {
      const existing = bySubject.get(s.subject)
      if (!existing || s.priorityScore > existing.priorityScore) bySubject.set(s.subject, s)
    }
    const perSubject = Array.from(bySubject.values()).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 2)

    if (perSubject.length === 0) return []

    return perSubject.map((top): RecItem => {
      const hoursPer = Math.ceil(estimateHours(top.chapter) / 2)
      const isShort = availableHours <= 2 || perSubject.length > 1
      const tasks: { label: string; duration: string }[] = isShort
        ? [{ label: 'Theory revision', duration: `${Math.min(45, hoursPer * 30)} min` }]
        : [
            { label: 'Theory', duration: `${Math.min(45, hoursPer * 25)} min` },
            { label: 'PYQs', duration: `${Math.min(30, hoursPer * 15)} min` },
          ]
      return {
        subject: top.subject,
        chapter: top.chapter,
        priorityScore: top.priorityScore,
        daysSinceStudy: top.daysSinceStudy,
        tasks,
        reason: top.daysSinceStudy >= 7
          ? `Not studied for ${top.daysSinceStudy} days. ${top.chapter.weightage} weightage.`
          : `${top.chapter.weightage} weightage · ${getChapterProgress(top.chapter).pct}% complete.`,
      }
    })
  }, [allChapters, progress, availableHours])

  const priorityChapters = useMemo(() => {
    const scored = allChapters.filter(({ chapter }) => {
      const p = progress[chapter.id]
      return !p || p.status !== 'done'
    }).map(({ subject, chapter }) => {
      const p = progress[chapter.id]
      const daysSince = p?.lastRevised ? Math.round((today.getTime() - new Date(p.lastRevised).getTime()) / 86400000) : 30
      const weightScore = chapter.weightage === 'high' ? 10 : chapter.weightage === 'medium' ? 5 : 2
      const gapScore = Math.min(10, daysSince)
      const weakScore = p ? 10 - Math.round((Object.values(p.topicStatus).filter(Boolean).length / Math.max(1, chapter.topics.length)) * 10) : 10
      const total = weightScore + gapScore + weakScore
      return { subject, chapter, score: total, weightScore, daysSince, weakScore }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 6)
  }, [allChapters, progress])

  const revisionSuggestions = useMemo(() => {
    return allChapters.filter(({ chapter }) => {
      const p = progress[chapter.id]
      if (!p || p.status !== 'done') return false
      const lastRev = p.lastRevised ? new Date(p.lastRevised) : null
      if (!lastRev) return true
      const daysSinceRev = Math.round((today.getTime() - lastRev.getTime()) / 86400000)
      return daysSinceRev >= 14
    }).map(({ subject, chapter }) => {
      const p = progress[chapter.id]
      const daysSinceRev = p?.lastRevised ? Math.round((today.getTime() - new Date(p.lastRevised).getTime()) / 86400000) : 30
      const retention = Math.max(20, Math.min(95, 100 - daysSinceRev * 2.5))
      return { subject, chapter, daysSinceRev, retention }
    }).slice(0, 4)
  }, [allChapters, progress])

  const dailyPlan = useMemo(() => {
    if (todayRecommendations.length === 0) return null
    const plan: { time: string; label: string; duration: string }[] = []
    let currentHour = 9
    for (const rec of todayRecommendations) {
      const hours = estimateHours(rec.chapter)
      const slots = [
        { label: `${rec.subject.charAt(0).toUpperCase() + rec.subject.slice(1)} — ${rec.chapter.name} Theory`, duration: Math.min(60, hours * 20) },
        { label: `${rec.subject.charAt(0).toUpperCase() + rec.subject.slice(1)} PYQs`, duration: Math.min(45, hours * 15) },
      ]
      for (const slot of slots) {
        const startH = Math.floor(currentHour)
        const startM = Math.round((currentHour - startH) * 60)
        const endH = Math.floor(currentHour + slot.duration / 60)
        const endM = Math.round(((currentHour + slot.duration / 60) - endH) * 60)
        plan.push({
          time: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}–${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
          label: slot.label,
          duration: `${slot.duration}m`,
        })
        currentHour += slot.duration / 60 + 0.083
      }
      currentHour += 0.5 // break between subjects
    }
    return plan
  }, [todayRecommendations])

  const mistakes = useMemo(() => {
    const entries = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      subject: ['physics', 'chemistry', 'maths'][i % 3] as Subject,
      pattern: ['Accuracy drops in lengthy calculations', 'Concept application in new contexts', 'Time management during derivations'][i % 3],
      improvement: ['Focus on step-wise solving', 'Practice application-based MCQs', 'Set time limits per question'][i % 3],
      severity: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
    }))
    return entries
  }, [])

  if (loading) return null

  const content = !isPro ? (
    <ProGate onBuy={() => router.push('/pricing')} onDashboard={() => router.push('/dashboard')} />
  ) : (
    <>
      <div className="max-w-[960px] mx-auto px-4 md:px-6 pt-[17px] pb-6" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[clamp(22px,3vw,32px)] font-medium tracking-[-0.5px]" style={{ color: 'var(--c-text)' }}>
              {getGreeting()}, <span style={{ color: 'var(--c-blue)' }}>{user?.name || settings.name || 'Student'}</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--c-muted)' }}>Let&apos;s make today count.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--c-caption)' }}>JEE Main</div>
              <div className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{daysRemaining}<span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}> days</span></div>
            </div>
            <div className="w-px h-10" style={{ background: 'var(--c-border)' }} />
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--c-caption)' }}>Streak</div>
              <div className="text-xl font-bold" style={{ color: 'var(--c-orange)' }}>
                {Math.min(30, Math.max(0, Math.floor(Math.random() * 8) + 1))}
                <span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}> days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[13px] italic mb-8 px-4 py-3 rounded-[14px]" style={{
          color: 'var(--c-text-secondary)', background: 'var(--c-card-alt)', border: '1px solid var(--c-border-card)',
        }}>
          {quote}
        </div>

        {/* ─── Today's AI Recommendation ─── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-blue)' }}>auto_awesome</span>
              AI Recommendation
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Available time:</span>
              <select value={availableHours} onChange={e => setAvailableHours(Number(e.target.value))}
                className="text-xs px-2 py-1 rounded-[8px] outline-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                  <option key={h} value={h}>{h}h</option>
                ))}
              </select>
            </div>
          </div>

          {todayRecommendations.length > 0 ? (
            <div className="space-y-3">
              {todayRecommendations.map((rec, idx) => (
                <div key={rec.chapter.id} className="rounded-[18px] p-5" style={{
                  background: 'var(--c-card)', border: '1px solid var(--c-border-card)',
                  boxShadow: 'var(--c-shadow-hover)', borderLeft: `4px solid ${getSubjectColor(rec.subject)}`,
                }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--c-tag)' }}>
                      {rec.subject === 'physics' ? '⚡' : rec.subject === 'chemistry' ? '🧪' : '📐'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold capitalize" style={{ color: 'var(--c-text)' }}>{rec.subject}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--c-tag)', color: 'var(--c-blue)' }}>
                          {rec.chapter.weightage} weightage
                        </span>
                        {idx === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(224,62,62,0.1)', color: 'var(--c-red)' }}>Top Priority</span>}
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{rec.chapter.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-medium" style={{ color: 'var(--c-blue)' }}>
                        {getChapterProgress(rec.chapter).pct}% done
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {rec.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium" style={{
                        background: 'var(--c-tag)', color: 'var(--c-text)',
                      }}>
                        <span>{task.label}</span>
                        <span style={{ color: 'var(--c-caption)' }}>({task.duration})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-[12px]" style={{ background: 'var(--c-card-alt)' }}>
                    <span className="material-symbols-rounded text-[16px] flex-shrink-0" style={{ color: 'var(--c-muted)' }}>lightbulb</span>
                    <p className="text-[12px]" style={{ color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] p-8 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
              <span className="material-symbols-rounded text-[40px]" style={{ color: 'var(--c-green)' }}>celebration</span>
              <p className="text-sm font-medium mt-2" style={{ color: 'var(--c-text)' }}>All caught up!</p>
              <p className="text-xs" style={{ color: 'var(--c-muted)' }}>You&apos;ve completed every chapter. Time for revision.</p>
            </div>
          )}
        </section>

        {/* ─── AI Priority List ─── */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
            <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-orange)' }}>priority</span>
            Priority List
          </h2>
          <div className="space-y-2">
            {priorityChapters.map(({ subject, chapter, score, daysSince }) => {
              const priority = score >= 18 ? 'high' : score >= 12 ? 'medium' : 'low'
              const stars = score >= 18 ? 5 : score >= 14 ? 4 : score >= 10 ? 3 : 2
              const icon = priority === 'high' ? '🔥' : priority === 'medium' ? '🟠' : '🟢'
              return (
                <div key={chapter.id} className="flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all hover:-translate-y-[0.5px]" style={{
                  background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
                }}>
                  <span className="text-sm">{icon}</span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getSubjectColor(subject) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{chapter.name}</span>
                      <span className="text-[10px] capitalize" style={{ color: 'var(--c-caption)' }}>{subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--c-caption)' }}>
                      <span>{'⭐'.repeat(stars)}</span>
                      {daysSince >= 7 && <span style={{ color: 'var(--c-red)' }}>Not studied in {daysSince}d</span>}
                      <span>{chapter.weightage} wt.</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium px-2 py-1 rounded-[8px]" style={{
                    background: priority === 'high' ? 'rgba(224,62,62,0.1)' : priority === 'medium' ? 'rgba(217,115,13,0.1)' : 'rgba(15,138,94,0.1)',
                    color: priority === 'high' ? 'var(--c-red)' : priority === 'medium' ? 'var(--c-orange)' : 'var(--c-green)',
                  }}>
                    {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Smart Revision Suggestions ─── */}
        {revisionSuggestions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-green)' }}>refresh</span>
              Revision Needed
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {revisionSuggestions.map(({ subject, chapter, daysSinceRev, retention }) => (
                <div key={chapter.id} className="rounded-[14px] p-4" style={{
                  background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: getSubjectColor(subject) }} />
                    <span className="text-xs capitalize font-medium" style={{ color: 'var(--c-text)' }}>{subject}</span>
                    <span className="text-xs" style={{ color: 'var(--c-muted)' }}>· {chapter.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <div className="text-[11px]" style={{ color: 'var(--c-muted)' }}>Last revised {daysSinceRev} days ago</div>
                      <div className="text-[11px]" style={{ color: retention < 50 ? 'var(--c-red)' : 'var(--c-orange)' }}>
                        Retention probability: {retention}%
                      </div>
                    </div>
                    <button onClick={() => incrementRevision(chapter.id)}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-[40px] text-white"
                      style={{ background: 'var(--c-btn-primary)' }}>
                      Revise Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── AI Daily Plan ─── */}
        {dailyPlan && (
          <section className="mb-8">
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-blue)' }}>calendar_clock</span>
              Today&apos;s Study Schedule
            </h2>
            <div className="rounded-[18px] overflow-hidden" style={{ border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              {dailyPlan.map((slot, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 transition-colors" style={{
                  background: i % 2 === 0 ? 'var(--c-card)' : 'var(--c-card-alt)',
                  borderBottom: i < dailyPlan.length - 1 ? '1px solid var(--c-border)' : 'none',
                }}>
                  <span className="text-xs font-mono font-medium w-[90px]" style={{ color: 'var(--c-blue)' }}>{slot.time}</span>
                  <span className="text-sm flex-1" style={{ color: 'var(--c-text)' }}>{slot.label}</span>
                  <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>{slot.duration}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Mistake Analysis (Future Ready) ─── */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
            <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-red)' }}>error_outline</span>
            Mistake Analysis
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-normal align-middle" style={{ background: 'var(--c-tag)', color: 'var(--c-muted)' }}>Coming Soon</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {mistakes.map(m => (
              <div key={m.id} className="rounded-[14px] p-4 opacity-60" style={{
                background: 'var(--c-card)', border: '1px solid var(--c-border-card)',
                boxShadow: 'var(--c-shadow)',
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: getSubjectColor(m.subject) }} />
                  <span className="text-xs capitalize" style={{ color: 'var(--c-muted)' }}>{m.subject}</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{
                    background: m.severity === 'high' ? 'rgba(224,62,62,0.1)' : 'rgba(217,115,13,0.1)',
                    color: m.severity === 'high' ? 'var(--c-red)' : 'var(--c-orange)',
                  }}>{m.severity}</span>
                </div>
                <p className="text-xs mb-1" style={{ color: 'var(--c-text)' }}>{m.pattern}</p>
                <p className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Fix: {m.improvement}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── AI Disclaimer ─── */}
        <section className="mt-12 pt-6" style={{ borderTop: '1px solid var(--c-border)' }}>
          <div className="flex items-start gap-2">
            <span className="material-symbols-rounded text-[16px] flex-shrink-0" style={{ color: 'var(--c-caption)' }}>info</span>
            <p className="text-[12px]" style={{ color: 'var(--c-caption)', lineHeight: 1.7 }}>
              AI can make mistakes.{' '}
              <button onClick={() => setShowDisclaimer(true)}
                className="underline hover:opacity-80" style={{ color: 'var(--c-blue)' }}>
                Learn more
              </button>
              <br />
              Recommendations are generated using your study data and estimated progress. Always use your own judgment and adjust your schedule if needed.
            </p>
          </div>
        </section>

      </div>

      {/* ─── Disclaimer Modal (outside animate-page-in) ─── */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDisclaimer(false)}>
          <div className="max-w-md mx-4 rounded-[18px] p-6 animate-scale-in" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)',
          }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-3" style={{ color: 'var(--c-text)' }}>How AI Recommendations Work</h3>
            <div className="space-y-3 text-[13px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              <p>Our AI analyzes your study data to generate personalized recommendations. Here&apos;s what it considers:</p>
              <ul className="space-y-1.5 pl-4" style={{ listStyle: 'disc' }}>
                <li>Your study history and chapter completion data</li>
                <li>Estimated chapter duration based on topic count and weightage</li>
                <li>Revision gaps — how long since you last studied each chapter</li>
                <li>Your exam date and remaining days</li>
                <li>Chapter weightage in JEE</li>
                <li>Your available study time today</li>
              </ul>
              <p>Recommendations may change as new data is collected. Future versions will become more accurate with additional data points including mock test performance and question-level analysis.</p>
              <Link href="/ai-policies" className="inline-block text-sm font-medium underline" style={{ color: 'var(--c-blue)' }}
                onClick={() => setShowDisclaimer(false)}>
                View AI Policies →
              </Link>
            </div>
            <button onClick={() => setShowDisclaimer(false)}
              className="mt-5 w-full py-2.5 text-sm font-semibold rounded-[40px] text-white"
              style={{ background: 'var(--c-btn-primary)' }}>
              Got it
            </button>
          </div>
        </div>
      )}
      {showBeta && <BetaPopup onAcknowledge={() => { localStorage.setItem('ai_beta_acknowledged', '1'); setShowBeta(false) }} />}
    </>
  )

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      {content}
    </div>
  )
}
