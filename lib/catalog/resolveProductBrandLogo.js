import { productSearchText } from './catalogTaxonomy'
import { SITE_MARK_SRC } from '../branding/logo'

/** Sub-marcas primero para no mostrar Fender/Gibson en unidades Squier/Epiphone. */
const PRODUCT_BRAND_LOGOS = [
  {
    id: 'squier',
    match: (text) => /\bsquier\b/i.test(text),
    src: '/images/brands/squier.svg',
    label: 'Squier',
  },
  {
    id: 'epiphone',
    match: (text) => /\bepiphone\b/i.test(text),
    src: '/images/brands/epiphone.svg',
    label: 'Epiphone',
  },
  {
    id: 'fender',
    match: (text) => /\bfender\b/i.test(text),
    src: '/images/brands/fender.svg',
    label: 'Fender',
  },
  {
    id: 'gibson',
    match: (text) => /\bgibson\b/i.test(text),
    src: '/images/brands/gibson.svg',
    label: 'Gibson',
  },
  {
    id: 'prs',
    match: (text) => /paul reed smith|\bpaul reed\b|\bprs\b/i.test(text),
    src: '/images/brands/prs.svg',
    label: 'PRS',
  },
  {
    id: 'ibanez',
    match: (text) => /\bibanez\b/i.test(text),
    src: '/images/brands/ibanez.svg',
    label: 'Ibanez',
  },
]

/** Solo el isotipo (sin wordmark) para placeholders de marcas fuera del catálogo principal. */
export const SITE_MARK_LOGO = {
  src: SITE_MARK_SRC,
  label: 'La Guarida',
  isSiteMark: true,
}

export function resolveProductBrandLogo(product) {
  const text = productSearchText(product)
  if (!text) return null

  for (const brand of PRODUCT_BRAND_LOGOS) {
    if (brand.match(text)) {
      return { src: brand.src, label: brand.label }
    }
  }

  return null
}

/** Logo para placeholder de imagen: marca conocida o isotipo La Guarida. */
export function resolveProductImageFallbackLogo(product) {
  return resolveProductBrandLogo(product) || SITE_MARK_LOGO
}

/** Título sin marca repetida cuando el bloque ya muestra el logo. */
export function getProductDisplayTitle(product, brandLogo, modelLogo) {
  const name = String(product?.name || product?.title || '').trim()
  if (!name) return name
  if (!brandLogo && !modelLogo) return name

  const patterns = [/^guitarra\s+/i, /^paul reed smith\s+/i, /^prs\s+/i]

  if (brandLogo?.label) {
    const label = brandLogo.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    patterns.push(new RegExp(`^${label}\\s+`, 'i'))
  }

  if (modelLogo?.id === 'custom-shop') {
    patterns.push(/^custom shop\s+/i)
  }
  if (modelLogo?.id === 'stratocaster') {
    patterns.push(/^stratocaster\s+/i, /^strat\s+/i)
  }
  if (modelLogo?.id === 'telecaster') {
    patterns.push(/^telecaster\s+/i, /^tele\s+/i)
  }
  if (modelLogo?.label && modelLogo.id !== 'custom-shop') {
    const modelLabel = modelLogo.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    patterns.push(new RegExp(`^${modelLabel}\\s+`, 'i'))
  }

  let title = name
  for (const pattern of patterns) {
    title = title.replace(pattern, '')
  }

  return title.trim() || name
}

/** Título visible en cabecera/ficha: nombre sin repetir la marca cuando hay logo. */
export function getProductIntroTitle(product, headerLogo) {
  const productName = String(product?.name || '').trim()
  if (!headerLogo) return productName

  const brandLabel = String(headerLogo.label || product?.brand || '').trim()
  if (!brandLabel) return productName

  const escaped = brandLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const withoutBrand = productName.replace(new RegExp(`^${escaped}\\s+`, 'i'), '').trim()
  return withoutBrand || productName
}
