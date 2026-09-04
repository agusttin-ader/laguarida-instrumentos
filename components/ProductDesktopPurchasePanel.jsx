'use client'

import ProductPageCTA from './ProductPageCTA'
import ProductShareAndFavorite from './ProductShareAndFavorite'
import ProductDetailLogoMark from './ProductDetailLogoMark'
import ProductPurchaseTrustSignals from './ProductPurchaseTrustSignals'

/**
 * Panel de compra sticky (solo desktop lg+).
 * Reutiliza CTA/WhatsApp y favoritos existentes.
 */
export default function ProductDesktopPurchasePanel({
  brandLabel,
  headerLogo = null,
  title,
  priceLabel,
  consultHref,
  productName,
  slug,
  productUrl,
}) {
  return (
    <aside
      className="product-desktop-buy-panel"
      aria-label="Compra y consulta"
    >
      <div className="product-desktop-buy-panel__inner">
        {headerLogo ? (
          <ProductDetailLogoMark logo={headerLogo} size="compact" className="mb-3" />
        ) : null}
        {brandLabel ? (
          <p className="product-desktop-buy-panel__brand">{brandLabel}</p>
        ) : null}
        <p className="product-desktop-buy-panel__title product-detail-title">{title}</p>
        {priceLabel ? (
          <p className="price-highlight product-desktop-buy-panel__price">{priceLabel}</p>
        ) : null}
        <p className="product-desktop-buy-panel__status">
          <span className="product-desktop-buy-panel__status-dot" aria-hidden />
          Disponible
        </p>

        <ProductPurchaseTrustSignals className="product-trust-signals--panel mt-3.5" />

        <div className="product-desktop-buy-panel__actions">
          <ProductPageCTA
            price={priceLabel}
            consultHref={consultHref}
            productName={productName}
            showPrice={false}
            ctaId={null}
            buttonVariant="whatsapp"
          />
          <div className="product-desktop-buy-panel__secondary">
            <ProductShareAndFavorite slug={slug} name={productName} url={productUrl} />
          </div>
        </div>
      </div>
    </aside>
  )
}
