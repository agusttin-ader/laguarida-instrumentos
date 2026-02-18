export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import { cookies } from 'next/headers'
const BUCKET = 'products'

function sanitizeFilename(name){
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

export async function POST(req){
  try {
    // Temporary debug logging: record cookie store info and raw Cookie header
    try {
      const cookieStore = cookies()
      if (cookieStore && typeof cookieStore.getAll === 'function') {
        const all = await cookieStore.getAll()
        console.log('DEBUG /api/upload-image cookies.getAll length=', Array.isArray(all) ? all.length : String(all))
      } else if (cookieStore && typeof cookieStore.get === 'function') {
        const names = ['sb-access-token','sb-refresh-token','sb-session']
        const found = names.map(n => cookieStore.get(n)).filter(Boolean)
        console.log('DEBUG /api/upload-image cookies.get available count=', found.length)
      } else {
        console.log('DEBUG /api/upload-image cookies() shape=', cookieStore ? Object.keys(cookieStore) : 'no-cookie-store')
      }
    } catch (e) {
      console.log('DEBUG /api/upload-image cookies error', String(e))
    }

    console.log('DEBUG /api/upload-image request Cookie header=', req.headers.get('cookie'))

    // Read HttpOnly Supabase session token from cookies and pass it to server client
    const cookieStore = cookies()
    let accessToken = null
    let tokenSource = null
    try {
      // Try cookie store first
      const at = cookieStore.get && cookieStore.get('sb-access-token')
      if (at && at.value) {
        accessToken = at.value
        tokenSource = 'cookieStore:sb-access-token'
      } else {
        const session = cookieStore.get && cookieStore.get('sb-session') && cookieStore.get('sb-session').value
        if (session) {
          try {
            const parsed = JSON.parse(session)
            accessToken = parsed?.access_token || parsed?.accessToken || null
            if (accessToken) tokenSource = 'cookieStore:sb-session'
          } catch (e) {
            // session cookie not JSON — ignore
          }
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
            tokenSource = 'cookieHeader:sb-access-token'
          } else if (map['sb-session']) {
            try {
              const parsed = JSON.parse(decodeURIComponent(map['sb-session']))
              accessToken = parsed?.access_token || parsed?.accessToken || null
              if (accessToken) tokenSource = 'cookieHeader:sb-session'
            } catch (e) {
              // ignore parse error
            }
          }
        }
      }
    } catch (e) {
      console.log('DEBUG /api/upload-image cookie extraction error', String(e))
    }

    console.log('DEBUG /api/upload-image tokenSource=', tokenSource ? tokenSource : 'none')

    const supabase = await getSupabaseServerClient(accessToken)
    // require authenticated user for uploads
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    // Safe debug logging: whether Supabase returned an error and whether a user was found
    try {
      console.log('DEBUG /api/upload-image authErr=', authErr ? (authErr.message || String(authErr)) : 'none', 'userPresent=', !!user)
    } catch (e) {
      // ignore logging failures
    }
    if (authErr || !user) {
      // Collect cookie names (no values) for debugging — avoids leaking sensitive values
      let cookieNames = []
      try {
        const cookieStore = cookies()
        if (cookieStore && typeof cookieStore.getAll === 'function') {
          const all = await cookieStore.getAll()
          cookieNames = all.map(c => c.name)
        } else if (cookieStore && typeof cookieStore.get === 'function') {
          cookieNames = ['sb-access-token','sb-refresh-token','sb-session']
        }
      } catch (e) {
        // ignore
      }

      // Also include request header names for debugging (no header values)
      const headerNames = []
      try {
        for (const [k] of req.headers) headerNames.push(k)
      } catch (e) {}

      return NextResponse.json({ error: 'Authentication required', cookies: cookieNames, headers: headerNames }, { status: 401 })
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
