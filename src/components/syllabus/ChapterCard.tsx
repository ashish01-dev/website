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
      <div className="rounded-[18px] p-3 opacity-40" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🚫</span>
          <span className="text-sm line-through" style={{ color: '#888' }}>{chapter.name}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#f0f0f0', color: '#888' }}>Removed</span>
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
    <div className="rounded-[18px]" style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: expanded ? '0 4px 20px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <span className="text-base flex-shrink-0">
          {status === 'done' ? '✅' : status === 'in_progress' ? '🔄' : '📄'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: '#0f0f0f' }}>{chapter.name}</div>
          <div className="text-xs" style={{ color: '#888' }}>
            Class {chapter.class} · {chapter.weightage} weightage
            {!chapter.verified && <span className="ml-1.5" style={{ color: '#d9730d' }}>(needs check)</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {allActiveIds.length > 0 && (
            <>
              <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f0f0' }}>
                <div className="h-full rounded-full bg-[#2383e2] transition-all" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-xs w-6 text-right" style={{ color: '#888' }}>{percent}%</span>
            </>
          )}
          <span className="text-xs" style={{ color: '#888' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {(activeTopics.length > 0 || customTopicIds.length > 0) ? (
            <div className="space-y-1 mb-3">
              {activeTopics.map(topic => (
                <label key={topic.id} className={`flex items-center gap-2 px-1 py-0.5 rounded cursor-pointer hover:bg-black/[0.02] ${topic.deleted ? 'opacity-40 line-through' : ''}`}>
                  <input
                    type="checkbox"
                    checked={topicStatus[topic.id] || false}
                    onChange={e => setTopicDone(chapter.id, topic.id, e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm text-[#2383e2] focus:ring-[#2383e2]"
                    style={{ borderColor: 'rgba(0,0,0,0.2)' }}
                    disabled={topic.deleted}
                  />
                  <span className="text-sm" style={{ color: '#0f0f0f' }}>{topic.name}</span>
                  {topic.deleted && <span className="text-xs" style={{ color: '#888' }}>(deleted)</span>}
                </label>
              ))}
              {customTopicIds.map(id => (
                <label key={id} className="flex items-center gap-2 px-1 py-0.5 rounded cursor-pointer hover:bg-black/[0.02]">
                  <input
                    type="checkbox"
                    checked={topicStatus[id] || false}
                    onChange={e => setTopicDone(chapter.id, id, e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm text-[#2383e2] focus:ring-[#2383e2]"
                    style={{ borderColor: 'rgba(0,0,0,0.2)' }}
                  />
                  <span className="text-sm" style={{ color: '#0f0f0f' }}>{customTopics[id]}</span>
                  <span className="text-[10px]" style={{ color: '#d9730d' }}>(custom)</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs mb-3 italic" style={{ color: '#888' }}>Topics not yet added — cross-check with NCERT.</p>
          )}

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              placeholder="Add a custom topic..."
              className="flex-1 px-2 py-1 text-xs outline-none rounded-[40px]"
              style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', background: '#fafafa' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#2383e2' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
            />
            <button onClick={handleAddTopic} className="text-xs font-medium px-3 py-1.5 rounded-[40px] whitespace-nowrap" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#2383e2' }}>+ Add</button>
          </div>

          <div className="flex gap-2">
            {allActiveIds.length > 0 && (
              <button onClick={() => { markAllTopics(chapter.id); triggerConfetti(true) }} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#2383e2' }}>Mark all done</button>
            )}
            <button onClick={() => {
              const newStatus = status === 'done' ? 'not_started' : 'done'
              setChapterStatus(chapter.id, newStatus)
              if (newStatus === 'done') triggerConfetti(true)
            }} className="text-xs font-medium px-3 py-1.5 rounded-[40px]" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#555' }}>
              {status === 'done' ? 'Undo' : 'Complete'}
            </button>
          </div>
        </div>
      )}
      <ConfettiOverlay fire={showConfetti} onDone={() => setShowConfetti(false)} />
    </div>
  )
}
