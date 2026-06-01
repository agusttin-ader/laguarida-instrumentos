import { getSupabaseAdminClient } from '../supabase/server'
import { useLocalCatalog } from '../supabase/mode'
import { getPublicCatalogRows } from './publicCatalog'
import normalizeProduct from '../utils/normalizeProduct'
import imageService from '../utils/imageService'

function hashString(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function isHeroImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  const u = url.trim()
  if (!u) return false
  if (u.startsWith('/')) return true
  return /^https?:\/\//i.test(u)
}

function coerceImageRef(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'object') {
    if (typeof v.url === 'string') return v.url.trim()
    if (typeof v.src === 'string') return v.src.trim()
  }
  return ''
}

function firstResolvedHeroImage(p) {
  const candidates = []
  const a = coerceImageRef(p.image_url)
  if (a) candidates.push(a)
  if (Array.isArray(p.images)) {
    for (const item of p.images) {
      const s = coerceImageRef(item)
      if (s) candidates.push(s)
    }
  }
  for (const c of candidates) {
    const resolved = imageService.resolve(c)
    if (resolved && isHeroImageUrl(resolved)) return resolved
  }
  return ''
}

function parseStoragePublicPath(url) {
  try {
    const u = new URL(url)
    const marker = '/storage/v1/object/public/'
    const idx = u.pathname.indexOf(marker)
    if (idx === -1) return null
    const rest = u.pathname.slice(idx + marker.length)
    const slash = rest.indexOf('/')
    if (slash === -1) return null
    const bucket = rest.slice(0, slash)
    const encodedPath = rest.slice(slash + 1)
    if (!bucket || !encodedPath) return null
    const path = decodeURIComponent(encodedPath.replace(/\+/g, ' '))
    return { bucket, path }
  } catch {
    return null
  }
}

async function maybeSignedPublicStorageUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (useLocalCatalog()) return url
  const trimmed = url.trim()
  if (!/^https?:\/\//i.test(trimmed)) return trimmed
  if (!trimmed.includes('/storage/v1/object/public/')) return trimmed
  if (process.env.SUPABASE_STORAGE_SIGNED_URLS !== 'true') return trimmed

  let admin = null
  try {
    admin = getSupabaseAdminClient()
  } catch {
    return trimmed
  }

  const parsed = parseStoragePublicPath(trimmed)
  if (!parsed) return trimmed

  const { data, error } = await admin.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, 3600)

  if (error || !data?.signedUrl) return trimmed
  return data.signedUrl
}

function pickFeaturedFromRows(rows, dayKey) {
  const eligible = rows
    .map((raw) => {
      const p = normalizeProduct(raw)
      if (!(p.slug || p.id) || !p.name) return null
      return { raw, p }
    })
    .filter(Boolean)
  if (!eligible.length) return null
  const idx = hashString(dayKey) % eligible.length
  return eligible[idx]
}

export async function fetchHeroProduct() {
  try {
    const rows = (await getPublicCatalogRows({ includeReserved: false })).slice(0, 36)
    if (!rows.length) return null

    const dayKey = new Date().toISOString().slice(0, 10)
    const picked = pickFeaturedFromRows(rows, dayKey)
    if (!picked) return null

    let { raw, p } = picked
    let resolved = firstResolvedHeroImage(p)

    if (!resolved) {
      for (const row of rows) {
        const p2 = normalizeProduct(row)
        if (!(p2.slug || p2.id) || !p2.name) continue
        const r2 = firstResolvedHeroImage(p2)
        if (r2) {
          raw = row
          p = p2
          resolved = r2
          break
        }
      }
    }

    const image_url = resolved ? await maybeSignedPublicStorageUrl(resolved) : ''
    const category = [raw.brand, raw.model].filter(Boolean).join(' · ') || ''

    return {
      name: p.name,
      image_url: image_url || '',
      category,
      slug: p.slug ? String(p.slug) : '',
    }
  } catch {
    return null
  }
}
