import type { Subject, PaceResult, SyllabusData, UserProgress } from '@/types'

const SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']

export function calculatePace(
  syllabus: SyllabusData,
  progress: UserProgress,
  examDate: Date,
  today: Date,
  freezeDays: number = 21
): PaceResult {
  const freezeDate = new Date(examDate)
  freezeDate.setDate(freezeDate.getDate() - freezeDays)
  const daysUntilFreeze = Math.max(1, Math.ceil((freezeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  const getTopicCount = (subject: Subject): number => {
    let count = 0
    for (const div of syllabus[subject].divisions) {
      for (const ch of div.chapters) {
        if (!ch.deleted) count += ch.topics.length || 1
      }
    }
    return count
  }

  const getCompletedTopics = (subject: Subject): number => {
    let count = 0
    for (const div of syllabus[subject].divisions) {
      for (const ch of div.chapters) {
        if (!ch.deleted && progress[ch.id]) {
          if (ch.topics.length === 0) {
            if (progress[ch.id].status === 'done') count += 1
            else if (progress[ch.id].status === 'in_progress') count += 0.5
          } else {
            const doneTopics = ch.topics.filter(t => !t.deleted && progress[ch.id]?.topicStatus[t.id]).length
            const activeTopics = ch.topics.filter(t => !t.deleted).length
            count += doneTopics / Math.max(1, activeTopics)
          }
        }
      }
    }
    return count
  }

  const getCompletedChapters = (subject: Subject): number => {
    let count = 0
    for (const div of syllabus[subject].divisions) {
      for (const ch of div.chapters) {
        if (!ch.deleted && progress[ch.id]?.status === 'done') count++
      }
    }
    return count
  }

  const getTotalChapters = (subject: Subject): number => {
    let count = 0
    for (const div of syllabus[subject].divisions) {
      for (const ch of div.chapters) if (!ch.deleted) count++
    }
    return count
  }

  let earliestDate: string | null = null
  for (const sub of SUBJECTS) {
    for (const div of syllabus[sub].divisions) {
      for (const ch of div.chapters) {
        if (!ch.deleted && progress[ch.id]?.completedOn) {
          if (!earliestDate || progress[ch.id]!.completedOn! < earliestDate) {
            earliestDate = progress[ch.id]!.completedOn!
          }
        }
      }
    }
  }
  const studyDays = earliestDate
    ? Math.max(1, Math.ceil((today.getTime() - new Date(earliestDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 1

  const remainingTopics: Record<Subject, number> = {} as Record<Subject, number>
  const requiredPace: Record<Subject, number> = {} as Record<Subject, number>
  const actualPace: Record<Subject, number> = {} as Record<Subject, number>
  const paceStatus: Record<Subject, 'on_track' | 'behind'> = {} as Record<Subject, 'on_track' | 'behind'>
  const behindByDays: Record<Subject, number> = {} as Record<Subject, number>

  let totalCompleted = 0
  let totalAll = 0

  for (const sub of SUBJECTS) {
    const total = getTopicCount(sub)
    const completed = getCompletedTopics(sub)
    remainingTopics[sub] = Math.max(0, total - completed)
    requiredPace[sub] = remainingTopics[sub] / daysUntilFreeze
    actualPace[sub] = completed / studyDays
    totalCompleted += getCompletedChapters(sub)
    totalAll += getTotalChapters(sub)

    if (requiredPace[sub] === 0) { paceStatus[sub] = 'on_track'; behindByDays[sub] = 0 }
    else if (actualPace[sub] >= requiredPace[sub]) { paceStatus[sub] = 'on_track'; behindByDays[sub] = 0 }
    else { paceStatus[sub] = 'behind'; behindByDays[sub] = Math.ceil((requiredPace[sub] - actualPace[sub]) * daysUntilFreeze) }
  }

  const consolidationStart = new Date(freezeDate)
  consolidationStart.setDate(consolidationStart.getDate() - 50)

  let currentPhase: PaceResult['currentPhase'] = 'foundation'
  if (today >= freezeDate) currentPhase = 'sprint'
  else if (today >= consolidationStart) currentPhase = 'consolidation'

  return {
    daysUntilFreeze, remainingTopics, requiredPace, actualPace, paceStatus, behindByDays, currentPhase,
    overallProgress: totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0,
  }
}

export function selectDailyTargets(
  syllabus: SyllabusData,
  progress: UserProgress,
  pace: PaceResult,
  pinnedSubjects?: Subject[]
): Subject[] {
  if (pinnedSubjects && pinnedSubjects.length >= 2) return pinnedSubjects.slice(0, 2)
  return ([...SUBJECTS] as Subject[]).sort((a, b) => {
    if (pace.paceStatus[a] === 'behind' && pace.paceStatus[b] !== 'behind') return -1
    if (pace.paceStatus[b] === 'behind' && pace.paceStatus[a] !== 'behind') return 1
    return pace.behindByDays[b] - pace.behindByDays[a]
  }).slice(0, 2)
}
