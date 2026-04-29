const MODAL_BASIC_EXTRA_KEYS = ['model', 'wood', 'mics', 'scale_length', 'neck_profile']
const MODAL_TECH_KEYS = [
  'fingerboard_radius', 'fingerboard_material', 'neck_construction', 'nut_width', 'frets',
  'bridge', 'tuners', 'hardware_finish', 'controls', 'switching', 'origin', 'year', 'weight',
]

export const PRODUCT_CREATE_DRAFT_KEY = 'admin:create:draft:v1'

export function hasMeaningfulProductCreateDraft(f) {
  if (!f || typeof f !== 'object') return false
  const keys = ['name', 'price', 'description', 'highlights', 'image_url', 'model', 'wood', 'mics']
  const hasText = keys.some((k) => String(f[k] || '').trim() !== '')
  const hasImages = Array.isArray(f.images) && f.images.length > 0
  return hasText || hasImages
}

export function formHasBasicExtra(f) {
  if (!f || typeof f !== 'object') return false
  return MODAL_BASIC_EXTRA_KEYS.some((k) => String(f[k] ?? '').trim() !== '')
}

export function formHasTechnical(f) {
  if (!f || typeof f !== 'object') return false
  return MODAL_TECH_KEYS.some((k) => {
    const v = f[k]
    if (v == null) return false
    return String(v).trim() !== ''
  })
}
