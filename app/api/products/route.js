export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getSupabaseServerClient, getSupabaseAdminClient } from '../../../lib/supabase/server'
import { getPublicCatalogRows, getAdminCatalogFromSupabase } from '../../../lib/data/publicCatalog'
import { isSupabaseAdminEnabled } from '../../../lib/supabase/mode'
import { cookies } from 'next/headers'
import { resolveImageUrl } from '../../../lib/utils/imageHelpers'

const MAX_TEXT = 500
const MAX_NAME = 140
const MAX_SLUG = 180
const MAX_PRICE = 120
const MAX_IMAGES = 12
const MAX_HIGHLIGHTS = 8
const MAX_HIGHLIGHT_ITEM = 220
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'products'

/**
 * De una URL pública de Storage devuelve la ruta del objeto dentro del bucket,
 * solo si el bucket coincide con STORAGE_BUCKET.
 */
function tryParseStorageObjectPath(url) {
  if (!url || typeof url !== 'string') return null
  const u = url.trim().split('?')[0]
  const m = u.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (!m) return null
  const bucket = m[1]
  if (bucket !== STORAGE_BUCKET) return null
  try {
    return decodeURIComponent(m[2])
  } catch {
    return m[2]
  }
}

function collectStorageObjectPathsFromRow(row) {
  const paths = new Set()
  const add = (ref) => {
    if (!ref || typeof ref !== 'string') return
    const p = tryParseStorageObjectPath(ref)
    if (p) paths.add(p)
    const resolved = resolveImageUrl(ref)
    if (resolved && resolved !== ref) {
      const p2 = tryParseStorageObjectPath(resolved)
      if (p2) paths.add(p2)
    }
  }
  if (row?.image_url) add(row.image_url)
  if (Array.isArray(row?.images)) row.images.forEach(add)
  return [...paths]
}

