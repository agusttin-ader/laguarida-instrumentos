export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-unused-expressions, no-unused-expressions */

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import { cookies } from 'next/headers'
import sharp from 'sharp'
import { createHash } from 'crypto'
const BUCKET = 'products'

function sanitizeFilename(name){
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function filenameWithoutExtension(name = '') {
  return name.replace(/\.[a-z0-9]+$/i, '')
}

export async function POST(req){
  try {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (origin && host) {
      try {
        const o = new URL(origin)
        if (o.host !== host) {
          return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
      }
    }

    // Read HttpOnly Supabase session token from cookies and pass it to server client
    const cookieStore = await cookies()
    let accessToken = null
    try {
      // Try cookie store first
      const at = cookieStore.get && cookieStore.get('sb-access-token')
      if (at && at.value) {
        accessToken = at.value
        /* token source captured for debugging */
      } else {
        const session = cookieStore.get && cookieStore.get('sb-session') && cookieStore.get('sb-session').value
        if (session) {
          try {
            const parsed = JSON.parse(session)
            accessToken = parsed?.access_token || parsed?.accessToken || null
            if (accessToken) /* token source captured for debugging */ null
          } catch { /* empty */ }
        }
      }

      // Fallback: parse raw Cookie header if cookieStore didn't yield values
      if (!accessToken) {
        const raw = req.headers.get('cookie') || ''
        if (raw) {
          // parse key=value pairs
          const pairs = raw.split(/;\s*/).map(p => p.split('='))
          const map = Object.fromEntries(pairs.map(([k, ...v]) => [k, v.join('=')]))
          if (map['sb-access-token']) {
            accessToken = map['sb-access-token']
            /* token source captured for debugging */
          } else if (map['sb-session']) {
            try {
              const parsed = JSON.parse(decodeURIComponent(map['sb-session']))
              accessToken = parsed?.access_token || parsed?.accessToken || null
                if (accessToken) /* token source captured for debugging */ null
            } catch { /* empty */ }
          }
        }
      }
    } catch { /* empty */ }

    const supabase = await getSupabaseServerClient(accessToken)
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
    const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
    if (!allowedMime.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, or WEBP.' }, { status: 400 })
    }
    const maxBytes = 10 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large. Max size is 10MB.' }, { status: 400 })
    }

    const filenameRaw = file.name || 'upload'
    const safeBaseName = sanitizeFilename(filenameWithoutExtension(filenameRaw) || 'upload')

    const arrayBuffer = await file.arrayBuffer()
    const originalBuffer = Buffer.from(arrayBuffer)

    let uploadBuffer = originalBuffer
    let uploadMime = file.type || 'application/octet-stream'
    let uploadExt = (file.type === 'image/png') ? 'png' : (file.type === 'image/webp' ? 'webp' : 'jpg')

    try {
      const base = sharp(originalBuffer, { failOn: 'none' }).rotate().resize({
        width: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      })
      const metadata = await base.metadata()
      const hasAlpha = Boolean(metadata.hasAlpha)

      if (file.type === 'image/webp') {
        uploadBuffer = await base.webp({ quality: 78, effort: 6 }).toBuffer()
        uploadMime = 'image/webp'
        uploadExt = 'webp'
      } else if (file.type === 'image/png' || hasAlpha) {
        uploadBuffer = await base.webp({ quality: 78, effort: 6 }).toBuffer()
        uploadMime = 'image/webp'
        uploadExt = 'webp'
      } else {
        uploadBuffer = await base.jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: '4:2:0' }).toBuffer()
        uploadMime = 'image/jpeg'
        uploadExt = 'jpg'
      }
    } catch {
      // Keep original as a safe fallback if optimization fails unexpectedly.
      uploadBuffer = originalBuffer
      uploadMime = file.type || 'application/octet-stream'
      uploadExt = (file.type || '').includes('png') ? 'png' : ((file.type || '').includes('webp') ? 'webp' : 'jpg')
    }

    const hash = createHash('sha1').update(uploadBuffer).digest('hex').slice(0, 12)
    const uniqueName = `${Date.now()}-${hash}-${safeBaseName}.${uploadExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET).upload(uniqueName, uploadBuffer, {
      contentType: uploadMime,
      cacheControl: '31536000',
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
