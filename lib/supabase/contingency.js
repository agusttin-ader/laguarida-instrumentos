/**
 * Contingencia automática: si Supabase devuelve límite de cuota o no responde,
 * dejamos de consultar la DB por un tiempo y el catálogo público usa products-backup.json.
 *
 * SUPABASE_CONTINGENCY_COOLDOWN_MS — cuánto dura el modo contingencia (default 15 min).
 * SUPABASE_CONTINGENCY_FAILURES — fallos seguidos antes de activar (default 2).
 */

const DEFAULT_COOLDOWN_MS = 15 * 60 * 1000
const DEFAULT_FAILURE_THRESHOLD = 2

let consecutiveFailures = 0
let contingencyUntil = 0
let lastReason = ''

function cooldownMs() {
  const raw = process.env.SUPABASE_CONTINGENCY_COOLDOWN_MS
  const n = raw ? Number(raw) : DEFAULT_COOLDOWN_MS
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_COOLDOWN_MS
}

function failureThreshold() {
  const raw = process.env.SUPABASE_CONTINGENCY_FAILURES
  const n = raw ? Number(raw) : DEFAULT_FAILURE_THRESHOLD
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_FAILURE_THRESHOLD
}

/** Errores que activan contingencia (cuota, rate limit, caída). */
export function isSupabaseContingencyError(error) {
  if (!error) return false
  const status = error.status ?? error.statusCode ?? error.code
  if (status === 429 || status === 503 || status === 502 || status === 504) return true
  const msg = String(error.message || error.msg || error || '').toLowerCase()
  const hints = [
    'rate limit',
    'too many requests',
    'quota',
    'over_request_rate',
    'exceeded',
    'usage limit',
    'resource exhausted',
    'connection',
    'timeout',
    'fetch failed',
    'econnrefused',
    'enotfound',
    'service unavailable',
  ]
  return hints.some((h) => msg.includes(h))
}

/** ¿Estamos en contingencia automática ahora? */
export function isContingencyActive() {
  if (Date.now() < contingencyUntil) return true
  if (contingencyUntil > 0 && Date.now() >= contingencyUntil) {
    contingencyUntil = 0
    consecutiveFailures = 0
    lastReason = ''
  }
  return false
}

export function getContingencyStatus() {
  return {
    active: isContingencyActive(),
    until: contingencyUntil > Date.now() ? new Date(contingencyUntil).toISOString() : null,
    reason: lastReason || null,
    consecutiveFailures,
  }
}

export function recordSupabaseSuccess() {
  consecutiveFailures = 0
  if (contingencyUntil > 0 && Date.now() >= contingencyUntil) {
    contingencyUntil = 0
    lastReason = ''
  }
}

export function recordSupabaseFailure(error) {
  if (!isSupabaseContingencyError(error)) {
    consecutiveFailures = 0
    return false
  }
  consecutiveFailures += 1
  lastReason = String(error?.message || error || 'Supabase unavailable').slice(0, 200)
  if (consecutiveFailures >= failureThreshold() || isContingencyActive()) {
    contingencyUntil = Date.now() + cooldownMs()
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[catalog-contingency] Catálogo público en backup local hasta',
        new Date(contingencyUntil).toISOString(),
        '—',
        lastReason
      )
    }
    return true
  }
  return false
}
