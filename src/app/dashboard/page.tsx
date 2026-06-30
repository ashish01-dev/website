'use client'

import { useMemo, useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import DailyPlanModal from '@/components/dashboard/DailyPlanModal'
import StoragePopup from '@/components/dashboard/StoragePopup'
import ChangelogPopup from '@/components/dashboard/ChangelogPopup'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculatePace, selectDailyTargets } from '@/lib/pacing'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { useUser } from '@/lib/useUser'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, DailyPlan, PomodoroSession } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

const SUBJECT_META: Record<Subject, { emoji: string; light: string }> = {
  physics: { emoji: '⚡', light: 'var(--c-blue)' },
  chemistry: { emoji: '🧪', light: 'var(--c-green)' },
  maths: { emoji: '📐', light: 'var(--c-orange)' },
}

const GREETINGS = ['Morning', 'Afternoon', 'Evening']

const MOTIVATIONAL_QUOTES = [
  '"The only way to do great work is to love what you do." — Steve Jobs',
  '"Success is not final, failure is not fatal." — Winston Churchill',
  '"The best time to plant a tree was 20 years ago. The second best time is now."',
  '"It does not matter how slowly you go as long as you do not stop." — Confucius',
  '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
  '"Push yourself because no one else is going to do it for you."',
]

