import { productSearchText } from './catalogTaxonomy'

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

/** Título en ficha: logo de marca + kicker de modelo (sin wordmarks de línea). */
export function getProductDetailDisplayTitle(product, brandLogo, modelLabel = '') {
  let title = getProductDisplayTitle(product, brandLogo)
  const model = String(modelLabel || product?.model || '').trim()
  if (model && brandLogo) {
    const escaped = model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    title = title.replace(new RegExp(`^${escaped}\\s+`, 'i'), '')
  }
  if (brandLogo && /\bcustom shop\b/i.test(String(product?.name || ''))) {
    title = title.replace(/^custom shop\s+/i, '')
  }
  return title.trim() || String(product?.name || '').trim()
}
