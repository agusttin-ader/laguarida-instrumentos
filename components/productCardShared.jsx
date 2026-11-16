/** Alineado a grilla 2-col mobile / 3-col lg (evita pedir más ancho del slot real). */
export const CARD_IMAGE_SIZES =
  '(max-width: 767px) 48vw, (max-width: 1023px) 48vw, (max-width: 1279px) 34vw, 24vw'

export const CARD_IMAGE_SIZES_CAROUSEL =
  '(max-width: 767px) 88vw, (max-width: 1023px) 48vw, (max-width: 1279px) 34vw, 24vw'

export function ProductCardImageFallback({ logo }) {
  if (!logo?.src) return null
  return (
    <img
      src={logo.src}
      alt=""
      className={`product-card-image-fallback__logo${
        logo.isSiteMark ? ' product-card-image-fallback__logo--site' : ''
      }`}
    />
  )
}

export function collectProductSpecs(p) {
  const specs = []
  if (p.mics) specs.push(String(p.mics).trim())
  if (p.wood) specs.push(String(p.wood).trim())
  if (p.model) specs.push(String(p.model).trim())
  const visibleSpecs = specs.slice(0, 2)
  const hiddenSpecsCount = Math.max(0, specs.length - visibleSpecs.length)
  return { specs, visibleSpecs, hiddenSpecsCount }
}