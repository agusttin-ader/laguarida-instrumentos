import React from 'react'
import fs from 'fs/promises'
import path from 'path'
import ProductGalleryModern from '../../../components/ProductGalleryModern'
import normalizeProduct from '../../../lib/utils/normalizeProduct'
import { fetchProductRowBySlug } from '../../../lib/data/fetchProductBySlug'
import { PRODUCT_LIST_COLUMNS } from '../../../lib/data/productColumns'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import ProductCard from '../../../components/ProductCard'
import imageService from '../../../lib/utils/imageService'
import ProductShareAndFavorite from '../../../components/ProductShareAndFavorite'
import ProductPageCTA from '../../../components/ProductPageCTA'
import ProductSpecsExpandable from '../../../components/ProductSpecsExpandable'
import { parseNumericPriceForSchema } from '../../../lib/utils/normalizeProduct'
import { resolveImageUrl } from '../../../lib/utils/imageHelpers'
import { absoluteUrl, toAbsoluteUrl } from '../../../lib/siteUrl'

export const revalidate = 300

/** URLs absolutas de Storage en el servidor (SUPABASE_URL disponible aquí). */
function resolveGalleryImageRef(ref) {
  if (ref == null) return null
  const s = typeof ref === 'string' ? ref.trim() : String(ref).trim()
  if (!s) return null
  const resolved = resolveImageUrl(s)
  if (resolved) return resolved
  if (/^https?:\/\//i.test(s)) return s
  return null
}

function toFiniteNumber(value) {
  if (value == null || value === '') return null
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function getPriceValidUntil(rawValue) {
  if (rawValue) {
    const d = new Date(rawValue)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  const d = new Date()
  d.setMonth(d.getMonth() + 6)
  return d.toISOString().slice(0, 10)
}

function mapReviewsForSchema(reviews = []) {
  if (!Array.isArray(reviews) || reviews.length === 0) return []
  return reviews
    .map((r) => {
      const authorName = String(r?.author || r?.authorName || r?.name || '').trim()
      const body = String(r?.body || r?.reviewBody || r?.text || '').trim()
      const rating = toFiniteNumber(r?.rating ?? r?.reviewRating)
      if (!authorName || !body || rating == null) return null
      return {
        '@type': 'Review',
        author: { '@type': 'Person', name: authorName },
        reviewBody: body,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rating,
          bestRating: 5,
          worstRating: 1,
        },
      }
    })
    .filter(Boolean)
}

// Generate page metadata dynamically based on the product data
export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams || {}
  let product = null
  if (slug) {
    const row = await fetchProductRowBySlug(slug)
    if (row) product = normalizeProduct(row)
  }

  // local markdown fallback
  if (!product && slug) {
    try {
      const filePath = path.join(process.cwd(), 'data', 'guitars', `${slug}.md`)
      const raw = await fs.readFile(filePath, 'utf8')
      const titleMatch = raw.match(/^#\s+(.+)$/m)
      const modelMatch = raw.match(/\*\*Model:\*\*\s*(.+)/i)
      const priceMatch = raw.match(/\*\*Price:\*\*\s*(.+)/i)
      const body = raw.replace(/^#.+$/m, '').replace(/\*\*Model:\*\*.+$/im, '').replace(/\*\*Price:\*\*.+$/im, '').trim()
      product = {
        slug,
        name: titleMatch ? titleMatch[1].trim() : (modelMatch ? modelMatch[1].trim() : slug),
        model: modelMatch ? modelMatch[1].trim() : '',
        price: priceMatch ? priceMatch[1].trim() : null,
        description: body
      }
    } catch {
      product = null
    }
  }

  const title = product && product.name ? `${product.name} | La Guarida Instrumentos` : 'La Guarida — Instrumentos'
  const description = product ? `${(product.brand || '').toString()} ${(product.model || '').toString()} — ${String(product.description || '').slice(0, 150)}`.trim() : 'Tienda de instrumentos musicales en Argentina — guitarras, bajos, amplificadores y accesorios.'
  const imageUrl = product ? imageService.resolve(product.image_url || (product.images && product.images[0])) : null
  const ogImage = toAbsoluteUrl(imageUrl)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      type: 'website'
    },
    alternates: {
      canonical: absoluteUrl(`/guitars/${slug}`)
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    }
  }
}

export default async function GuitarPage({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams ?? {}

  let product = null
  if (slug) {
    const row = await fetchProductRowBySlug(slug)
    if (row) product = normalizeProduct(row)
  }

  // Fallback: try to load local markdown data if Supabase has no product
  if (!product) {
    try {
      if (slug) {
        const filePath = path.join(process.cwd(), 'data', 'guitars', `${slug}.md`)
        const raw = await fs.readFile(filePath, 'utf8')
        // Simple parsing: title (# ), **Model:**, **Price:**, rest as description
        const titleMatch = raw.match(/^#\s+(.+)$/m)
        const modelMatch = raw.match(/\*\*Model:\*\*\s*(.+)/i)
        const priceMatch = raw.match(/\*\*Price:\*\*\s*(.+)/i)
        const body = raw.replace(/^#.+$/m, '').replace(/\*\*Model:\*\*.+$/im, '').replace(/\*\*Price:\*\*.+$/im, '').trim()

        product = {
          slug,
          name: titleMatch ? titleMatch[1].trim() : (modelMatch ? modelMatch[1].trim() : slug),
          model: modelMatch ? modelMatch[1].trim() : '',
          price: priceMatch ? priceMatch[1].trim() : null,
          description: body
        }
      }
    } catch {
      product = null
    }
  }

  // Fetch related products: we'll load a batch and filter by shared words
  let relatedProducts = []
  try {
    if (product) {
      const supabase = getSupabaseServerClient()
      const { data: allProducts } = await supabase
        .from('products')
        .select(PRODUCT_LIST_COLUMNS)
        .neq('slug', product.slug)
        .order('created_at', { ascending: false })
        .limit(36)
      // Build a normalized set of words from brand, model and name (remove diacritics)
      const normalizeText = (s = '') => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
      const wordsSource = `${product.brand || ''} ${product.model || ''} ${product.name || ''}`
      const words = Array.from(new Set(
        normalizeText(wordsSource)
          .split(/\s+/)
          .map(w => w.replace(/[^a-z0-9-]/gi, ''))
          .filter(Boolean)
          .filter(w => w.length >= 3)
      ))

      if (allProducts) {
        const candidates = allProducts
          .filter(p => p.slug !== product.slug)
          .map(p => normalizeProduct(p))
          .map(p => {
            // compute score: +2 for word match, +1 for brand exact match
            const hay = normalizeText(`${p.brand || ''} ${p.model || ''} ${p.name || ''}`)
            let score = 0
            for (const w of words) if (hay.includes(w)) score += 2
            if (p.brand && product.brand && normalizeText(p.brand) === normalizeText(product.brand)) score += 1
            return { item: p, score }
          })
          .filter(x => x.score > 0)

        // sort by score desc, then by name to make deterministic
        candidates.sort((a, b) => b.score - a.score || ('' + (a.item.name || '')).localeCompare(b.item.name || ''))

        relatedProducts = candidates.slice(0, 3).map(c => c.item)
      }
    }
  } catch {
    relatedProducts = []
  }

  if (!product) {
    return (
      <div className="container-tight pt-6 pb-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--dark-muted)]">
            <li><a href="/" className="hover:text-[var(--dark-text-primary)] transition-colors">Inicio</a></li>
            <li aria-hidden>/</li>
            <li><a href="/#seleccion-destacada" className="hover:text-[var(--dark-text-primary)] transition-colors">Selección destacada</a></li>
          </ol>
        </nav>
        <div className="rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] p-8 md:p-10 text-center">
          <h1 className="text-xl font-semibold text-[var(--dark-text-primary)]">Producto no encontrado</h1>
          <p className="mt-2 text-sm text-[var(--dark-muted)]">No encontramos ese instrumento. Revisá el catálogo o contactanos por WhatsApp.</p>
          <a href="/#seleccion-destacada" className="no-custom-btn mt-6 inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl border border-[var(--dark-border)] bg-[var(--dark-bg-elevated)] text-[var(--dark-text-primary)] font-medium text-sm hover:bg-white/5 transition-colors">Ver selección destacada</a>
        </div>
      </div>
    )
  }

  const consultHref = `https://wa.me/5491154661749?text=${encodeURIComponent(`Hola, me interesa ${product.name}, me podrias dar mas informacion ?`)}`
  const categoryLabel = [product.brand, product.model].filter(Boolean).join(' · ') || 'Premium guitars'
  const modelValue = product.model || 'N/A'
  const woodValue = Array.isArray(product.wood) ? product.wood.join(', ') : (product.wood || 'N/A')
  const micsValue = Array.isArray(product.mics) ? product.mics.join(', ') : (product.mics || 'N/A')
  const hasFicha = Boolean(
    product.model ||
    product.wood ||
    product.mics ||
    product.scale_length ||
    product.neck_profile ||
    product.fingerboard_radius ||
    product.fingerboard_material ||
    product.neck_construction ||
    product.nut_width ||
    product.frets ||
    product.bridge ||
    product.tuners ||
    product.hardware_finish ||
    product.controls ||
    product.switching ||
    product.origin ||
    product.year ||
    product.weight
  )
  const descriptionText = String(product.description || '').trim()
  const productUrl = absoluteUrl(`/guitars/${slug}`)
  const galleryImageUrl = resolveGalleryImageRef(product.image_url) || ''
  const galleryImages = Array.isArray(product.images)
    ? product.images.map((x) => resolveGalleryImageRef(x)).filter(Boolean)
    : []
  const productImageUrl = imageService.resolve(product.image_url || (product.images && product.images[0]))
  const absoluteImage = toAbsoluteUrl(productImageUrl)

  const numericPrice = parseNumericPriceForSchema(product.price)
  const aggregateRatingValue = toFiniteNumber(product.aggregate_rating)
  const reviewCountValue = toFiniteNumber(product.review_count)
  const reviewsForSchema = mapReviewsForSchema(product.reviews).slice(0, 5)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: descriptionText || `${product.name} — La Guarida Instrumentos`,
    url: productUrl,
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.sku && { sku: product.sku }),
    ...(absoluteImage && { image: absoluteImage }),
    ...(numericPrice != null && {
      offers: {
        '@type': 'Offer',
        price: numericPrice,
        priceCurrency: 'USD',
        priceValidUntil: getPriceValidUntil(product.price_valid_until),
        availability: 'https://schema.org/InStock',
        url: productUrl
      }
    }),
    ...(aggregateRatingValue != null && reviewCountValue != null && reviewCountValue > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRatingValue,
        reviewCount: reviewCountValue,
      }
    }),
    ...(reviewsForSchema.length > 0 && { review: reviewsForSchema })
  }

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Sección galería: 100% ancho — breadcrumb, título a la izquierda, galería moderna */}
      <section className="bg-[var(--dark-surface-2)] -mx-4 sm:-mx-5 md:-mx-6 lg:-mx-8 px-4 sm:px-5 md:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-10 rounded-b-[24px] md:rounded-b-[32px] w-full">
        <nav aria-label="Breadcrumb" className="container-tight w-full mb-4 md:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12px] sm:text-[13px] text-[var(--dark-muted)]">
            <li><a href="/" className="hover:text-[var(--dark-text-primary)] transition-colors">Inicio</a></li>
            <li aria-hidden className="opacity-50">/</li>
            <li><a href="/#seleccion-destacada" className="hover:text-[var(--dark-text-primary)] transition-colors">Selección destacada</a></li>
            <li aria-hidden className="opacity-50">/</li>
            <li className="text-[var(--dark-text-secondary)] truncate max-w-[140px] sm:max-w-[220px]" aria-current="page">{product.name}</li>
          </ol>
        </nav>
        <div className="container-tight w-full">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--dark-muted)] mb-2">{categoryLabel}</p>
          <h1 className="text-[2rem] sm:text-[2.35rem] md:text-[2.6rem] leading-[1.08] font-bold text-[var(--dark-text-primary)] tracking-tight mb-6 text-left">
            {product.name}
          </h1>
          <ProductGalleryModern
            image_url={galleryImageUrl}
            images={galleryImages}
            altBase={`${product.name}${product.brand ? ' — ' + product.brand : ''}`}
          />
        </div>
      </section>

      {/* Dos columnas: Descripción (izq) | Precio, ficha y botones (der) */}
      <section className="container-tight w-full pt-8 sm:pt-10 md:pt-12 pb-10 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Columna izquierda: descripción */}
          <div>
            <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dark-text-secondary)] mb-3">Descripción</h2>
            <p className="text-[15px] sm:text-base leading-[1.75] text-[var(--dark-text-secondary)]">
              {descriptionText || 'Instrumento seleccionado y revisado profesionalmente, ideal para estudio y escenario.'}
            </p>
          </div>

          {/* Columna derecha: precio, ficha técnica y botones */}
          <div className="lg:pl-0">
            {product.price && (
              <p className="text-2xl sm:text-[28px] font-bold text-[var(--vintage-gold)] mb-6 tracking-tight">{product.price}</p>
            )}

            {hasFicha && (
              <ProductSpecsExpandable
                specs={[
                  { label: 'Modelo', value: modelValue },
                  { label: 'Madera del cuerpo', value: woodValue },
                  { label: 'Micrófonos', value: micsValue },
                  { label: 'Escala', value: product.scale_length },
                  { label: 'Perfil de mástil', value: product.neck_profile },
                  { label: 'Radio del diapasón', value: product.fingerboard_radius },
                  { label: 'Madera del diapasón', value: product.fingerboard_material },
                  { label: 'Construcción del mástil', value: product.neck_construction },
                  { label: 'Ancho de cejuela', value: product.nut_width },
                  { label: 'Trastes', value: product.frets },
                  { label: 'Puente', value: product.bridge },
                  { label: 'Clavijas', value: product.tuners },
                  { label: 'Terminación del hardware', value: product.hardware_finish },
                  { label: 'Controles', value: product.controls },
                  { label: 'Conmutación', value: product.switching },
                  { label: 'Origen', value: product.origin },
                  { label: 'Año', value: product.year },
                  { label: 'Peso (kg aprox.)', value: product.weight ? `${product.weight}` : null },
                ].filter(spec => spec.value && String(spec.value).trim() !== '')}
              />
            )}

            <ProductPageCTA
              price={product.price}
              consultHref={consultHref}
              productName={product.name}
              showPrice={false}
            >
              <ProductShareAndFavorite slug={slug} name={product.name} url={productUrl} />
            </ProductPageCTA>
          </div>
        </div>
      </section>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="container-tight mt-10 sm:mt-12 md:mt-16 pb-10 md:pb-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title-premium section-underline-ocre text-[var(--dark-text-primary)] mb-4 sm:mb-6">También te recomendamos</h2>
          <div className="flex overflow-x-auto gap-4 sm:gap-5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8 snap-x snap-mandatory scroll-smooth">
            {relatedProducts.map(r => (
              <div key={r.id || r.slug} className="flex-shrink-0 w-[min(280px,85vw)] sm:w-auto snap-center">
                <ProductCard item={r} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
