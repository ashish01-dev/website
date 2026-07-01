'use client'

import { dexie } from './db'
import type { FormulaFile, Subject } from '@/types'

const DEVUPLOADS_KEY = '128561wl49c553zyxzxbqr'
const GOOGLE_DRIVE_KEY = 'AIzaSyAFxuVUv3STBB-RLUbmxspK85Gd6RiOUhM'

/* ─── DevUploads ─── */

async function getDevUploadsServer(): Promise<string> {
  const res = await fetch(`https://devuploads.com/api/upload/server?key=${DEVUPLOADS_KEY}`)
  const data = await res.json()
  if (data?.status !== 200 || !data?.result) throw new Error('Failed to get upload server')
  return data.result
}

export async function uploadToDevUploads(file: File): Promise<string> {
  const serverUrl = await getDevUploadsServer()
  const formData = new FormData()
  formData.append('sess_id', DEVUPLOADS_KEY)
  formData.append('file', file)
  const res = await fetch(serverUrl, { method: 'POST', body: formData })
  const html = await res.text()
  const match = html.match(/file_code["']?\s*:\s*["']([^"']+)/i) || html.match(/filecode["']?\s*:\s*["']([^"']+)/i)
  if (match?.[1]) return match[1]
  const fallbackMatch = html.match(/https:\/\/devuploads\.com\/([a-zA-Z0-9]+)/)
  if (fallbackMatch?.[1]) return fallbackMatch[1]
  throw new Error('Could not extract file code from upload response')
}

export async function getDevUploadsDirectLink(fileCode: string): Promise<string> {
  const res = await fetch(`https://devuploads.com/api/file/direct_link?key=${DEVUPLOADS_KEY}&file_code=${fileCode}`)
  const data = await res.json()
  if (data?.status !== 200 || !data?.result?.url) throw new Error('Failed to get direct link')
  return data.result.url
}

/* ─── Google Drive (Pro) ─── */

export async function uploadToGoogleDrive(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer()
  const metadata = { name: file.name, mimeType: file.type }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob([fileBuffer], { type: file.type }), file.name)
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${GOOGLE_DRIVE_KEY}`,
    { method: 'POST', body: form }
  )
  const data = await res.json()
  if (data?.id) return data.id
  if (res.status === 401 || res.status === 403) {
    console.warn('Google Drive upload requires OAuth — falling back to DevUploads only')
    return ''
  }
  throw new Error(data?.error?.message || 'Google Drive upload failed')
}

export async function getGoogleDriveDownloadLink(fileId: string): Promise<string> {
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_DRIVE_KEY}`
}

/* ─── IndexedDB local cache ─── */

export async function saveFileBlob(chapterId: string, file: FormulaFile, blob: Blob) {
  try {
    await dexie.vaultFiles.put({ id: `${chapterId}_${file.name}`, chapterId, fileName: file.name, blob, type: file.type, size: file.size })
  } catch (err) {
    console.warn('Failed to cache file blob locally:', err)
  }
}

export async function getFileBlob(chapterId: string, fileName: string): Promise<Blob | null> {
  try {
    const entry = await dexie.vaultFiles.get(`${chapterId}_${fileName}`)
    return entry?.blob || null
  } catch { return null }
}

export async function removeFileBlob(chapterId: string, fileName: string) {
  try { await dexie.vaultFiles.delete(`${chapterId}_${fileName}`) } catch {}
}

export async function clearChapterBlobs(chapterId: string) {
  try { await dexie.vaultFiles.where('chapterId').equals(chapterId).delete() } catch {}
}

/* ─── Download orchestrator ─── */

export async function downloadFile(file: FormulaFile, chapterId: string, isPro: boolean): Promise<void> {
  const localBlob = await getFileBlob(chapterId, file.name)
  if (localBlob) {
    const url = URL.createObjectURL(localBlob)
    triggerDownload(url, file.name)
    setTimeout(() => URL.revokeObjectURL(url), 60000)
    return
  }

  if (isPro && file.gdriveFileId) {
    try {
      const gUrl = await getGoogleDriveDownloadLink(file.gdriveFileId)
      window.open(gUrl, '_blank')
      return
    } catch {}
  }

  if (file.fileCode) {
    try {
      const directUrl = await getDevUploadsDirectLink(file.fileCode)
      const res = await fetch(directUrl, { mode: 'cors' })
      if (res.ok) {
        const blob = await res.blob()
        saveFileBlob(chapterId, file, blob)
        const url = URL.createObjectURL(blob)
        triggerDownload(url, file.name)
        setTimeout(() => URL.revokeObjectURL(url), 60000)
        return
      }
    } catch {}
    window.open(`https://devuploads.com/${file.fileCode}`, '_blank')
    return
  }

  /* Backward compat: old files stored with direct url */
  if ((file as any).url) {
    window.open((file as any).url, '_blank')
    return
  }

  throw new Error('No download source available')
}

function triggerDownload(url: string, fileName: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}