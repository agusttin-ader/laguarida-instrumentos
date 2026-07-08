/** Logo de marca o línea de modelo en la ficha de producto. */
export default function ProductDetailLogoMark({ logo, size = 'hero', className = '' }) {
  if (!logo?.src) return null

  const sizeClass = size === 'compact' ? 'product-detail-logo--compact' : 'product-detail-logo--hero'
  const variantClass =
    logo.variant === 'custom-shop'
      ? 'product-detail-logo--custom-shop'
      : logo.variant === 'wide'
        ? 'product-detail-logo--wide'
        : ''

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt={logo.label || ''}
      className={`product-detail-logo ${sizeClass} ${variantClass} ${className}`.trim()}
    />
  )
}
