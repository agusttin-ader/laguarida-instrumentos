const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'public'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

export function resolveImageUrl(src) {
  if (src == null) return null
  if (typeof src !== 'string') src = String(src)
  // Trim whitespace/control characters that can break Next/Image
  src = src.trim()
  if (!src) return null

  // Already absolute or data URL or public root path
  if (/^(https?:)|^(data:)|^\//i.test(src)) return src

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
