/**
 * Tarjeta editorial del encabezado de catálogo.
 * Imagen estática existente (sin /_next/image ni transformaciones Vercel).
 */
export default function CatalogEditorialCard() {
  return (
    <aside
      className="catalog-editorial-card"
      aria-label="Selección curada de La Guarida"
    >
      <div className="catalog-editorial-card__media" aria-hidden />
      <div className="catalog-editorial-card__overlay" aria-hidden />
      <p className="catalog-editorial-card__caption">Instrumentos con historia</p>
    </aside>
  )
}
