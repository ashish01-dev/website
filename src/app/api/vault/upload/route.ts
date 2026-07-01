import { NextRequest, NextResponse } from 'next/server'

const DEVUPLOADS_KEY = '128561wl49c553zyxzxbqr'
const GOOGLE_DRIVE_KEY = 'AIzaSyAFxuVUv3STBB-RLUbmxspK85Gd6RiOUhM'

/* Anonymous upload — sess_id is empty for anon, then clone to account via API */
async function uploadToDevUploads(fileBuffer: ArrayBuffer, fileName: string, fileType: string): Promise<string> {
  const serverRes = await fetch(`https://devuploads.com/api/upload/server?key=${DEVUPLOADS_KEY}`)
  const serverData = await serverRes.json()
  if (!serverData?.result) throw new Error('Failed to get upload server')
  const uploadUrl: string = serverData.result

  const formData = new FormData()
  formData.append('sess_id', '')
  formData.append('utype', 'anon')
  formData.append('file', new Blob([fileBuffer], { type: fileType }), fileName)

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData })
  const uploadText = await uploadRes.text()

  /* Try to extract file code from various response formats */
  let fileCode = ''
  const fnMatch = uploadText.match(/[?&]fn=([a-zA-Z0-9]+)/)
  if (fnMatch?.[1]) fileCode = fnMatch[1]
  const codeMatch = uploadText.match(/file_code["']?\s*[:=]\s*["']([^"']+)/i)
  if (codeMatch?.[1]) fileCode = codeMatch[1]
  const directMatch = uploadText.match(/https:\/\/devuploads\.com\/([a-zA-Z0-9]+)/)
  if (directMatch?.[1]) fileCode = directMatch[1]

  if (!fileCode) throw new Error('Could not extract file code from upload response')

  /* Clone to account so it's managed by our DevUploads account */
  const cloneRes = await fetch(
    `https://devuploads.com/api/file/clone?key=${DEVUPLOADS_KEY}&file_code=${fileCode}`
  )
  const cloneData = await cloneRes.json()
  if (cloneData?.result?.filecode) return cloneData.result.filecode

  return fileCode
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const isPro = formData.get('isPro') === 'true'
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const fileBuffer = await file.arrayBuffer()

    const fileCode = await uploadToDevUploads(fileBuffer, file.name, file.type)

    /* Upload to Google Drive (Pro only) */
    let gdriveFileId = ''
    if (isPro) {
      try {
        const gMeta = { name: file.name, mimeType: file.type }
        const gForm = new FormData()
        gForm.append('metadata', new Blob([JSON.stringify(gMeta)], { type: 'application/json' }))
        gForm.append('file', new Blob([fileBuffer], { type: file.type }), file.name)
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