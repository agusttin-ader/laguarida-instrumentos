import { productIsCustomShopGuitar, productSearchText } from './catalogTaxonomy'

const MODEL_LOGO_LABELS = {
  stratocaster: 'Stratocaster',
  telecaster: 'Telecaster',
  'custom-shop': 'Custom Shop',
  squier: 'Squier',
  epiphone: 'Epiphone',
}

/** Logos / wordmarks para líneas de modelo en el sidebar del catálogo */
export const MODEL_GROUP_LOGOS = {
  stratocaster: '/images/brands/stratocaster.svg',
  telecaster: '/images/brands/telecaster.svg',
  'custom-shop': '/images/brands/fender-custom-shop.svg',
  squier: '/images/brands/squier.svg',
  epiphone: '/images/brands/epiphone.svg',
}

export function getModelGroupLogo(modelId) {
  return MODEL_GROUP_LOGOS[modelId] ?? null
}

export function getModelGroupLogoSidebarClass(modelId) {
  if (!getModelGroupLogo(modelId)) return ''
  if (modelId === 'custom-shop') {
    return 'catalog-sidebar-item__model-logo catalog-sidebar-item__model-logo--custom-shop'
  }
  if (modelId === 'stratocaster' || modelId === 'telecaster') {
    return 'catalog-sidebar-item__model-logo catalog-sidebar-item__model-logo--wide'
  }
  return 'catalog-sidebar-item__model-logo'
}

export function getModelGroupLogoHeaderClass(modelId) {
  if (!getModelGroupLogo(modelId)) return 'catalog-model-header__logo'
  if (modelId === 'custom-shop') {
    return 'catalog-model-header__logo catalog-model-header__logo--custom-shop'
  }
  if (modelId === 'stratocaster' || modelId === 'telecaster') {
    return 'catalog-model-header__logo catalog-model-header__logo--wide'
  }
  return 'catalog-model-header__logo'
}

function getModelLogoVariant(modelId) {
  if (modelId === 'custom-shop') return 'custom-shop'
  if (modelId === 'stratocaster' || modelId === 'telecaster') return 'wide'
  return 'default'
}

/** Logo de línea/modelo para fichas de producto (Custom Shop, Strat, Tele, etc.). */
export function resolveProductModelLogo(product) {
  const text = productSearchText(product)
  if (!text) return null

  const rules = [
    { id: 'custom-shop', match: () => productIsCustomShopGuitar(product) },
    { id: 'squier', match: () => /\bsquier\b/i.test(text) },
    { id: 'epiphone', match: () => /\bepiphone\b/i.test(text) },
    {
      id: 'stratocaster',
      match: () =>
        /stratocaster|\bstrat\b/i.test(text) &&
        !productIsCustomShopGuitar(product) &&
        !/\brgx\b/i.test(text) &&
        !/\bsquier\b/i.test(text),
    },
    {
      id: 'telecaster',
      match: () =>
        /telecaster|\btele\b/i.test(text) &&
        !productIsCustomShopGuitar(product) &&
        !/\bsquier\b/i.test(text),
    },
  ]

  for (const rule of rules) {
    if (!rule.match()) continue
    const src = getModelGroupLogo(rule.id)
    if (!src) continue
    return {
      id: rule.id,
      src,
      label: MODEL_LOGO_LABELS[rule.id] || rule.id,
      variant: getModelLogoVariant(rule.id),
    }
  }

  return null
}
