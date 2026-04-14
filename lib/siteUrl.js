/** Canonical site origin (no trailing slash). Override with NEXT_PUBLIC_SITE_URL in production. */
const DEFAULT_SITE_URL = 'https://www.laguaridainstrumentos.com'

export function getSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim()
  return raw.replace(/\/+$/, '')
}

/** Absolute URL for a path starting with / (or bare segment). Home is `${base}/`. */
export function absoluteUrl(pathname = '/') {
  const base = getSiteUrl()
  if (!pathname || pathname === '/') return `${base}/`
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${p}`
}

/** If `url` is already absolute (http/https), return as-is; otherwise join with site origin. */
export function toAbsoluteUrl(url) {
  if (url == null || url === '') return null
  const s = String(url).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return absoluteUrl(s.startsWith('/') ? s : `/${s}`)
}
