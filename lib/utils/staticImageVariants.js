/**
 * Variantes estáticas bajo public/images/products/<slug>/variants/
 * Generadas offline con `npm run images:variants` (sharp) — sin /_next/image ni CDN pagos.
 *
 * Convención:
 *   /images/products/<slug>/<archivo>.jpg
 *   → /images/products/<slug>/variants/<archivo>.card.webp
 *   → /images/products/<slug>/variants/<archivo>.main.webp
 *   → /images/products/<slug>/variants/<archivo>.large.webp
 */

const LOCAL_PRODUCT_RE = /^\/images\/products\/([^/]+)\/(.+)$/i

/** Archivos físicos generados por el script. */
export const STATIC_VARIANT_FILES = {
  card: { width: 480, quality: 58, suffix: 'card' },
  main: { width: 1280, quality: 70, suffix: 'main' },
  large: { width: 1600, quality: 74, suffix: 'large' },
}

/** Preset de UI → archivo estático. */
const PRESET_TO_FILE = {
  card: 'card',
  carousel: 'card',
  galleryThumb: 'card',
  adminThumb: 'card',
  galleryMain: 'main',
  editorial: 'main',
  hero: 'main',
  lightbox: 'large',
}

export function isLocalProductImagePath(url) {
  if (!url || typeof url !== 'string') return false
  const s = url.trim()
  if (!s.startsWith('/images/products/')) return false
  if (s.includes('/variants/')) return false
  return LOCAL_PRODUCT_RE.test(s)
}

function stripExtension(fileName) {
  return String(fileName || '').replace(/\.[a-z0-9]+$/i, '')
}

function encodePathKeepSlashes(relPath) {
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
 * URL de variante estática, o null si no aplica (remoto / ya variante / ruta inválida).
 * No comprueba existencia en disco: el componente hace fallback al original si 404.
 */
export function getStaticVariantUrl(src, preset = 'card') {
  if (!isLocalProductImagePath(src)) return null
  const trimmed = src.trim()
  const match = trimmed.match(LOCAL_PRODUCT_RE)
  if (!match) return null

  const slug = match[1]
  const rest = match[2]
  if (!rest || rest.startsWith('variants/')) return null

  const fileKey = PRESET_TO_FILE[preset] || PRESET_TO_FILE.card
  const spec = STATIC_VARIANT_FILES[fileKey]
  if (!spec) return null

  const baseName = stripExtension(rest.split('/').pop() || rest)
  if (!baseName) return null

  const variantFile = `${baseName}.${spec.suffix}.webp`
  return `/images/products/${encodePathKeepSlashes(slug)}/variants/${encodePathKeepSlashes(variantFile)}`
}