export default function DashboardPage() {
  const { progress, getProgress, getTotalChapters, loaded } = useProgressStore()
  const { settings } = useSettingsStore()
  const { user } = useUser()
  const isPro = user?.isPro ?? false
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])

  const today = formatDate(new Date())
  const hour = new Date().getHours()
  const greeting = GREETINGS[hour < 12 ? 0 : hour < 17 ? 1 : 2]
  const daysLeft = Math.ceil((new Date(settings.examDate).getTime() - Date.now()) / 86400000)
  const { total, done } = getTotalChapters()

  useEffect(() => {
    db.dailyPlans.get(today).then(p => {
      setPlan(p || null)
      if (!p && isPro && settings.autoPlanPopup) setShowPlanModal(true)
      setPlanLoaded(true)
    })
    db.pomodoro.toArray().then(setSessions)
  }, [today, isPro, settings.autoPlanPopup])

  const pace = useMemo(() => {
    if (!loaded) return null
    return calculatePace(syllabus, progress, new Date(settings.examDate), new Date(), settings.freezeDays)
  }, [progress, loaded, settings])

  const dailyTargetSubjects = useMemo(() => {
    if (!loaded || !pace) return undefined
    return selectDailyTargets(syllabus, progress, pace)
  }, [loaded, pace, progress])

  const stats = useMemo(() => {
    if (!loaded) return null
    const p = getProgress('physics')
    const c = getProgress('chemistry')
    const m = getProgress('maths')
    return { physics: p, chemistry: c, maths: m, overall: Math.round((p + c + m) / 3) }
  }, [progress, loaded])

  const continueChapter = useMemo(() => {
    if (!loaded) return null
    let best: { chapter: { name: string; id: string; class: number }; subject: Subject; doneTopics: number; totalTopics: number; percent: number } | null = null
    const subs: Subject[] = ['physics', 'chemistry', 'maths']
    for (const sub of subs) {
      for (const div of syllabus[sub].divisions) {
        for (const ch of div.chapters) {
          if (ch.deleted) continue
          const chProg = progress[ch.id]
          if (!chProg || chProg.status === 'done' || chProg.status === 'not_started') continue
          const activeTopics = ch.topics.filter(t => !t.deleted)
          const customIds = Object.keys(chProg.customTopics || {})
          const allIds = [...activeTopics.map(t => t.id), ...customIds]
          const done = allIds.filter(id => chProg.topicStatus[id]).length
          const total = allIds.length || 1
          const pct = Math.round((done / total) * 100)
          if (!best || pct > best.percent) {
            best = { chapter: { name: ch.name, id: ch.id, class: ch.class }, subject: sub, doneTopics: done, totalTopics: total, percent: pct }
          }
        }
      }
    }
    return best
  }, [progress, loaded])

  const heatmapData = useMemo(() => {
    const days: { date: string; hours: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = formatDate(d)
      const daySessions = sessions.filter(s => s.date === ds)
      const totalSec = daySessions.reduce((a, s) => a + s.duration, 0)
      days.push({ date: ds, hours: totalSec / 3600 })
    }
    return days
  }, [sessions])

  const getHeatLevel = (hours: number) => {
    if (hours === 0) return 0
    if (hours < 2) return 1
    if (hours < 4) return 2
    if (hours < 7) return 3
    return 4
  }

  const handleSavePlan = (p: DailyPlan) => {
    setPlan(p)
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <DailyPlanModal open={showPlanModal} onClose={() => setShowPlanModal(false)} onSave={handleSavePlan} presetSubjects={dailyTargetSubjects} isPro={isPro} />
      <StoragePopup isPro={isPro} />
      <ChangelogPopup />

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 pt-[17px] pb-6 md:pb-10 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>

        {/* Greeting + date */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>
                Good {greeting}, <span style={{ color: 'var(--c-blue)' }}>{settings.name || 'Champion'}</span>
              </h1>
              <p className="text-[14px]" style={{ color: 'var(--c-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {plan ? ` · ${plan.hoursGoal || 0}h planned today` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--c-caption)' }}>Chapters</div>
                <div className="text-sm font-bold" style={{ color: 'var(--c-green)' }}>{done}/{total}</div>
              </div>
              <div className="w-px h-8" style={{ background: 'var(--c-border)' }} />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--c-caption)' }}>Days Left</div>
                <div className="text-sm font-bold" style={{ color: 'var(--c-blue)' }}>{daysLeft}</div>
              </div>
            </div>
          </div>
          <p className="text-[12px] italic mt-2" style={{ color: 'var(--c-muted)' }}>{quote}</p>
        </div>

        {/* Days left + Subject progress cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-[18px] px-[22px] py-[24px] text-center relative overflow-hidden" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#2383e2]/10 to-transparent" />
            <div className="relative">
              <div className="text-[clamp(36px,4vw,48px)] font-bold tracking-[-1px]" style={{ color: 'var(--c-blue)' }}>{daysLeft}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>Days to JEE</div>
            </div>
          </div>

          {stats && (['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
            <div key={s} className="rounded-[18px] px-[22px] py-[20px] relative overflow-hidden" style={{
              background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
            }}>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--c-muted)' }}>{s}</span>
                  <span className="text-lg">{SUBJECT_META[s].emoji}</span>
                </div>
                <div className="text-[clamp(28px,2.5vw,34px)] font-bold tracking-[-0.5px] mb-2" style={{ color: 'var(--c-text)' }}>
                  {stats[s]}<span className="text-sm font-normal" style={{ color: 'var(--c-caption)' }}>%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${stats[s]}%`, backgroundColor: SUBJECT_META[s].light }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's Plan + Continue Studying */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-[18px] px-[22px] py-[24px] relative overflow-hidden" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl" style={{ background: 'var(--c-blue)' }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>Today&apos;s Plan</h2>
                {isPro ? (
                  <button onClick={() => setShowPlanModal(true)} className="text-[10px] font-semibold uppercase tracking-wider transition-colors" style={{ color: 'var(--c-blue)' }}>
                    {plan ? 'Edit' : 'Plan'}
                  </button>
                ) : (
                  <button onClick={() => setShowPlanModal(true)} className="text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1" style={{ color: 'var(--c-muted)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Pro
                  </button>
                )}
              </div>
              {plan && plan.subjects && plan.subjects.length > 0 ? (
                <div className="space-y-2">
                  {plan.subjects.map(s => (
                    <div key={s.subject}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{SUBJECT_META[s.subject].emoji}</span>
                        <span className="text-xs font-medium capitalize" style={{ color: 'var(--c-text-secondary)' }}>{s.subject}</span>
                        <span className="text-[10px] ml-auto" style={{ color: 'var(--c-caption)' }}>{s.questions}q</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.chapters.map((ch, i) => (
                          <span key={ch + i} className="px-2.5 py-0.5 text-[11px] rounded-full" style={{
                            background: 'var(--c-tag)', color: 'var(--c-text-secondary)', border: '1px solid var(--c-border)',
                          }}>
                            {ch}
                          </span>
                        ))}
                        {s.chapters.length === 0 && (
                          <span className="text-[11px] italic" style={{ color: 'var(--c-caption)' }}>No chapters selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm mb-3" style={{ color: 'var(--c-muted)' }}>
                    {isPro ? 'No plan set for today' : 'Daily planning is a Pro feature'}
                  </p>
                  {isPro ? (
                    <button onClick={() => setShowPlanModal(true)}
                      className="inline-flex items-center gap-1.5 text-white text-[12px] font-medium rounded-[40px] px-[18px] py-[7px] transition-all duration-200 hover:-translate-y-[0.5px]"
                      style={{ background: 'var(--c-btn-primary)' }}
                    >Plan Your Day</button>
                  ) : (
                    <button onClick={() => setShowPlanModal(true)}
                      className="inline-flex items-center gap-1.5 text-white text-[12px] font-medium rounded-[40px] px-[18px] py-[7px] transition-all duration-200 hover:-translate-y-[0.5px]"
                      style={{ background: 'var(--c-btn-primary)' }}
                    ><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Upgrade to Plan</button>
                  )}
                </div>
              )}
              {stats && (
                <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
                  <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--c-muted)' }}>
                    <span>Overall Progress</span>
                    <span className="font-semibold" style={{ color: 'var(--c-blue)' }}>{stats.overall}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${stats.overall}%`, backgroundColor: 'var(--c-blue)' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[18px] px-[22px] py-[24px] relative overflow-hidden" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl" style={{ background: 'var(--c-orange)' }} />
            <div className="relative">
              <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Continue Studying</h2>
              {continueChapter ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--c-tag)' }}>
                      {SUBJECT_META[continueChapter.subject].emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{continueChapter.chapter.name}</div>
                      <div className="text-xs" style={{ color: 'var(--c-muted)' }}>{continueChapter.subject.charAt(0).toUpperCase() + continueChapter.subject.slice(1)} · Class {continueChapter.chapter.class}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--c-muted)' }}>
                      <span>{continueChapter.doneTopics}/{continueChapter.totalTopics} topics</span>
                      <span>{continueChapter.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${continueChapter.percent}%`, backgroundColor: SUBJECT_META[continueChapter.subject].light }} />
                    </div>
                  </div>
                  <button
                    className="w-full text-center text-[12px] font-medium rounded-[40px] px-[18px] py-[7px] transition-all duration-200 hover:-translate-y-[0.5px]"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
                  >
                    Resume → {continueChapter.chapter.name}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-sm" style={{ color: 'var(--c-muted)' }}>All caught up! Ready for the next challenge?</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Heatmap + Study Pace */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-[18px] px-[22px] py-[24px] md:col-span-2" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Study Heatmap — Last 30 Days</h2>
            <div className="overflow-x-auto pb-1">
            <div className="grid gap-1 min-w-[360px]" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
              {heatmapData.map((d, i) => {
                const level = getHeatLevel(d.hours)
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-[4px] hover:ring-1 hover:ring-black/20 dark:hover:ring-white/20 transition-all cursor-default"
                    style={{
                      backgroundColor: `var(--heat-${level})`,
                    }}
                    title={`${d.date}: ${d.hours.toFixed(1)}h`}
                  />
                )
              })}
            </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: 'var(--c-caption)' }}>
              <span>Less</span>
              <div className="w-3 h-3 rounded-[3px]" style={{ background: 'var(--heat-0)' }} />
              <div className="w-3 h-3 rounded-[3px]" style={{ background: 'var(--heat-1)' }} />
              <div className="w-3 h-3 rounded-[3px]" style={{ background: 'var(--heat-2)' }} />
              <div className="w-3 h-3 rounded-[3px]" style={{ background: 'var(--heat-3)' }} />
              <div className="w-3 h-3 rounded-[3px]" style={{ background: 'var(--heat-4)' }} />
              <span>More</span>
            </div>
          </div>

          <div className="rounded-[18px] px-[22px] py-[24px]" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Study Pace</h2>
            {pace ? (
              <div className="space-y-3">
                {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => {
                  const isOnTrack = pace.paceStatus[s] === 'on_track'
                  const pct = stats ? stats[s] : 0
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-sm">{SUBJECT_META[s].emoji}</span>
                      <div className="flex-1">
                        <div className="text-xs capitalize mb-0.5" style={{ color: 'var(--c-muted)' }}>{s} — {pct}%</div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${pct}%`,
                            backgroundColor: isOnTrack ? 'var(--c-green)' : 'var(--c-red)',
                          }} />
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium ${isOnTrack ? 'text-[var(--c-green)]' : 'text-[#e03e3e]'}`}>
                        {isOnTrack ? 'On Track' : 'Behind'}
                      </span>
                    </div>
                  )
                })}
                <div className="pt-2 mt-2 border-t text-xs text-center" style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
                  Phase: <span className="font-medium" style={{ color: 'var(--c-text)' }}>
                    {pace.currentPhase === 'foundation' ? 'Foundation' : pace.currentPhase === 'consolidation' ? 'Consolidation' : 'Final Sprint'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm" style={{ color: 'var(--c-muted)' }}>Loading pace data...</div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {loaded && !stats && (
          <div className="rounded-[18px] px-[22px] py-[32px] text-center" style={{
            background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)',
          }}>
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Ready to start your journey?</h2>
            <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Head to the Syllabus page to begin tracking your progress.</p>
          </div>
        )}

      </div>
    </div>
  )
}
