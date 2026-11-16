/** Cookies HttpOnly de sesión admin — dominio solo si coincide con el Host actual. */

function hostWithoutPort(host) {
  if (!host || typeof host !== 'string') return ''
  const trimmed = host.trim().toLowerCase()
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']')
    return end > 0 ? trimmed.slice(0, end + 1) : trimmed
  }
  return trimmed.split(':')[0] || ''
}

function normalizeCookieDomain(domain) {
  const d = typeof domain === 'string' ? domain.trim() : ''
  return d || ''
}

/** true si `host` puede recibir cookies con `domain` (p. ej. www.foo.com + .foo.com). */
export function hostMatchesCookieDomain(host, cookieDomain) {
  const h = hostWithoutPort(host)
  const raw = normalizeCookieDomain(cookieDomain)
  if (!h || !raw) return false
  const bare = raw.startsWith('.') ? raw.slice(1) : raw
  return h === bare || h.endsWith(`.${bare}`)
}

/** Dominio de cookie a usar para este request, o undefined (host-only) en localhost / mismatch. */
export function resolveAuthCookieDomain(requestHost) {
  const configured = normalizeCookieDomain(process.env.SITE_COOKIE_DOMAIN)
  if (!configured) return undefined
  if (!hostMatchesCookieDomain(requestHost, configured)) return undefined
  return configured
}

/**
 * @param {string | null | undefined} requestHost — header `Host`
 * @param {{ maxAge?: number }} [extra]
 */
export function buildAuthCookieOptions(requestHost, extra = {}) {
  const secure = process.env.NODE_ENV === 'production'
  const domain = resolveAuthCookieDomain(requestHost)
  const opts = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure,
    ...extra,
  }
  if (domain) opts.domain = domain
  return opts
}