async function removeProductFilesFromStorage(deletedRows) {
  if (!Array.isArray(deletedRows) || !deletedRows.length) {
    return { skipped: true, removed: 0 }
  }
  const all = new Set()
  for (const row of deletedRows) {
    for (const p of collectStorageObjectPathsFromRow(row)) all.add(p)
  }
  const paths = [...all]
  if (!paths.length) return { skipped: true, removed: 0 }

  try {
    const admin = getSupabaseAdminClient()
    const { error } = await admin.storage.from(STORAGE_BUCKET).remove(paths)
    if (error) {
      return { ok: false, removed: 0, error: error.message || String(error) }
    }
    return { ok: true, removed: paths.length }
  } catch (e) {
    return {
      ok: false,
      removed: 0,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

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

function revalidateProductPublicPaths(slug) {
  if (!slug || typeof slug !== 'string') return
  const s = slug.trim()
  if (!s) return
  revalidateTag('catalog')
  revalidatePath(`/guitars/${s}`)
  revalidatePath('/')
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

function normalizeCurrencyInput(value) {
  if (value == null || value === '') return null
  const s = String(value).trim().toUpperCase()
  if (s === 'ARS' || s === 'USD') return s
  return null
}

/**
 * Precio numérico para columna `products.price` + `currency` (USD|ARS).
 * Acepta número, o string tipo "USD 250" / "250" con body.currency.
 */
function coercePriceAndCurrency(body) {
  const curFromBody = normalizeCurrencyInput(body.currency)
  const raw = body.price

  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) {
    return { error: 'Invalid price' }
  }

  let num = null
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    num = raw
  } else {
    const s = String(raw).trim()
    const stripped = s
      .replace(/^\s*(USD|ARS|U\$S|\$)\s*/i, '')
      .replace(/\s*(USD|ARS)\s*$/i, '')
      .trim()
    const n = parseFloat(stripped.replace(/\s/g, '').replace(',', '.'))
    if (!Number.isNaN(n) && Number.isFinite(n)) num = n
  }

  if (num == null) return { error: 'Invalid price' }
  if (num < 0 || num > 1e11) return { error: 'Invalid price' }

  let currency = curFromBody
  if (!currency) {
    const s = String(raw).trim()
    currency = /^ARS\b/i.test(s) ? 'ARS' : 'USD'
  }

  return { price: num, currency }
}

function isLikelyUrl(value) {
  if (!value) return true
  const s = String(value).trim()
  if (/^blob:|^data:/i.test(s)) return false
  try {
    const u = new URL(s)
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
  const description = toSafeString(body.description, 4000)
  const highlights = toSafeStringArray(body.highlights, MAX_HIGHLIGHTS, MAX_HIGHLIGHT_ITEM)
  const image_url = toSafeString(body.image_url, 2000)
  const images = toSafeStringArray(body.images, MAX_IMAGES, 2000)
  const wood = Array.isArray(body.wood) ? toSafeStringArray(body.wood, 8, MAX_TEXT) : toSafeString(body.wood, MAX_TEXT)
  const mics = Array.isArray(body.mics) ? toSafeStringArray(body.mics, 8, MAX_TEXT) : toSafeString(body.mics, MAX_TEXT)
  const scale_length = toSafeString(body.scale_length, MAX_TEXT)
  const neck_profile = toSafeString(body.neck_profile, MAX_TEXT)
  const fingerboard_radius = toSafeString(body.fingerboard_radius, MAX_TEXT)
  const fingerboard_material = toSafeString(body.fingerboard_material, MAX_TEXT)
  const neck_construction = toSafeString(body.neck_construction, MAX_TEXT)
  const nut_width = toSafeString(body.nut_width, MAX_TEXT)
  const frets = toSafeString(body.frets, MAX_TEXT)
  const bridge = toSafeString(body.bridge, MAX_TEXT)
  const tuners = toSafeString(body.tuners, MAX_TEXT)
  const hardware_finish = toSafeString(body.hardware_finish, MAX_TEXT)
  const controls = toSafeString(body.controls, MAX_TEXT)
  const switching = toSafeString(body.switching, MAX_TEXT)
  const origin = toSafeString(body.origin, MAX_TEXT)
  const low_cost = body.low_cost === true || body.low_cost === 'true'
  let year = null
  if (body.year !== undefined && body.year !== null && String(body.year).trim() !== '') {
    const yr = Number(String(body.year).trim())
    if (!Number.isNaN(yr)) year = yr
  }
  let weight = null
  if (body.weight !== undefined && body.weight !== null && String(body.weight).trim() !== '') {
    const wt = Number(String(body.weight).trim().replace(',', '.'))
    if (!Number.isNaN(wt)) weight = wt
  }

  if (!partial) {
    if (!name || !slug) return { error: 'Missing required fields: name and slug' }
  }

  if ('name' in body) payload.name = name
  if ('slug' in body) payload.slug = slug
  if ('brand' in body) payload.brand = brand
  if ('model' in body) payload.model = model
  if ('price' in body) {
    const coerced = coercePriceAndCurrency(body)
    if (coerced.error) {
      return { error: coerced.error }
    }
    payload.price = coerced.price
    payload.currency = coerced.currency
  } else if ('currency' in body && normalizeCurrencyInput(body.currency)) {
    payload.currency = normalizeCurrencyInput(body.currency)
  }
  if ('description' in body) payload.description = description
  if ('highlights' in body) payload.highlights = highlights.length ? highlights : null
  if ('image_url' in body) payload.image_url = image_url
  if ('images' in body) payload.images = images
  if ('wood' in body) payload.wood = wood
  if ('mics' in body) payload.mics = mics
  if ('scale_length' in body) payload.scale_length = scale_length
  if ('neck_profile' in body) payload.neck_profile = neck_profile
  if ('fingerboard_radius' in body) payload.fingerboard_radius = fingerboard_radius
  if ('fingerboard_material' in body) payload.fingerboard_material = fingerboard_material
  if ('neck_construction' in body) payload.neck_construction = neck_construction
  if ('nut_width' in body) payload.nut_width = nut_width
  if ('frets' in body) payload.frets = frets
  if ('bridge' in body) payload.bridge = bridge
  if ('tuners' in body) payload.tuners = tuners
  if ('hardware_finish' in body) payload.hardware_finish = hardware_finish
  if ('controls' in body) payload.controls = controls
  if ('switching' in body) payload.switching = switching
  if ('origin' in body) payload.origin = origin
  if ('low_cost' in body) payload.low_cost = low_cost
  if ('year' in body && year !== null) payload.year = year
  if ('weight' in body && weight !== null) payload.weight = weight
  if ('listing_status' in body) {
    const ls = String(body.listing_status || '').trim().toLowerCase()
    if (ls !== 'available' && ls !== 'reserved') return { error: 'listing_status inválido' }
    payload.listing_status = ls
  }

  if (!partial && !payload.name) return { error: 'Invalid name' }
  if (!partial && !payload.slug) return { error: 'Invalid slug' }
  if (payload.image_url && !isLikelyUrl(payload.image_url)) return { error: 'Invalid image_url' }
  if (payload.images && payload.images.some((u) => !isLikelyUrl(u))) return { error: 'Invalid images URLs' }
  if (partial && Object.keys(payload).length === 0) return { error: 'No valid fields to update' }

  return { payload }
}

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const adminCatalog = url.searchParams.get('scope') === 'admin'
    const accessToken = await extractAccessToken(req)
    const showFullCatalog = Boolean(accessToken && adminCatalog)

    const privateHeaders = { 'Cache-Control': 'private, no-store' }
    const publicHeaders = {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, max-age=120',
    }

    if (showFullCatalog) {
      if (!isSupabaseAdminEnabled()) {
        return NextResponse.json({ error: 'Admin deshabilitado' }, { status: 503 })
      }
      const payload = await getAdminCatalogFromSupabase()
      return NextResponse.json(payload, { status: 200, headers: privateHeaders })
    }

    const payload = await getPublicCatalogRows({ includeReserved: false })
    return NextResponse.json(payload, { status: 200, headers: publicHeaders })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    if (!isSupabaseAdminEnabled()) {
      return NextResponse.json({ error: 'Admin mutaciones deshabilitadas temporalmente' }, { status: 503 })
    }
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

    const row = Array.isArray(data) ? data[0] : null
    if (row?.slug) revalidateProductPublicPaths(row.slug)

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    if (!isSupabaseAdminEnabled()) {
      return NextResponse.json({ error: 'Admin mutaciones deshabilitadas temporalmente' }, { status: 503 })
    }
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

    const row = Array.isArray(data) ? data[0] : null
    if (row?.slug) revalidateProductPublicPaths(row.slug)

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    if (!isSupabaseAdminEnabled()) {
      return NextResponse.json({ error: 'Admin mutaciones deshabilitadas temporalmente' }, { status: 503 })
    }
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

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id.trim())) {
      return NextResponse.json({ error: 'Invalid product id format' }, { status: 400 })
    }

    const idTrim = id.trim()
    const { data: existing, error: fetchErr } = await supabase
      .from('products')
      .select('id, slug, image_url, images')
      .eq('id', idTrim)
      .maybeSingle()

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: fetchErr.status || 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { error: delErr } = await supabase.from('products').delete().eq('id', idTrim)

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: delErr.status || 500 })
    }

    if (existing?.slug) revalidateProductPublicPaths(existing.slug)

    const storage = await removeProductFilesFromStorage([existing])

    return NextResponse.json({ success: true, deleted: [existing], storage }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
