import { NextRequest, NextResponse } from 'next/server'

const DEVUPLOADS_KEY = '128561wl49c553zyxzxbqr'
const GOOGLE_DRIVE_KEY = 'AIzaSyAFxuVUv3STBB-RLUbmxspK85Gd6RiOUhM'

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/* Upload to DevUploads using the CGI upload URL (not the API server URL) */
async function uploadToDevUploads(fileBytes: Uint8Array, fileName: string, fileType: string): Promise<string> {
  /* First try the CGI upload URL (used by the actual upload form) */
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
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000),
      })
      const uploadText = await uploadRes.text()

      let fileCode = ''
      const fnMatch = uploadText.match(/[?&]fn=([a-zA-Z0-9]+)/)
      if (fnMatch?.[1]) fileCode = fnMatch[1]
      const jMatch = uploadText.match(/"file_code"\s*:\s*"([^"]+)"/i)
      if (jMatch?.[1]) fileCode = jMatch[1]
      const codeMatch = uploadText.match(/file_code["']?\s*[:=]\s*["']([^"']+)/i)
      if (codeMatch?.[1]) fileCode = codeMatch[1]
      const directMatch = uploadText.match(/https:\/\/devuploads\.com\/([a-zA-Z0-9]+)/)
      if (directMatch?.[1]) fileCode = directMatch[1]

      if (fileCode) {
        /* Clone to account */
        const cloneRes = await fetch(
          `https://devuploads.com/api/file/clone?key=${DEVUPLOADS_KEY}&file_code=${fileCode}`
        )
        const cloneData = await cloneRes.json()
        if (cloneData?.result?.filecode) return cloneData.result.filecode
        return fileCode
      }
    } catch {}
  }
  throw new Error('Failed to upload to DevUploads via any server')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { file: base64, name, type, isPro } = body
    if (!base64 || !name) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const fileBytes = base64ToBytes(base64)
    const isProBool = isPro === true

    const fileCode = await uploadToDevUploads(fileBytes, name, type)

    /* Upload to Google Drive (Pro only) */
    let gdriveFileId = ''
    if (isProBool) {
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