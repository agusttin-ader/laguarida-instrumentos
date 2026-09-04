/**
 * Modos de catálogo y Supabase.
 *
 * Tienda pública (home, catálogo, fichas, sitemap): SIEMPRE lee
 * `data/products-backup.json` + `public/images/products/<slug>/`.
 * Cero llamadas a Supabase para mostrar el catálogo.
 *
 * Supabase se usa solo para:
 *   - Login del panel admin
 *   - CRUD remoto (vos o tu cliente cargan guitarras)
 *   - `npm run sync` → baja cambios a JSON + imágenes locales
 *
 * Variables (.env.local o Vercel):
 *   SUPABASE_FULLY_BLOCKED=true → apagar admin y DB; solo backup local
 */

function envFlag(name) {
  const v = process.env[name]
  if (v === undefined || v === null || String(v).trim() === '') return null
  return String(v).trim().toLowerCase() === 'true'
}

/** Catálogo público: siempre backup local (dev y producción). */
export function isLocalCatalogEnabled() {
  return true
}

/** Contingencia total: sin admin ni conexión a Supabase. */
export function isSupabaseFullyBlocked() {
  return envFlag('SUPABASE_FULLY_BLOCKED') === true
}

/** Login y altas/edición en panel (requiere Supabase). */
export function isSupabaseAdminEnabled() {
  return !isSupabaseFullyBlocked()
}

/** @deprecated Usar isLocalCatalogEnabled() o isSupabaseFullyBlocked(). */
export const SUPABASE_BLOCKED = isSupabaseFullyBlocked()
