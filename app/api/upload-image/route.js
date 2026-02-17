import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
const BUCKET = 'products'

function sanitizeFilename(name){
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

export async function POST(req){
  try {

    const supabase = getSupabaseServerClient()
    // require authenticated user for uploads
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
    }

    const form = await req.formData()
    const file = form.get('file')
    if (!file) {
      return NextResponse.json({ error: 'Missing file field (name="file")' }, { status: 400 })
    }

    const filenameRaw = file.name || 'upload'
    const safeName = sanitizeFilename(filenameRaw)
    const uniqueName = `${Date.now()}-${Math.floor(Math.random()*9000+1000)}-${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    // Use Node Buffer when available (server Node runtime); fall back to Uint8Array
    const buffer = (typeof Buffer !== 'undefined') ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET).upload(uniqueName, buffer, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadError) {
      // Provide clearer production-friendly error with context
      return NextResponse.json({ error: 'Supabase upload failed', detail: uploadError.message || String(uploadError) }, { status: uploadError.status || 500 })
    }

    const { data: publicData, error: publicErr } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path)
    if (publicErr) {
      return NextResponse.json({ error: 'Failed to retrieve public URL', detail: publicErr.message || String(publicErr) }, { status: publicErr.status || 500 })
    }

    const publicUrl = publicData?.publicUrl || null
    if (!publicUrl) {
      return NextResponse.json({ error: 'Unable to obtain public URL from Supabase' }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
