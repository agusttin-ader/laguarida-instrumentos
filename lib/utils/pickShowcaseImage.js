import imageService from './imageService'

function imageBasename(url) {
  if (!url || typeof url !== 'string') return ''
  return url.split('?')[0].split('/').pop() || ''
}

function sameImage(a, b) {
  if (!a || !b) return false
  if (a === b) return true
  return imageBasename(a) === imageBasename(b)
}

/**
 * Imagen editorial para home.
 * En este catálogo la portada (`image_url`) suele ser frontal y `images[0]` el reverso.
 */
export function pickShowcaseImage(product = {}) {
  const primary = imageService.resolve(product.image_url)
  const gallery = (Array.isArray(product.images) ? product.images : [])
    .map((src) => imageService.resolve(src))
    .filter(Boolean)

  const excluded = new Set()
  const firstGallery = gallery[0]
  if (firstGallery && primary && !sameImage(firstGallery, primary)) {
    excluded.add(imageBasename(firstGallery))
  }

  const candidates = []
  const push = (url) => {
    if (!url) return
    if (excluded.has(imageBasename(url))) return
    if (candidates.some((item) => sameImage(item, url))) return
    candidates.push(url)
  }

  push(primary)
  for (const url of gallery) push(url)

  const pick = candidates[0] || null
  if (!pick) return null
  return imageService.forDisplay(pick, 'carousel') || pick
}
