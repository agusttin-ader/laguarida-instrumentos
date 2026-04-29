import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './constants'

export function normalizeLocale(raw) {
  if (raw == null || raw === '') return DEFAULT_LOCALE
  const s = String(raw).trim().toLowerCase()
  if (SUPPORTED_LOCALES.includes(s)) return s
  return DEFAULT_LOCALE
}
