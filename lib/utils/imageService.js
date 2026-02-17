import resolveImageUrl from './imageHelpers'

// Centralized image service
// - Exposes a single `resolve` function consumers use to get a safe URL or null
// - Keeps backward compatibility with `image_url` and `images[]`
// - Provides utility helpers for future Supabase Storage integration

export function resolve(src){
  if (src == null) return null
  // If an array was passed, pick the first non-empty item
  if (Array.isArray(src)) {
    src = src.find(Boolean) || src[0]
  }
  if (typeof src === 'string') src = src.trim()
  // Prefer already-resolved values (imageHelpers will handle further trimming)
  const resolved = resolveImageUrl(src)
  return resolved
}

export function isStoragePath(src){
  if (!src || typeof src !== 'string') return false
  return /^(storage:\/\/|supabase:\/\/)/i.test(src)
}

export function toPublicUrl(storagePath){
  // Delegate to resolve which already maps storage prefixes to public URLs
  return resolve(storagePath)
}

export default { resolve, isStoragePath, toPublicUrl }
