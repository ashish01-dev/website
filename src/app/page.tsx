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

const SUBJECT_EMOJIS: Record<Subject, string> = { physics: '⚡', chemistry: '🧪', maths: '📐' }

export default function DashboardPage() {
  const { progress, getProgress, loaded } = useProgressStore()
  const { settings } = useSettingsStore()
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])

  const today = formatDate(new Date())

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

  const heatColors = ['bg-white/[0.04]', 'bg-white/[0.08]', 'bg-white/[0.12]', 'bg-[#2383e2]/40', 'bg-[#2383e2]/80']

  const handleSavePlan = (p: DailyPlan) => {
    setPlan(p)
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-60">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <DailyPlanModal open={showPlanModal} onClose={() => setShowPlanModal(false)} onSave={handleSavePlan} presetSubjects={dailyTargetSubjects} />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-page-title text-notion-text-dark mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h1>
            <p className="text-sm text-notion-muted-dark">
              {plan ? `${plan.hoursGoal || 0}h planned today` : `${Math.ceil((new Date(settings.examDate).getTime() - Date.now()) / 86400000)} days until JEE Main 2027`}
            </p>
          </div>
          {plan && (
            <button onClick={() => setShowPlanModal(true)} className="notion-btn-glass text-xs">Edit Plan</button>
          )}
        </div>

        {/* Countdown row */}
        <div className="notion-card p-4 mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-[#2383e2]">{Math.ceil((new Date(settings.examDate).getTime() - Date.now()) / 86400000)}</span>
            <span className="text-sm text-notion-muted-dark">days remaining</span>
          </div>
          <div className="flex justify-between text-xs text-notion-muted-dark mt-1.5">
            <span>Prep started</span>
            <span>{new Date(settings.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
              <div key={s} className="notion-card p-3">
                <div className="text-caption text-notion-muted-dark uppercase mb-1">{s}</div>
                <div className="text-2xl font-bold text-notion-text-dark">{stats[s]}%</div>
                <div className="notion-progress-bar mt-2">
                  <div className="notion-progress-fill" style={{ width: `${stats[s]}%` }} />
                </div>
              </div>
            ))}
            <div className="notion-card p-3">
              <div className="text-caption text-[#2383e2] uppercase mb-1">Overall</div>
              <div className="text-2xl font-bold text-[#2383e2]">{stats.overall}%</div>
              <div className="notion-progress-bar mt-2">
                <div className="notion-progress-fill" style={{ width: `${stats.overall}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Today's targets */}
        <div className="mb-6">
          <h2 className="section-title text-notion-text-dark mb-3">Today&apos;s Targets</h2>
          <div className="space-y-2">
            {plan && plan.subjects && plan.subjects.length > 0 ? (
              plan.subjects.map(s => (
                <div key={s.subject}>
                  {s.chapters.map((ch, i) => (
                    <div key={ch + i} className="notion-card p-3 flex items-center gap-3 mb-2">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-white/[0.08] text-[#2383e2] focus:ring-[#2383e2]" />
                      <span className="text-base">{SUBJECT_EMOJIS[s.subject]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-notion-text-dark">{ch}</div>
                        <div className="text-xs text-notion-muted-dark capitalize">{s.subject}</div>
                      </div>
                    </div>
                  ))}
                  {s.chapters.length === 0 && (
                    <div className="notion-card p-3 flex items-center gap-3 mb-2 opacity-60">
                      <span className="text-base">{SUBJECT_EMOJIS[s.subject]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-notion-text-dark capitalize">{s.subject}</div>
                        <div className="text-xs text-notion-muted-dark">No chapters selected</div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="notion-card p-3 flex items-center gap-3">
                <span className="text-base">📋</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-notion-text-dark">No plan for today</div>
                  <div className="text-xs text-notion-muted-dark">Click &quot;Plan Your Day&quot; to set today&apos;s targets</div>
                </div>
                <button onClick={() => setShowPlanModal(true)} className="notion-btn-primary text-xs">Plan Today</button>
              </div>
            )}
          </div>
        </div>

        {/* Last 30 days */}
        <div className="mb-6">
          <h2 className="section-title text-notion-text-dark mb-3">Last 30 Days</h2>
          <div className="notion-card p-4">
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
              {heatmapData.map((d, i) => (
                <div key={i} className={`aspect-square rounded-sm ${heatColors[getHeatLevel(d.hours)]}`} title={`${d.date}: ${d.hours.toFixed(1)}h`} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-notion-muted-dark">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-white/[0.04]" />
              <div className="w-3 h-3 rounded-sm bg-white/[0.08]" />
              <div className="w-3 h-3 rounded-sm bg-white/[0.12]" />
              <div className="w-3 h-3 rounded-sm bg-[#2383e2]/40" />
              <div className="w-3 h-3 rounded-sm bg-[#2383e2]/80" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Continue */}
        <div className="mb-6">
          <h2 className="section-title text-notion-text-dark mb-3">Continue Where You Left Off</h2>
          {continueChapter ? (
            <div className="notion-card p-3 flex items-center gap-3">
              <span className="text-base">📖</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-notion-text-dark">{continueChapter.chapter.name}</div>
                <div className="text-xs text-notion-muted-dark">{continueChapter.subject.charAt(0).toUpperCase() + continueChapter.subject.slice(1)} · Class {continueChapter.chapter.class} · {continueChapter.doneTopics}/{continueChapter.totalTopics} topics done</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="notion-progress-bar w-16">
                  <div className="notion-progress-fill" style={{ width: `${continueChapter.percent}%` }} />
                </div>
                <span className="text-xs text-notion-muted-dark">{continueChapter.percent}%</span>
              </div>
              <button className="notion-btn-glass text-xs text-[#2383e2]">Resume →</button>
            </div>
          ) : (
            <div className="notion-card p-3">
              <p className="text-sm text-notion-muted-dark text-center">All chapters complete! 🎉</p>
            </div>
          )}
        </div>

        {/* Pace indicator */}
        {pace && (
          <div className="notion-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-notion-text-dark">Pace Status</span>
                <span className={`ml-2 text-xs ${Object.values(pace.paceStatus).every(s => s === 'on_track') ? 'text-[#0f8a5e]' : 'text-[#e03e3e]'}`}>
                  {Object.values(pace.paceStatus).every(s => s === 'on_track') ? '● On Track' : '● Behind Schedule'}
                </span>
              </div>
              <span className="text-xs text-notion-muted-dark">Phase: {pace.currentPhase === 'foundation' ? 'Foundation' : pace.currentPhase === 'consolidation' ? 'Consolidation' : 'Final Sprint'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
