'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { db } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'
import { uploadFile, deleteStorageFile } from '@/lib/supabase-sync'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, FormulaEntry, FormulaFile, Chapter, ErrorEntry } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData

function getFlatChapters(subject: Subject): Chapter[] {
  const out: Chapter[] = []
  for (const div of syllabus[subject].divisions) {
    for (const ch of div.chapters) {
      if (!ch.deleted) out.push(ch)
    }
  }
  return out
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function RevisionPage() {
  const [tab, setTab] = useState<'errors' | 'formulas'>('errors')
  const [subjectTab, setSubjectTab] = useState<Subject>('physics')
  const [formulaEntries, setFormulaEntries] = useState<Record<string, FormulaEntry>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [errorSubject, setErrorSubject] = useState<Subject>('physics')
  const [errorChapter, setErrorChapter] = useState('')
  const [errorQuestion, setErrorQuestion] = useState('')
  const [errorReason, setErrorReason] = useState('')
  const [errorEntries, setErrorEntries] = useState<ErrorEntry[]>([])

  const chaptersBySubject = useMemo(() => ({
    physics: getFlatChapters('physics'),
    chemistry: getFlatChapters('chemistry'),
    maths: getFlatChapters('maths'),
  }), [])

  const currentChapters = chaptersBySubject[subjectTab]

  useEffect(() => {
    db.formulas.toArray().then(entries => {
      const map: Record<string, FormulaEntry> = {}
      entries.forEach(e => { map[e.chapterId] = e })
      setFormulaEntries(map)
    })
    db.errors.toArray().then(setErrorEntries)
  }, [])

  const handleFileUpload = async (chapterId: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(chapterId)
    const existing = formulaEntries[chapterId]
    const newFiles: FormulaFile[] = []

    for (const file of Array.from(files)) {
      let url = ''
      let storagePath = ''
      try {
        url = await uploadFile(chapterId, file)
        storagePath = `formulas/${chapterId}/${Date.now()}_${file.name}`
      } catch (err) {
        console.error('revision file upload:', err)
      }
      newFiles.push({ name: file.name, size: file.size, type: file.type, url, storagePath })
    }

    const entry: FormulaEntry = {
      id: chapterId,
      chapterId,
      subject: subjectTab,
      files: [...(existing?.files || []), ...newFiles],
      updatedAt: new Date().toISOString(),
    }

    await db.formulas.put(entry)
    setFormulaEntries(prev => ({ ...prev, [chapterId]: entry }))
    setUploading(null)
  }

  const deleteFile = async (chapterId: string, fileIndex: number) => {
    const existing = formulaEntries[chapterId]
    if (!existing) return
    const file = existing.files[fileIndex]
    if (file?.url) {
      await deleteStorageFile(file.url)
    }
    const files = existing.files.filter((_, i) => i !== fileIndex)
    const entry = { ...existing, files, updatedAt: new Date().toISOString() }
    if (files.length === 0) {
      await db.formulas.delete(chapterId)
      const updated = { ...formulaEntries }
      delete updated[chapterId]
      setFormulaEntries(updated)
    } else {
      await db.formulas.put(entry)
      setFormulaEntries(prev => ({ ...prev, [chapterId]: entry }))
    }
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-60">
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-page-title text-notion-text-dark mb-1">Revision Hub</h1>
        <p className="text-sm text-notion-muted-dark mb-6">Error log and formula vault</p>

        <div className="flex items-center gap-1 mb-6 border-b border-notion-border-dark pb-0">
          <button onClick={() => setTab('errors')} className={`px-3 py-2 text-sm border-b-2 -mb-[1px] transition-colors ${tab === 'errors' ? 'border-[#2383e2] text-[#2383e2] font-medium' : 'border-transparent text-notion-muted-dark hover:text-notion-text-dark'}`}>
            Error Log
          </button>
          <button onClick={() => setTab('formulas')} className={`px-3 py-2 text-sm border-b-2 -mb-[1px] transition-colors ${tab === 'formulas' ? 'border-[#2383e2] text-[#2383e2] font-medium' : 'border-transparent text-notion-muted-dark hover:text-notion-text-dark'}`}>
            Formula Vault
          </button>
        </div>

        {tab === 'errors' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="notion-card p-4">
              <h2 className="section-title text-notion-text-dark mb-4">Log an Error</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-caption text-notion-muted-dark block mb-1">SUBJECT</label>
                  <select value={errorSubject} onChange={e => { setErrorSubject(e.target.value as Subject); setErrorChapter('') }} className="notion-input">
                    {['physics', 'chemistry', 'maths'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-caption text-notion-muted-dark block mb-1">CHAPTER</label>
                  <select value={errorChapter} onChange={e => setErrorChapter(e.target.value)} className="notion-input">
                    <option value="">Select chapter</option>
                    {chaptersBySubject[errorSubject].map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-caption text-notion-muted-dark block mb-1">QUESTION</label>
                  <textarea value={errorQuestion} onChange={e => setErrorQuestion(e.target.value)} className="notion-input h-16 resize-none" placeholder="Describe the question..." />
                </div>
                <div>
                  <label className="text-caption text-notion-muted-dark block mb-1">WHY WRONG</label>
                  <textarea value={errorReason} onChange={e => setErrorReason(e.target.value)} className="notion-input h-16 resize-none" placeholder="Formula mistake? Silly error?" />
                </div>
                <button onClick={async () => {
                  if (!errorChapter || !errorQuestion) return
                  const entry: ErrorEntry = { id: generateId(), date: formatDate(new Date()), subject: errorSubject, chapter: errorChapter, question: errorQuestion, reason: errorReason }
                  await db.errors.add(entry)
                  setErrorEntries(prev => [...prev, entry])
                  setErrorChapter(''); setErrorQuestion(''); setErrorReason('')
                }} className="notion-btn-primary w-full justify-center text-sm">Log Error</button>
              </div>
            </div>
            <div className="md:col-span-2 notion-card p-4">
              <h2 className="section-title text-notion-text-dark mb-4">Recent Errors</h2>
              {errorEntries.length === 0 ? (
                <p className="text-sm text-notion-muted-dark text-center py-8">No errors logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {[...errorEntries].reverse().slice(0, 20).map(e => {
                    const chName = chaptersBySubject[e.subject].find(ch => ch.id === e.chapter)?.name || e.chapter
                    return (
                      <div key={e.id} className="p-3 rounded bg-notion-sidebar-hover-dark/50 border border-notion-border-dark">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium uppercase" style={{ color: e.subject === 'physics' ? '#2383e2' : e.subject === 'chemistry' ? '#0f8a5e' : '#d9730d' }}>{e.subject}</span>
                          <span className="text-xs text-notion-muted-dark">{chName}</span>
                          <span className="text-[10px] text-notion-muted-dark ml-auto">{e.date}</span>
                        </div>
                        <p className="text-sm text-notion-text-dark mb-0.5">{e.question}</p>
                        {e.reason && <p className="text-xs text-[#e03e3e]">{e.reason}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'formulas' && (
          <div>
            <div className="flex items-center gap-1 mb-4 border-b border-notion-border-dark pb-0">
              {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSubjectTab(s)}
                  className={`px-3 py-2 text-sm border-b-2 -mb-[1px] transition-colors ${
                    subjectTab === s ? 'border-[#2383e2] text-[#2383e2] font-medium' : 'border-transparent text-notion-muted-dark hover:text-notion-text-dark'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentChapters.map(ch => {
                const entry = formulaEntries[ch.id]
                const files = entry?.files || []
                return (
                  <div key={ch.id} className="notion-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-caption text-[#2383e2] mb-0.5">Class {ch.class} &middot; {ch.weightage}</div>
                        <h3 className="text-sm font-medium text-notion-text-dark">{ch.name}</h3>
                      </div>
                      <span className="text-xs text-notion-muted-dark ml-2 whitespace-nowrap">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {files.map((file, idx) => {
                          const isImage = file.type.startsWith('image/')
                          return (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded bg-notion-sidebar-hover-dark/50">
                              {isImage && file.url && (
                                <img src={file.url} alt={file.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                              )}
                              {!isImage && <span className="text-base flex-shrink-0">📄</span>}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-notion-text-dark truncate">{file.name}</div>
                                <div className="text-[10px] text-notion-muted-dark">{formatFileSize(file.size)}</div>
                              </div>
                              {file.url && (
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#2383e2] hover:underline flex-shrink-0">Open</a>
                              )}
                              <button onClick={() => deleteFile(ch.id, idx)} className="text-[10px] text-[#e03e3e] hover:underline flex-shrink-0">Delete</button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {files.length === 0 && (
                      <p className="text-xs text-notion-muted-dark mb-3 italic">No files uploaded yet.</p>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.txt,.doc,.docx"
                      onChange={e => { handleFileUpload(ch.id, e.target.files); e.target.value = '' }}
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.accept = 'image/*,.pdf,.txt,.doc,.docx'
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files) handleFileUpload(ch.id, files)
                        }
                        input.click()
                      }}
                      disabled={uploading === ch.id}
                      className="notion-btn-ghost text-xs text-[#2383e2] w-full justify-center"
                    >
                      {uploading === ch.id ? 'Uploading...' : '+ Add Files'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
