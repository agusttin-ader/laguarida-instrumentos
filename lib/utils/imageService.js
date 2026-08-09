import resolveImageUrl from './imageHelpers'
import { withSupabaseImageTransform } from './supabaseImageTransform'
import { getStaticVariantUrl, isLocalProductImagePath } from './staticImageVariants'
import { supabaseStorageUrlToLocalProductUrl } from './localImageRewrite'
import { isLocalCatalogEnabled } from '../supabase/mode'

// Centralized image service
// - Exposes a single `resolve` function consumers use to get a safe URL or null
// - Keeps backward compatibility with `image_url` and `images[]`
// - Catálogo local (/public): `forDisplay` apunta a variantes WebP estáticas (card/main/large).
// - Supabase: `forDisplay` puede usar Image Transform si NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true.
// - Nunca depende del Image Optimization on-demand de Vercel (/_next/image).

/** Anchos objetivo por contexto (variantes locales; Supabase Transform si está activo). */
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

export function resolve(src){
  if (src == null) return null
  // If an array was passed, pick the first non-empty item
  if (Array.isArray(src)) {
    src = src.find(Boolean) || src[0]
  }
  if (typeof src === 'string') src = src.trim()
  const resolved = resolveImageUrl(src)
  if (!resolved) return null
  if (isLocalCatalogEnabled()) {
    const local = supabaseStorageUrlToLocalProductUrl(resolved)
    if (local) return local
  }
  return resolved
}

/**
 * URL para pintar en la UI.
 * - Local: variante WebP estática si el preset aplica; si no existe en disco, el <img> hace fallback al original.
 * - Supabase: transform en CDN si NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true.
 * @param {'card'|'carousel'|'galleryMain'|'galleryThumb'|'lightbox'|'adminThumb'|'hero'|'editorial'} [variant]
 */
export function forDisplay(src, variant = 'card') {
  const r = resolve(src)
  if (!r) return null
  if (isLocalProductImagePath(r)) {
    return getStaticVariantUrl(r, variant) || r
  }
  if (isLocalCatalogImage(r)) return r
  if (isLocalCatalogEnabled()) return r
  const opts = DISPLAY_PRESETS[variant] || DISPLAY_PRESETS.card
  return withSupabaseImageTransform(r, opts)
}

export default {
  resolve,
  forDisplay,
  isLocalCatalogImage,
  DISPLAY_PRESETS,
}
