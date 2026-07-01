import { NextRequest, NextResponse } from 'next/server'

const DEVUPLOADS_KEY = '128561wl49c553zyxzxbqr'
const GOOGLE_DRIVE_KEY = 'AIzaSyAFxuVUv3STBB-RLUbmxspK85Gd6RiOUhM'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const isPro = formData.get('isPro') === 'true'
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const fileBuffer = await file.arrayBuffer()
    const fileBlob = new Blob([fileBuffer], { type: file.type })

    /* Upload to DevUploads */
    const serverRes = await fetch(
      `https://devuploads.com/api/upload/server?key=${DEVUPLOADS_KEY}`
    )
    const serverData = await serverRes.json()
    if (!serverData?.result) throw new Error('Failed to get upload server')
    const uploadUrl = serverData.result

    const devForm = new FormData()
    devForm.append('sess_id', DEVUPLOADS_KEY)
    devForm.append('file', fileBlob, file.name)
    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: devForm })
    const uploadHtml = await uploadRes.text()
    const codeMatch = uploadHtml.match(/file_code["']?\s*:\s*["']([^"']+)/i) ||
                      uploadHtml.match(/filecode["']?\s*:\s*["']([^"']+)/i) ||
                      uploadHtml.match(/https:\/\/devuploads\.com\/([a-zA-Z0-9]+)/)
    const fileCode = codeMatch?.[1] || ''

    /* Upload to Google Drive (Pro only) */
    let gdriveFileId = ''
    if (isPro) {
      try {
        const gMeta = { name: file.name, mimeType: file.type }
        const gForm = new FormData()
        gForm.append('metadata', new Blob([JSON.stringify(gMeta)], { type: 'application/json' }))
        gForm.append('file', fileBlob, file.name)
        const gRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${GOOGLE_DRIVE_KEY}`,
          { method: 'POST', body: gForm }
        )
        const gData = await gRes.json()
        if (gData?.id) gdriveFileId = gData.id
      } catch (e) {
        console.warn('Google Drive upload failed (Pro fallback to DevUploads):', e)
      }
    }

    return NextResponse.json({
      fileCode,
      gdriveFileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('vault upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}