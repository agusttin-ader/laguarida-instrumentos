/**
 * Extrae el valor numérico del precio para JSON-LD (Schema.org espera número).
 * Acepta: número, "U$S1500", "$1,500", "1500", etc.
 */
export function parseNumericPriceForSchema(price) {
  if (price == null) return null
  if (typeof price === 'number' && !Number.isNaN(price)) return price
  const str = String(price).replace(/\s+/g, '')
  const match = str.match(/[\d.,]+/)
  if (!match) return null
  const num = parseFloat(match[0].replace(',', '.'))
  return Number.isNaN(num) ? null : num
}

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

/** Postgres/JSON a veces devuelve `images` como string JSON; normalizamos a string[]. */
function normalizeImagesField(rawImages, fallbackUrl) {
  const fb = fallbackUrl != null && String(fallbackUrl).trim() !== '' ? String(fallbackUrl).trim() : ''
  let list = []
  if (rawImages == null) {
    list = []
  } else if (Array.isArray(rawImages)) {
    list = rawImages.map((x) => (x == null ? '' : String(x).trim())).filter(Boolean)
  } else if (typeof rawImages === 'string') {
    const s = rawImages.trim()
    if (!s) list = []
    else if (s.startsWith('[')) {
      try {
        const p = JSON.parse(s)
        list = Array.isArray(p) ? p.map((x) => String(x).trim()).filter(Boolean) : [s]
      } catch {
        list = [s]
      }
    } else {
      list = [s]
    }
  } else {
    list = [String(rawImages).trim()].filter(Boolean)
  }

  if (!list.length && fb) list = [fb]
  return list
}

export default function normalizeProduct(raw = {}) {
  const id = raw.id ?? raw._id ?? raw.slug ?? raw.name ?? ''
  const slug = raw.slug ?? raw.id ?? ''
  const name = raw.name ?? raw.title ?? raw.product_name ?? ''
  const trimmedMain =
    raw.image_url != null && String(raw.image_url).trim() !== '' ? String(raw.image_url).trim() : ''
  let images = normalizeImagesField(raw.images, null)
  if (!Array.isArray(raw.images) && raw.images == null && trimmedMain) {
    images = [trimmedMain]
  }
  const image_url = trimmedMain || (images[0] ?? '') || ''
  const description = raw.description ?? raw.shortDescription ?? raw.body ?? ''
  const price = formatPrice(raw.price ?? raw.cost ?? raw.amount ?? raw.price_text)
  const aggregate_rating = raw.aggregate_rating ?? raw.aggregateRating ?? raw.rating_value ?? raw.ratingValue ?? undefined
  const review_count = raw.review_count ?? raw.reviewCount ?? raw.rating_count ?? raw.ratingCount ?? undefined
  const reviews = Array.isArray(raw.reviews) ? raw.reviews : undefined
  const price_valid_until = raw.price_valid_until ?? raw.priceValidUntil ?? undefined

  return {
    id,
    slug,
    name,
    brand: raw.brand ?? undefined,
    sku: raw.sku ?? undefined,
    images,
    image_url,
    description,
    price,
    aggregate_rating,
    review_count,
    reviews,
    price_valid_until,
    // especificaciones técnicas
    mics: raw.mics ?? raw.pickups ?? undefined,
    wood: raw.wood ?? raw.bodyWood ?? undefined,
    model: raw.model ?? raw.type ?? undefined,
    scale_length: raw.scale_length ?? undefined,
    neck_profile: raw.neck_profile ?? undefined,
    fingerboard_radius: raw.fingerboard_radius ?? undefined,
    fingerboard_material: raw.fingerboard_material ?? undefined,
    neck_construction: raw.neck_construction ?? undefined,
    nut_width: raw.nut_width ?? undefined,
    frets: raw.frets ?? undefined,
    bridge: raw.bridge ?? undefined,
    tuners: raw.tuners ?? undefined,
    hardware_finish: raw.hardware_finish ?? undefined,
    controls: raw.controls ?? undefined,
    switching: raw.switching ?? undefined,
    origin: raw.origin ?? undefined,
    year: raw.year ?? undefined,
    weight: raw.weight ?? undefined,
    low_cost: raw.low_cost === true || raw.low_cost === 'true'
  }
}
