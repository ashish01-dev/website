import { NextRequest, NextResponse } from 'next/server'

const DEVUPLOADS_KEY = '128561wl49c553zyxzxbqr'
const GOOGLE_DRIVE_KEY = 'AIzaSyAFxuVUv3STBB-RLUbmxspK85Gd6RiOUhM'

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/* Get upload server URL from DevUploads API */
async function getUploadServer(): Promise<string> {
  const res = await fetch(`https://devuploads.com/api/upload/server?key=${DEVUPLOADS_KEY}`)
  const data = await res.json()
  if (data?.status !== 200 || !data?.result) throw new Error('Failed to get upload server')
  return data.result
}

/* Extract file code from upload response HTML */
function extractFileCode(html: string): string | null {
  const patterns = [
    /file_code["']?\s*[:=]\s*["']([^"']+)/i,
    /filecode["']?\s*[:=]\s*["']([^"']+)/i,
    /https:\/\/devuploads\.com\/([a-zA-Z0-9]+)/,
    /[?&]fn=([a-zA-Z0-9]+)/,
    /"result"\s*:\s*"([^"]+)"/,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

/* Upload to DevUploads — tries proper API server first, then CGI fallback */
async function uploadToDevUploads(fileBytes: Uint8Array, fileName: string, fileType: string): Promise<{ fileCode: string; directUrl?: string }> {
  /* Try 1: Proper API upload server */
  try {
    const serverUrl = await getUploadServer()
    const formData = new FormData()
    formData.append('sess_id', DEVUPLOADS_KEY)
    formData.append('file', new Blob([fileBytes.buffer as ArrayBuffer], { type: fileType }), fileName)
      const uploadRes = await fetch(serverUrl, { method: 'POST', body: formData, signal: AbortSignal.timeout(30000) })
    const uploadText = await uploadRes.text()
    const fileCode = extractFileCode(uploadText)
    if (fileCode) {
      return { fileCode }
    }
  } catch {}

  /* Try 2: CGI anonymous upload + clone */
  const cgiUrls = [
    'https://du4.devuploads.com/cgi-bin/upload.cgi',
    'https://s01.devuploads.com/cgi-bin/upload.cgi',
    'https://s02.devuploads.com/cgi-bin/upload.cgi',
  ]
  for (const cgiUrl of cgiUrls) {
    try {
      const formData = new FormData()
      formData.append('sess_id', '')
      formData.append('utype', 'anon')
      formData.append('upload_type', 'file')
      formData.append('file', new Blob([fileBytes.buffer as ArrayBuffer], { type: fileType }), fileName)
      const uploadRes = await fetch(`${cgiUrl}?upload_type=file&utype=anon`, {
        method: 'POST', body: formData, signal: AbortSignal.timeout(30000),
      })
      const uploadText = await uploadRes.text()
      const fileCode = extractFileCode(uploadText)
      if (fileCode) {
        const cloneRes = await fetch(
          `https://devuploads.com/api/file/clone?key=${DEVUPLOADS_KEY}&file_code=${fileCode}`
        )
        const cloneData = await cloneRes.json()
        const finalCode = cloneData?.result?.filecode || fileCode
        return { fileCode: finalCode }
      }
    } catch {}
  }

  throw new Error('Failed to upload to DevUploads via any server')
}

/* Get direct download link from DevUploads */
async function getDirectLink(fileCode: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://devuploads.com/api/file/direct_link?key=${DEVUPLOADS_KEY}&file_code=${fileCode}`)
    const data = await res.json()
    return data?.result?.url
  } catch { return undefined }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { file: base64, name, type, isPro } = body
    if (!base64 || !name) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const fileBytes = base64ToBytes(base64)
    const { fileCode, directUrl } = await uploadToDevUploads(fileBytes, name, type)

    /* Fetch direct link after upload */
    const directLink = directUrl || await getDirectLink(fileCode)

    /* Upload to Google Drive (Pro only — may fail without OAuth) */
    let gdriveFileId = ''
    if (isPro === true) {
      try {
        const gForm = new FormData()
        gForm.append('metadata', new Blob([JSON.stringify({ name, mimeType: type })], { type: 'application/json' }))
        gForm.append('file', new Blob([fileBytes.buffer as ArrayBuffer], { type }), name)
        const gRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${GOOGLE_DRIVE_KEY}`,
          { method: 'POST', body: gForm }
        )
        const gData = await gRes.json()
        if (gData?.id) gdriveFileId = gData.id
      } catch (e) {
        console.warn('Google Drive upload failed:', e)
      }
    }

    return NextResponse.json({
      fileCode,
      directLink,
      gdriveFileId,
      name,
      size: fileBytes.byteLength,
      type,
      uploadedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('vault upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
