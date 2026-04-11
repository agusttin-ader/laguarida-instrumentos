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

  // URLs absolutas (HTTP/HTTPS) o data: — tal cual
  if (/^https?:/i.test(src)) return src
  if (/^data:/i.test(src)) return src

  // Ruta de sitio que en realidad apunta al storage público de Supabase (guardada sin host).
  // Sin esto, en el cliente la imagen se pide al dominio del sitio y queda rota.
  if (src.startsWith('/') && SUPABASE_URL && src.includes('/storage/v1/object/public/')) {
    const base = SUPABASE_URL.replace(/\/$/, '')
    return `${base}${src}`
  }

  // Otras rutas locales (/images/..., etc.)
  if (src.startsWith('/')) return src

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

  // Fallback: return null so callers can render a placeholder
  return null
}

export default resolveImageUrl
