// Debe coincidir con el bucket de `app/api/upload-image/route.js` (`products`).
const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'products'
// Misma prioridad que lib/supabase/server.js: en servidor suele existir SUPABASE_URL sin prefijo NEXT_PUBLIC.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

export function resolveImageUrl(src) {
  if (src == null) return null
  if (typeof src !== 'string') src = String(src)
  // Trim whitespace/control characters that can break Next/Image
  src = src.trim()
  if (!src) return null

  // URLs absolutas (HTTP/HTTPS) o data: — tal cual (incl. query de firmas / transforms)
  if (/^https?:/i.test(src)) return src
  if (/^data:/i.test(src)) return src

  // Rutas /storage/... de Supabase: sin host base no deben devolverse tal cual (se pedirían al dominio del sitio).
  if (src.startsWith('/')) {
    if (src.includes('/storage/v1/object/public/')) {
      if (!SUPABASE_URL) return null
      const base = SUPABASE_URL.replace(/\/$/, '')
      return `${base}${src}`
    }
    return src
  }

  // Handle explicit storage prefixes
  if (src.startsWith('storage://')) {
    const raw = src.replace(/^storage:\/\//, '')
    return SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/${DEFAULT_BUCKET}/${encodePath(raw)}` : null
  }
  if (src.startsWith('supabase://')) {
    const raw = src.replace(/^supabase:\/\//, '')
    return SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/${DEFAULT_BUCKET}/${encodePath(raw)}` : null
  }

  // If it's a plain path (bucket/path or path/to/file), treat as storage path
  if (SUPABASE_URL) {
    // If the value looks like bucket/name/file.jpg (contains a /), assume it's the path
    const path = src
    return `${SUPABASE_URL}/storage/v1/object/public/${DEFAULT_BUCKET}/${encodePath(path)}`
  }

  return null
}

export default resolveImageUrl
