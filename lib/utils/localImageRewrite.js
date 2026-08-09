/**
 * Con catálogo local, reescribe URLs de Supabase Storage a rutas en /public/images/products/.
 * Así la UI usa variantes WebP estáticas sin pegarle al CDN de Supabase ni a Vercel Image Optimizer.
 */

const SUPABASE_OBJECT_PUBLIC_RE =
  /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/(?:object|render\/image)\/public\/([^?#]+)/i

function encodePathKeepSlashes(relPath = '') {
  return String(relPath || '')
    .split('/')
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment))
      } catch {
        return encodeURIComponent(segment)
      }
    })
    .join('/')
}

/**
 * @param {string | null | undefined} url
 * @returns {string | null} `/images/products/<slug>/<file>` o null si no aplica
 */
export function supabaseStorageUrlToLocalProductUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const m = trimmed.match(SUPABASE_OBJECT_PUBLIC_RE)
  if (!m) return null

  const pathRest = decodeURIComponent(m[1])
  const parts = pathRest.split('/').filter(Boolean)
  const bucket = parts[0]
  if (bucket !== 'products' || parts.length < 3) return null

  const slug = parts[1]
  const file = parts.slice(2).join('/')
  if (!slug || !file || file.startsWith('variants/')) return null

  return `/images/products/${encodePathKeepSlashes(slug)}/${encodePathKeepSlashes(file)}`
}

export default supabaseStorageUrlToLocalProductUrl
