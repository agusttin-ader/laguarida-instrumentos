const HERO_VARIANT_DIR = '/images/hero/variants'

function stemFromHeroSrc(src) {
  const file = String(src || '').split('/').pop() || ''
  return file.replace(/\.[a-z0-9]+$/i, '')
}

function preferWebpSrc(src) {
  if (!src || typeof src !== 'string') return src
  if (/\.webp$/i.test(src)) return src
  return src.replace(/\.(jpe?g|png|avif)$/i, '.webp')
}

/**
 * URLs responsive para fondos del hero (variantes en /images/hero/variants/).
 * Si no existen aún, hace fallback al WebP original en /images/hero/.
 */
export function getHeroDisplaySources(src) {
  if (!src || typeof src !== 'string') {
    return { mobile: src, desktop: src, fallback: src }
  }

  const trimmed = src.trim()
  if (!trimmed.startsWith('/images/hero/')) {
    return { mobile: trimmed, desktop: trimmed, fallback: trimmed }
  }

  const stem = stemFromHeroSrc(trimmed)
  const mobile = `${HERO_VARIANT_DIR}/${stem}.mobile.webp`
  const desktop = `${HERO_VARIANT_DIR}/${stem}.desktop.webp`
  const fallback = preferWebpSrc(trimmed)

  return { mobile, desktop, fallback }
}

export function enrichHeroSlide(slide) {
  if (!slide?.src) return slide
  const sources = getHeroDisplaySources(slide.src)
  return {
    ...slide,
    ...sources,
  }
}
