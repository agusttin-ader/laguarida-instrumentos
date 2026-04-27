import resolveImageUrl from './imageHelpers'
import { withSupabaseImageTransform } from './supabaseImageTransform'

// Centralized image service
// - Exposes a single `resolve` function consumers use to get a safe URL or null
// - Keeps backward compatibility with `image_url` and `images[]`
// - Provides utility helpers for future Supabase Storage integration

/** Anchos de salida con Supabase Image Transform (NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true). */
const DISPLAY_PRESETS = {
  card: { width: 900, quality: 72 },
  hero: { width: 1920, quality: 72 },
  carousel: { width: 900, quality: 70 },
  galleryMain: { width: 1600, quality: 68 },
  galleryThumb: { width: 540, quality: 65 },
  lightbox: { width: 2048, quality: 78 },
}

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

/**
 * URL para pintar en la UI: opcionalmente vía Supabase Image Transform (menos KB, más rápido).
 * @param {'card'|'hero'|'carousel'|'galleryMain'|'galleryThumb'|'lightbox'} [variant]
 */
export function forDisplay(src, variant = 'card') {
  const r = resolve(src)
  if (!r) return null
  const opts = DISPLAY_PRESETS[variant] || DISPLAY_PRESETS.card
  return withSupabaseImageTransform(r, opts)
}

export function isStoragePath(src){
  if (!src || typeof src !== 'string') return false
  return /^(storage:\/\/|supabase:\/\/)/i.test(src)
}

export function toPublicUrl(storagePath){
  // Delegate to resolve which already maps storage prefixes to public URLs
  return resolve(storagePath)
}

export default { resolve, forDisplay, isStoragePath, toPublicUrl }
