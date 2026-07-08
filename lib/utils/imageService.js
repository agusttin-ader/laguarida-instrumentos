import resolveImageUrl from './imageHelpers'
import { withSupabaseImageTransform } from './supabaseImageTransform'
import { shouldReadCatalogFromBackup } from '../catalog/readSource'

// Centralized image service
// - Exposes a single `resolve` function consumers use to get a safe URL or null
// - Keeps backward compatibility with `image_url` and `images[]`
// - Catálogo local (/public): `forDisplay` devuelve la misma ruta; Next/Image aplica width/quality.
// - Supabase: `forDisplay` puede usar Image Transform si NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true.

/** Anchos objetivo por contexto (Next/Image en local; Supabase Transform si está activo). */
export const DISPLAY_PRESETS = {
  /** Grid / cards: liviano en mobile, más ancho en desktop */
  card: { width: 480, quality: 54 },
  carousel: { width: 640, quality: 58 },
  /** Ficha producto */
  galleryMain: { width: 1400, quality: 70 },
  galleryThumb: { width: 480, quality: 54 },
  lightbox: { width: 1800, quality: 76 },
  adminThumb: { width: 128, quality: 56 },
  hero: { width: 1200, quality: 68 },
  editorial: { width: 900, quality: 66 },
}

export function isLocalCatalogImage(url) {
  if (!url || typeof url !== 'string') return false
  const s = url.trim()
  return s.startsWith('/images/products/') || s.startsWith('/images/optimized/')
}

/** Evita doble optimización en `next/image` cuando la URL ya viene de Supabase Transform. */
export function shouldBypassNextOptimization(url) {
  if (!url || typeof url !== 'string') return false
  const s = url.trim()
  if (isLocalCatalogImage(s)) return false
  return (
    s.includes('supabase.co') &&
    (s.includes('/storage/v1/object/') || s.includes('/storage/v1/render/image/'))
  )
}

export function usesLocalCatalogImages() {
  return shouldReadCatalogFromBackup()
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
 * URL para pintar en la UI.
 * - Local: misma ruta en /public; el recorte lo hace `next/image` (quality + sizes del componente).
 * - Supabase: transform en CDN si NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true.
 * @param {'card'|'carousel'|'galleryMain'|'galleryThumb'|'lightbox'|'adminThumb'} [variant]
 */
export function forDisplay(src, variant = 'card') {
  const r = resolve(src)
  if (!r) return null
  if (isLocalCatalogImage(r)) return r
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

export default {
  resolve,
  forDisplay,
  isLocalCatalogImage,
  usesLocalCatalogImages,
  shouldBypassNextOptimization,
  isStoragePath,
  toPublicUrl,
  DISPLAY_PRESETS,
}
