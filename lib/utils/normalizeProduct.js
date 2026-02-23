function formatPrice(price) {
  if (price == null) return undefined
  if (typeof price === 'number') return `U$S${price}`
  if (typeof price === 'string') {
    const trimmed = price.trim()
    // If it already contains a currency symbol, return as-is
    if (/^\$|^U\$S|^USD|^€|^EUR/.test(trimmed)) return trimmed
    // If numeric string, prefix with U$S
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `U$S${trimmed}`
    return trimmed
  }
  return String(price)
}

export default function normalizeProduct(raw = {}) {
  const id = raw.id ?? raw._id ?? raw.slug ?? raw.name ?? ''
  const slug = raw.slug ?? raw.id ?? ''
  const name = raw.name ?? raw.title ?? raw.product_name ?? ''
  const images = Array.isArray(raw.images)
    ? raw.images
    : raw.images
      ? [raw.images]
      : raw.image_url
        ? [raw.image_url]
        : []
  const image_url = raw.image_url ?? images[0] ?? ''
  const description = raw.description ?? raw.shortDescription ?? raw.body ?? ''
  const price = formatPrice(raw.price ?? raw.cost ?? raw.amount ?? raw.price_text)

  return {
    id,
    slug,
    name,
    images,
    image_url,
    description,
    price,
    // new spec fields
    mics: raw.mics ?? raw.pickups ?? undefined,
    wood: raw.wood ?? raw.bodyWood ?? undefined,
    model: raw.model ?? raw.type ?? undefined
  }
}
