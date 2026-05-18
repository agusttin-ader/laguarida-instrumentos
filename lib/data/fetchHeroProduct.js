import { getSupabaseServerClient, getSupabaseAdminClient } from '../supabase/server'
import { PRODUCT_LIST_COLUMNS } from './productColumns'
import { getBackupProducts } from './localProductsBackup'
import { SUPABASE_BLOCKED } from '../supabase/mode'
import normalizeProduct from '../utils/normalizeProduct'
import imageService from '../utils/imageService'

function hashString(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** http(s) absoluto o ruta raíz (misma origen); incluye Supabase local en http. */
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

/**
 * Por defecto no llama a la API de Storage: las URLs `/object/public/` bastan con bucket público.
 * Solo si `SUPABASE_STORAGE_SIGNED_URLS=true` pide URL firmada (bucket privado / ACL).
 */
async function maybeSignedPublicStorageUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (SUPABASE_BLOCKED) return url
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
  const normalized = rows
    .map((raw) => ({ raw, p: normalizeProduct(raw) }))
    .filter(({ p }) => (p.slug || p.id) && p.name)

  const withImg = normalized.filter(({ p }) => firstResolvedHeroImage(p) !== '')
  const poolBase = withImg.length ? withImg : normalized

  const ranked = poolBase.sort((a, b) => {
    const score = (x) =>
      Number(Boolean(x.p.price)) + Number(Boolean(x.p.description)) + Number(Boolean(x.p.image_url))
    return score(b.p) - score(a.p)
  })

  const pool = ranked.slice(0, Math.min(ranked.length, 12))
  if (!pool.length) return null
  const key = dayKey != null && dayKey !== '' ? dayKey : new Date().toISOString().slice(0, 10)
  const idx = hashString(key) % pool.length
  return pool[idx]
}

/**
 * Un producto destacado para el hero (server-only, una query, sin imágenes extra).
 * @returns {Promise<{ name: string, image_url: string, category: string, slug: string } | null>}
 */
export async function fetchHeroProduct() {
  try {
    let rows = getBackupProducts({ includeReserved: false }).slice(0, 36)
    if (!SUPABASE_BLOCKED) {
      const supabase = getSupabaseServerClient()
      const { data, error } = await supabase
        .from('products')
        .select(`${PRODUCT_LIST_COLUMNS}, created_at`)
        .order('created_at', { ascending: false })
        .limit(36)
      rows = (!error && Array.isArray(data) && data.length)
        ? data
        : rows
    }
    if (!rows.length) return null

    const dayKey = new Date().toISOString().slice(0, 10)
    const picked = pickFeaturedFromRows(rows, dayKey)
    if (!picked) return null

    let { raw, p } = picked
    let resolved = firstResolvedHeroImage(p)

    // Si el destacado del día no tiene foto resoluble, usar el primer producto del lote que sí tenga imagen de catálogo.
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
