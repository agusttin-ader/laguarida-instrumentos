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
export function getProductDisplayTitle(product, brandLogo) {
  const name = String(product?.name || product?.title || '').trim()
  if (!name || !brandLogo) return name

  const label = brandLogo.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    /^guitarra\s+/i,
    /^paul reed smith\s+/i,
    new RegExp(`^${label}\\s+`, 'i'),
    /^prs\s+/i,
  ]

  let title = name
  for (const pattern of patterns) {
    title = title.replace(pattern, '')
  }

  return title.trim() || name
}
