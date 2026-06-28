'use client'

import { useState } from 'react'
import type { Chapter } from '@/types'
import { useProgressStore } from '@/store/progressStore'
import { useSettingsStore } from '@/store/settingsStore'
import ConfettiOverlay from '@/components/ConfettiOverlay'

interface ChapterCardProps {
  chapter: Chapter
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const { progress, setTopicDone, setChapterStatus, markAllTopics, addCustomTopic } = useProgressStore()
  const { settings } = useSettingsStore()

  const triggerConfetti = (val: boolean) => { if (settings.confettiEnabled) setShowConfetti(val) }

  const chProgress = progress[chapter.id]
  const topicStatus = chProgress?.topicStatus || {}
  const customTopics = chProgress?.customTopics || {}
  const activeTopics = chapter.topics.filter(t => !t.deleted)
  const customTopicIds = Object.keys(customTopics)
  const allActiveIds = [...activeTopics.map(t => t.id), ...customTopicIds]
  const doneTopics = allActiveIds.filter(id => topicStatus[id]).length
  const percent = allActiveIds.length > 0 ? Math.round((doneTopics / allActiveIds.length) * 100) : chProgress?.status === 'done' ? 100 : chProgress?.status === 'in_progress' ? 50 : 0
  const status = chProgress?.status || 'not_started'

  if (chapter.deleted) {
    return (
      <div className="notion-card p-3 opacity-40">
        <div className="flex items-center gap-2">
          <span className="text-base">🚫</span>
          <span className="text-sm line-through text-notion-muted-dark">{chapter.name}</span>
          <span className="text-xs bg-[#2f2f2f] px-1.5 py-0.5 rounded text-notion-muted-dark">Removed</span>
        </div>
      </div>
    )
  }

  const handleAddTopic = () => {
    const name = newTopic.trim()
    if (!name) return
    addCustomTopic(chapter.id, name)
    setNewTopic('')
  }

  return (
    <div className={`notion-card ${expanded ? 'shadow-notion-hover' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <span className="text-base flex-shrink-0">
          {status === 'done' ? '✅' : status === 'in_progress' ? '🔄' : '📄'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-notion-text-dark">{chapter.name}</div>
          <div className="text-xs text-notion-muted-dark">
            Class {chapter.class} · {chapter.weightage} weightage
            {!chapter.verified && <span className="ml-1.5 text-[#d9730d]">(needs check)</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {allActiveIds.length > 0 && (
            <>
              <div className="notion-progress-bar w-12">
                <div className="notion-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-xs text-notion-muted-dark w-6 text-right">{percent}%</span>
            </>
          )}
          <span className="text-xs text-notion-muted-dark">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-notion-border-dark pt-2">
          {(activeTopics.length > 0 || customTopicIds.length > 0) ? (
            <div className="space-y-1 mb-3">
              {activeTopics.map(topic => (
                <label key={topic.id} className={`flex items-center gap-2 px-1 py-0.5 rounded hover:bg-notion-sidebar-hover-dark cursor-pointer ${topic.deleted ? 'opacity-40 line-through' : ''}`}>
                  <input
                    type="checkbox"
                    checked={topicStatus[topic.id] || false}
                    onChange={e => setTopicDone(chapter.id, topic.id, e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-[#373737] text-[#2383e2] focus:ring-[#2383e2]"
                    disabled={topic.deleted}
                  />
                  <span className="text-sm text-notion-text-dark">{topic.name}</span>
                  {topic.deleted && <span className="text-xs text-notion-muted-dark">(deleted)</span>}
                </label>
              ))}
              {customTopicIds.map(id => (
                <label key={id} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-notion-sidebar-hover-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={topicStatus[id] || false}
                    onChange={e => setTopicDone(chapter.id, id, e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-[#373737] text-[#2383e2] focus:ring-[#2383e2]"
                  />
                  <span className="text-sm text-notion-text-dark">{customTopics[id]}</span>
                  <span className="text-[10px] text-[#d9730d]">(custom)</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-notion-muted-dark mb-3 italic">Topics not yet added — cross-check with NCERT.</p>
          )}

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              placeholder="Add a custom topic..."
              className="flex-1 px-2 py-1 text-xs bg-transparent border border-notion-border-dark rounded-notion text-notion-text-dark placeholder:text-notion-muted-dark outline-none focus:border-[#2383e2]"
            />
            <button onClick={handleAddTopic} className="notion-btn-ghost text-xs text-[#2383e2] whitespace-nowrap">+ Add</button>
          </div>

          <div className="flex gap-2">
            {allActiveIds.length > 0 && (
              <button onClick={() => { markAllTopics(chapter.id); triggerConfetti(true) }} className="notion-btn-ghost text-xs text-[#2383e2]">Mark all done</button>
            )}
            <button onClick={() => {
              const newStatus = status === 'done' ? 'not_started' : 'done'
              setChapterStatus(chapter.id, newStatus)
              if (newStatus === 'done') triggerConfetti(true)
            }} className="notion-btn-ghost text-xs">
              {status === 'done' ? 'Undo' : 'Complete'}
            </button>
          </div>
        </div>
      )}
      <ConfettiOverlay fire={showConfetti} onDone={() => setShowConfetti(false)} />
    </div>
  )
}
