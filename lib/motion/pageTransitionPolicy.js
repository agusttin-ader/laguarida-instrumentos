/** Rutas de tienda / conversión: sin fade de página (navegación inmediata). */
const INTERNAL_STORE_ROUTE =
  /^\/(catalogo|favoritos|guitars)(\/|$)/

/** Contenido editorial: fade suave solo en desktop. */
const EDITORIAL_ROUTE = /^\/(privacidad|terminos)$/

export function shouldAnimatePageEnter(pathname, { isMobile, prefersReducedMotion } = {}) {
  if (prefersReducedMotion) return false
  if (isMobile) return false
  if (typeof pathname !== 'string') return false

  const path = pathname === '' ? '/' : pathname
  if (path === '/') return true
  if (EDITORIAL_ROUTE.test(path)) return true
  if (INTERNAL_STORE_ROUTE.test(path)) return false

  return false
}