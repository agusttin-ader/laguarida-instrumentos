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
