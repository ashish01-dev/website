'use client'

import { useMemo, useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import DailyPlanModal from '@/components/dashboard/DailyPlanModal'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculatePace, selectDailyTargets } from '@/lib/pacing'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, DailyPlan, PomodoroSession, Chapter } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

const SUBJECT_META: Record<Subject, { emoji: string; gradient: string; light: string }> = {
  physics: { emoji: '⚡', gradient: 'from-[#2383e2]/20 to-[#2383e2]/5', light: '#2383e2' },
  chemistry: { emoji: '🧪', gradient: 'from-[#0f8a5e]/20 to-[#0f8a5e]/5', light: '#0f8a5e' },
  maths: { emoji: '📐', gradient: 'from-[#d9730d]/20 to-[#d9730d]/5', light: '#d9730d' },
}

const GREETINGS = ['Morning', 'Afternoon', 'Evening']

export default function DashboardPage() {
  const { progress, getProgress, loaded } = useProgressStore()
  const { settings } = useSettingsStore()
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])

  const today = formatDate(new Date())
  const hour = new Date().getHours()
  const greeting = GREETINGS[hour < 12 ? 0 : hour < 17 ? 1 : 2]
  const daysLeft = Math.ceil((new Date(settings.examDate).getTime() - Date.now()) / 86400000)

  useEffect(() => {
    db.dailyPlans.get(today).then(p => {
      setPlan(p || null)
      if (!p) setShowPlanModal(true)
      setPlanLoaded(true)
    })
    db.pomodoro.toArray().then(setSessions)
  }, [today])

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
    <div className="min-h-screen pb-16 md:pb-0 md:pl-60 bg-black">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <DailyPlanModal open={showPlanModal} onClose={() => setShowPlanModal(false)} onSave={handleSavePlan} presetSubjects={dailyTargetSubjects} />

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-10">

        <div className="relative mb-8">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2383e2]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#2383e2]/5 rounded-full blur-2xl" />

          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Good {greeting}, <span className="text-[#2383e2]">{settings.name || 'Champion'}</span>
            </h1>
            <p className="text-sm text-white/50">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {plan ? ` · ${plan.hoursGoal || 0}h planned today` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-1">
            <div className="liquid-glass rounded-2xl p-5 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2383e2]/10 to-transparent" />
              <div className="relative">
                <div className="text-5xl font-bold text-[#2383e2] mb-1">{daysLeft}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Days to JEE</div>
              </div>
            </div>
          </div>

          {stats && (['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
            <div key={s} className="liquid-glass rounded-2xl p-4 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${SUBJECT_META[s].gradient}`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50 uppercase tracking-wide">{s}</span>
                  <span className="text-lg">{SUBJECT_META[s].emoji}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stats[s]}<span className="text-sm text-white/50 font-normal">%</span></div>
                <div className="notion-progress-bar">
                  <div className="notion-progress-fill" style={{ width: `${stats[s]}%`, backgroundColor: SUBJECT_META[s].light }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="liquid-glass rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2383e2]/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Today&apos;s Plan</h2>
                <button onClick={() => setShowPlanModal(true)} className="text-[10px] uppercase tracking-wider text-[#2383e2] hover:underline">
                  {plan ? 'Edit' : 'Plan'}
                </button>
              </div>
              {plan && plan.subjects && plan.subjects.length > 0 ? (
                <div className="space-y-2">
                  {plan.subjects.map(s => (
                    <div key={s.subject}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{SUBJECT_META[s.subject].emoji}</span>
                        <span className="text-xs font-medium text-white/50 capitalize">{s.subject}</span>
                        <span className="text-[10px] text-white/50 ml-auto">{s.questions}q</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.chapters.map((ch, i) => (
                          <span key={ch + i} className="px-2 py-0.5 text-[11px] rounded-full bg-white/[0.06] text-white border border-white/[0.06]">
                            {ch}
                          </span>
                        ))}
                        {s.chapters.length === 0 && (
                          <span className="text-[11px] text-white/50 italic">No chapters selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm text-white/50 mb-3">No plan set for today</p>
                  <button onClick={() => setShowPlanModal(true)} className="text-xs px-4 py-2 bg-[#2383e2] text-white rounded-full font-medium hover:bg-[#2383e2]/90 transition-colors">Plan Your Day</button>
                </div>
              )}
              {stats && (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Overall Progress</span>
                    <span className="text-[#2383e2] font-semibold">{stats.overall}%</span>
                  </div>
                  <div className="notion-progress-bar mt-1.5">
                    <div className="notion-progress-fill" style={{ width: `${stats.overall}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d9730d]/5 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-sm font-semibold text-white mb-4">Continue Studying</h2>
              {continueChapter ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#2383e2]/10 flex items-center justify-center text-lg">
                      {SUBJECT_META[continueChapter.subject].emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{continueChapter.chapter.name}</div>
                      <div className="text-xs text-white/50">{continueChapter.subject.charAt(0).toUpperCase() + continueChapter.subject.slice(1)} · Class {continueChapter.chapter.class}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                      <span>{continueChapter.doneTopics}/{continueChapter.totalTopics} topics</span>
                      <span>{continueChapter.percent}%</span>
                    </div>
                    <div className="notion-progress-bar">
                      <div className="notion-progress-fill" style={{ width: `${continueChapter.percent}%`, backgroundColor: SUBJECT_META[continueChapter.subject].light }} />
                    </div>
                  </div>
                  <button className="liquid-glass rounded-full text-xs w-full text-center px-4 py-2 text-white">
                    Resume → {continueChapter.chapter.name}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-sm text-white/50">All caught up! Ready for the next challenge?</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="liquid-glass rounded-2xl p-5 md:col-span-2">
            <h2 className="text-sm font-semibold text-white mb-4">Study Heatmap — Last 30 Days</h2>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
              {heatmapData.map((d, i) => {
                const level = getHeatLevel(d.hours)
                const colors = ['bg-white/[0.03]', 'bg-white/[0.07]', 'bg-white/[0.12]', 'bg-[#2383e2]/30', 'bg-[#2383e2]/70']
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${colors[level]} hover:ring-1 hover:ring-white/20 transition-all cursor-default`}
                    title={`${d.date}: ${d.hours.toFixed(1)}h`}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-white/50">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-white/[0.03]" />
              <div className="w-3 h-3 rounded-sm bg-white/[0.07]" />
              <div className="w-3 h-3 rounded-sm bg-white/[0.12]" />
              <div className="w-3 h-3 rounded-sm bg-[#2383e2]/30" />
              <div className="w-3 h-3 rounded-sm bg-[#2383e2]/70" />
              <span>More</span>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Study Pace</h2>
            {pace ? (
              <div className="space-y-3">
                {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => {
                  const isOnTrack = pace.paceStatus[s] === 'on_track'
                  const pct = stats ? stats[s] : 0
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-sm">{SUBJECT_META[s].emoji}</span>
                      <div className="flex-1">
                        <div className="text-xs text-white/50 capitalize mb-0.5">{s} — {pct}%</div>
                        <div className="notion-progress-bar">
                          <div className="notion-progress-fill" style={{
                            width: `${pct}%`,
                            backgroundColor: isOnTrack ? '#0f8a5e' : '#e03e3e'
                          }} />
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium ${isOnTrack ? 'text-[#0f8a5e]' : 'text-[#e03e3e]'}`}>
                        {isOnTrack ? 'On Track' : 'Behind'}
                      </span>
                    </div>
                  )
                })}
                <div className="pt-2 mt-2 border-t border-white/[0.06] text-xs text-white/50 text-center">
                  Phase: <span className="text-white font-medium">
                    {pace.currentPhase === 'foundation' ? 'Foundation' : pace.currentPhase === 'consolidation' ? 'Consolidation' : 'Final Sprint'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-white/50">Loading pace data...</div>
            )}
          </div>
        </div>

        {loaded && !stats && (
          <div className="liquid-glass rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-lg font-semibold text-white mb-2">Ready to start your journey?</h2>
            <p className="text-sm text-white/50 mb-4">Head to the Syllabus page to begin tracking your progress.</p>
          </div>
        )}

      </div>
    </div>
  )
}
