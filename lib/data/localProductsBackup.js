import backupRows from '../../data/products-backup.json'

function isAbsoluteOrRootUrl(value) {
  if (!value || typeof value !== 'string') return false
  const v = value.trim()
  if (!v) return false
  if (v.startsWith('/')) return true
  return /^https?:\/\//i.test(v)
}

function encodePathSegments(relPath = '') {
  return relPath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function toLocalProductImageUrl(slug, value) {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (isAbsoluteOrRootUrl(trimmed)) return trimmed
  if (!slug) return ''
  const safeSlug = encodeURIComponent(String(slug).trim())
  const safeFile = encodePathSegments(trimmed)
  if (!safeFile) return ''
  return `/images/products/${safeSlug}/${safeFile}`
}

function normalizeBackupRow(row = {}) {
  const slug = String(row.slug || '').trim()
  const imagesRaw = Array.isArray(row.images) ? row.images : []
  const images = imagesRaw
    .map((item) => toLocalProductImageUrl(slug, String(item || '')))
    .filter(Boolean)
  const primary = toLocalProductImageUrl(slug, String(row.image_url || ''))
  const image_url = primary || images[0] || ''
  return {
    ...row,
    slug,
    image_url,
    images: images.length ? images : (image_url ? [image_url] : []),
    listing_status: String(row.listing_status || 'available').toLowerCase() === 'reserved'
      ? 'reserved'
      : 'available',
  }
}

function getRows() {
  if (!Array.isArray(backupRows)) return []
  return backupRows.map(normalizeBackupRow).filter((row) => row.slug && row.name)
}

export function getBackupProducts({ includeReserved = false } = {}) {
  const rows = getRows()
  const filtered = includeReserved
    ? rows
    : rows.filter((row) => row.listing_status !== 'reserved')
  return [...filtered].sort((a, b) => {
    const aDate = new Date(a.created_at || 0).getTime()
    const bDate = new Date(b.created_at || 0).getTime()
    return bDate - aDate
  })
}

export function getBackupProductBySlug(slug) {
  const s = String(slug || '').trim()
  if (!s) return null
  return getBackupProducts({ includeReserved: false }).find((row) => row.slug === s) || null
}
