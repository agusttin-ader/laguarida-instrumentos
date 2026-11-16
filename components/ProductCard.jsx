'use client'

import dynamic from 'next/dynamic'
import ProductCardCatalogLite from './ProductCardCatalogLite'

const ProductCardGallery = dynamic(() => import('./ProductCardGallery'), {
  loading: () => null,
})

/**
 * Catálogo usa variante liviana (default maxGalleryImages=1). Galería multi-imagen en chunk aparte.
 */
export default function ProductCard({
  maxGalleryImages = 1,
  ...props
}) {
  if (maxGalleryImages <= 1) {
    return <ProductCardCatalogLite {...props} />
  }
  return <ProductCardGallery maxGalleryImages={maxGalleryImages} {...props} />
}