'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { db } from '@/lib/db'
import { uploadFile, deleteStorageFile } from '@/lib/supabase-sync'
import syllabusData from '@/data/syllabus.json'
import type { Subject, FormulaEntry, FormulaFile } from '@/types'

const syllabus = syllabusData as any

function getFlatChapters(subject: Subject) {
  const out: any[] = []
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

export default function FormulaVaultPage() {
  const [subjectTab, setSubjectTab] = useState<Subject>('physics')
  const [formulaEntries, setFormulaEntries] = useState<Record<string, FormulaEntry>>({})
  const [uploading, setUploading] = useState<string | null>(null)

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
        url = await uploadFile(chapterId, file, subjectTab)
        storagePath = `${subjectTab}/${chapterId}/${Date.now()}_${file.name}`
      } catch (err) {
        console.error('file upload error:', err)
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

  const downloadFile = useCallback(async (file: FormulaFile) => {
    if (!file.url) return
    try {
      const res = await fetch(file.url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }, [])

  const deleteFile = async (chapterId: string, fileIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const existing = formulaEntries[chapterId]
    if (!existing) return
    const file = existing.files[fileIndex]
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return
    if (file?.url) await deleteStorageFile(file.url)
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
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Formula Vault</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Upload and manage formula sheets, notes, and resources per chapter</p>

        <div className="flex items-center gap-1 mb-4 border-b pb-0" style={{ borderColor: 'var(--c-border)' }}>
          {(['physics', 'chemistry', 'maths'] as Subject[]).map(s => (
            <button key={s} onClick={() => setSubjectTab(s)}
              className={`px-3 py-2 text-sm border-b-2 -mb-[1px] transition-colors ${subjectTab === s ? 'border-[var(--c-blue)] text-[var(--c-blue)] font-medium' : 'border-transparent hover:text-[var(--c-text)]'}`}
              style={{ color: subjectTab !== s ? 'var(--c-muted)' : undefined }}
            >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentChapters.map((ch: any) => {
            const entry = formulaEntries[ch.id]
            const files = entry?.files || []
            return (
              <div key={ch.id} className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--c-blue)' }}>Class {ch.class} &middot; {ch.weightage}</div>
                    <h3 className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{ch.name}</h3>
                  </div>
                  <span className="text-xs ml-2 whitespace-nowrap" style={{ color: 'var(--c-muted)' }}>{files.length} file{files.length !== 1 ? 's' : ''}</span>
                </div>

                {files.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {files.map((file, idx) => {
                      const isImage = file.type.startsWith('image/')
                      return (
                        <div key={idx}
                          onClick={() => file.url && downloadFile(file)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-[10px] cursor-pointer transition-colors hover:opacity-80"
                          style={{ background: 'var(--c-input)' }}
                          title="Click to download"
                        >
                          {isImage && file.url ? (
                            <img src={file.url} alt={file.name} className="w-8 h-8 rounded object-cover flex-shrink-0" loading="lazy" />
                          ) : (
                            <span className="text-base flex-shrink-0">📄</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate" style={{ color: 'var(--c-text)' }}>{file.name}</div>
                            <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{formatFileSize(file.size)}</div>
                          </div>
                          {file.url && (
                            <a href={file.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="text-[10px] hover:underline flex-shrink-0" style={{ color: 'var(--c-blue)' }}>Open</a>
                          )}
                          <button onClick={e => deleteFile(ch.id, idx, e)}
                            className="text-[10px] hover:underline flex-shrink-0" style={{ color: 'var(--c-red)' }}>Delete</button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {files.length === 0 && (
                  <p className="text-xs mb-3 italic" style={{ color: 'var(--c-muted)' }}>No files uploaded yet.</p>
                )}

                <button onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = 'image/*,.pdf,.txt,.doc,.docx'
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) handleFileUpload(ch.id, files)
                  }
                  input.click()
                }} disabled={uploading === ch.id}
                  className="w-full flex items-center justify-center text-xs font-medium px-3 py-1.5 rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-blue)' }}
                >{uploading === ch.id ? 'Uploading...' : '+ Add Files'}</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
