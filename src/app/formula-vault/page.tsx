'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useUser } from '@/lib/useUser'
import { db } from '@/lib/db'
import { downloadFile, saveFileBlob, removeFileBlob } from '@/lib/vault-storage'
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
  const { user } = useUser()
  const isPro = user?.isPro ?? false
  const [subjectTab, setSubjectTab] = useState<Subject>('physics')
  const [formulaEntries, setFormulaEntries] = useState<Record<string, FormulaEntry>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

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
    setUploadError(null)
    const existing = formulaEntries[chapterId]
    const newFiles: FormulaFile[] = []

    for (const file of Array.from(files)) {
      try {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1])
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })

        const res = await fetch('/api/vault/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, name: file.name, type: file.type, isPro }),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `Upload failed (HTTP ${res.status})`)
        }
        const data = await res.json()

        const formulaFile: FormulaFile = {
          name: data.name,
          size: data.size,
          type: data.type,
          fileCode: data.fileCode || undefined,
          gdriveFileId: data.gdriveFileId || undefined,
          uploadedAt: data.uploadedAt,
        }
        newFiles.push(formulaFile)

        /* Cache blob locally */
        saveFileBlob(chapterId, formulaFile, file)
        } catch (err: any) {
          console.error('file upload error:', err)
          const code = err.message?.includes('timeout') ? 5
            : err.message?.includes('abort') ? 5
            : err.message?.includes('413') || err.message?.includes('too large') ? 2
            : err.message?.includes('type') || err.message?.includes('invalid') ? 3
            : err.message?.includes('500') ? 4
            : 1
          setUploadError(`Failed to upload to server (Error ${code})`)
        }
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

  const handleDownload = async (file: FormulaFile, chapterId: string) => {
    try {
      await downloadFile(file, chapterId, isPro)
    } catch (err) {
      console.error('download error:', err)
    }
  }

  const handleDelete = async (chapterId: string, fileIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const existing = formulaEntries[chapterId]
    if (!existing) return
    const file = existing.files[fileIndex]
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return
    removeFileBlob(chapterId, file.name)
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

        {uploadError && (
          <div className="mb-4 px-4 py-2.5 rounded-[12px] text-xs flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--c-red)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {uploadError}
            <button onClick={() => setUploadError(null)} className="ml-auto hover:opacity-70">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
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
                          onClick={() => handleDownload(file, ch.id)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-[10px] cursor-pointer transition-colors hover:opacity-80"
                          style={{ background: 'var(--c-input)' }}
                          title="Click to download"
                        >
                          {isImage ? (
                            <span className="text-base flex-shrink-0">🖼️</span>
                          ) : (
                            <span className="text-base flex-shrink-0">📄</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate" style={{ color: 'var(--c-text)' }}>{file.name}</div>
                            <div className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{formatFileSize(file.size)}</div>
                          </div>
                          {file.fileCode && (
                            <a href={`https://devuploads.com/${file.fileCode}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="text-[10px] hover:underline flex-shrink-0" style={{ color: 'var(--c-blue)' }}>Open</a>
                          )}
                          <button onClick={e => handleDelete(ch.id, idx, e)}
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