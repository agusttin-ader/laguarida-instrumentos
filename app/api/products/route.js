export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import { cookies } from 'next/headers'

const MAX_TEXT = 500
const MAX_NAME = 140
const MAX_SLUG = 180
const MAX_PRICE = 120
const MAX_IMAGES = 12

// helper to extract sb-access-token from cookie store or raw header
async function extractAccessToken(req) {
  try {
    const cookieStore = await cookies()
    // cookieStore.get returns something like { name, value }
    const at = cookieStore.get && cookieStore.get('sb-access-token')
    if (at && at.value) return at.value

    const session = cookieStore.get && cookieStore.get('sb-session') && cookieStore.get('sb-session').value
    if (session) {
      try {
        const parsed = JSON.parse(session)
        if (parsed?.access_token) return parsed.access_token
        if (parsed?.accessToken) return parsed.accessToken
      } catch { /* empty */ }
    }

    // fallback: parse raw Cookie header
    const raw = req.headers.get('cookie') || ''
    if (raw) {
      const pairs = raw.split(/;\s*/).map(p => p.split('='))
      const map = Object.fromEntries(pairs.map(([k, ...v]) => [k, v.join('=')]))
      if (map['sb-access-token']) return map['sb-access-token']
      if (map['sb-session']) {
        try {
          const parsed = JSON.parse(decodeURIComponent(map['sb-session']))
          return parsed?.access_token || parsed?.accessToken || null
        } catch { /* empty */ }
      }
    }
  } catch { /* empty */ }
  return null
}

function assertSameOrigin(req) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (!origin || !host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function toSafeString(value, maxLen = MAX_TEXT) {
  if (value == null) return null
  const s = String(value).trim()
  if (!s) return null
  return s.slice(0, maxLen)
}

function toSafeStringArray(value, maxItems = MAX_IMAGES, maxLen = MAX_TEXT) {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => toSafeString(v, maxLen))
    .filter(Boolean)
    .slice(0, maxItems)
}

function normalizeSlug(value) {
  const s = toSafeString(value, MAX_SLUG)
  if (!s) return null
  const slug = s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  if (!slug) return null
  return slug
}

function isLikelyUrl(value) {
  if (!value) return true
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function buildProductPayload(body = {}, partial = false) {
  const payload = {}

  const name = toSafeString(body.name, MAX_NAME)
  const slug = normalizeSlug(body.slug)
  const brand = toSafeString(body.brand, MAX_TEXT)
  const model = toSafeString(body.model, MAX_TEXT)
  const price = toSafeString(body.price, MAX_PRICE)
  const description = toSafeString(body.description, 4000)
  const image_url = toSafeString(body.image_url, 2000)
  const images = toSafeStringArray(body.images, MAX_IMAGES, 2000)
  const wood = Array.isArray(body.wood) ? toSafeStringArray(body.wood, 8, MAX_TEXT) : toSafeString(body.wood, MAX_TEXT)
  const mics = Array.isArray(body.mics) ? toSafeStringArray(body.mics, 8, MAX_TEXT) : toSafeString(body.mics, MAX_TEXT)

  if (!partial) {
    if (!name || !slug) return { error: 'Missing required fields: name and slug' }
  }

  if ('name' in body) payload.name = name
  if ('slug' in body) payload.slug = slug
  if ('brand' in body) payload.brand = brand
  if ('model' in body) payload.model = model
  if ('price' in body) payload.price = price
  if ('description' in body) payload.description = description
  if ('image_url' in body) payload.image_url = image_url
  if ('images' in body) payload.images = images
  if ('wood' in body) payload.wood = wood
  if ('mics' in body) payload.mics = mics

  if (!partial && !payload.name) return { error: 'Invalid name' }
  if (!partial && !payload.slug) return { error: 'Invalid slug' }
  if (payload.image_url && !isLikelyUrl(payload.image_url)) return { error: 'Invalid image_url' }
  if (payload.images && payload.images.some((u) => !isLikelyUrl(u))) return { error: 'Invalid images URLs' }
  if (partial && Object.keys(payload).length === 0) return { error: 'No valid fields to update' }

  return { payload }
}

export async function GET(req) {
  try {
    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = buildProductPayload(body, false)
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const payload = parsed.payload

    const { data, error } = await supabase.from('products').insert([payload]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...fields } = body || {}
    if (!id) {
      return NextResponse.json({ error: 'Missing product id for update' }, { status: 400 })
    }

    const parsed = buildProductPayload(fields, true)
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const payload = parsed.payload

    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing product id in query string (?id=)' }, { status: 400 })
    }

    const { data, error } = await supabase.from('products').delete().eq('id', id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
