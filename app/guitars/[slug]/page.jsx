import ProductGalleryModern from '../../../components/ProductGalleryModern'
import normalizeProduct, { parseNumericPriceForSchema } from '../../../lib/utils/normalizeProduct'
import formatPriceDisplay from '../../../lib/utils/formatPriceDisplay'
import { fetchProductRowBySlug } from '../../../lib/data/fetchProductBySlug'
import { getPublicCatalogRows } from '../../../lib/data/publicCatalog'
import imageService from '../../../lib/utils/imageService'
import ProductShareAndFavorite from '../../../components/ProductShareAndFavorite'
import ProductPageCTA from '../../../components/ProductPageCTA'
import ProductMobileStickyBar from '../../../components/ProductMobileStickyBar'
import ProductDesktopPurchasePanel from '../../../components/ProductDesktopPurchasePanel'
import ProductPurchaseTrustSignals from '../../../components/ProductPurchaseTrustSignals'
import ProductDetailInfoPanel from '../../../components/ProductDetailInfoPanel'
import ProductDetailSpecSheet from '../../../components/ProductDetailSpecSheet'
import RelatedProductsScroll from '../../../components/RelatedProductsScroll'
import { resolveImageUrl } from '../../../lib/utils/imageHelpers'
import { absoluteUrl, toAbsoluteUrl } from '../../../lib/siteUrl'
import { buildWaMeHref, whatsAppProductMessage } from '../../../lib/whatsappWeb'
import { descriptionLooksLikeMarkdown, markdownToPlainText } from '../../../lib/utils/descriptionMarkdown'
import ProductDescriptionMarkdown from '../../../components/ProductDescriptionMarkdown'
import ProductDetailLogoMark from '../../../components/ProductDetailLogoMark'
import Button from '../../../components/Button'
import {
  getProductDetailDisplayTitle,
  resolveProductBrandLogo,
} from '../../../lib/catalog/resolveProductBrandLogo'
import { productIsCustomShopGuitar } from '../../../lib/catalog/catalogTaxonomy'
import FadeInView from '../../../components/motion/FadeInView'

/** ISR: menos llamadas a Supabase; tras guardar en admin se invalida con revalidatePath/revalidateTag. */
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

const DESCRIPTION_FALLBACK =
  'Instrumento seleccionado y revisado profesionalmente, ideal para estudio y escenario.'

function normalizeDescriptionBlock(block) {
  return String(block)
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Texto largo en un solo párrafo → varios párrafos agrupando frases (tras . ! ? …).
 * Así se nota el cambio aunque en el admin no haya líneas en blanco.
 */
function chunkLongBlockIntoParagraphs(block, minChars = 240) {
  const normalized = normalizeDescriptionBlock(block)
  if (normalized.length < minChars) return [normalized]

  const sentences = normalized
    .split(/(?<=[.!?…])\s+/u)
    .map((x) => x.trim())
    .filter(Boolean)
  if (sentences.length < 3) return [normalized]

  const out = []
  let buf = []
  let len = 0
  const flush = () => {
    if (buf.length) {
      out.push(buf.join(' '))
      buf = []
      len = 0
    }
  }
  for (const sent of sentences) {
    buf.push(sent)
    len += sent.length + 1
    if (buf.length >= 2 && len >= 340) flush()
    else if (buf.length >= 3) flush()
  }
  flush()
  return out.length >= 2 ? out : [normalized]
}

/** Párrafos: líneas en blanco, <br>, líneas sueltas; bloques largos → frases. */
function splitDescriptionParagraphs(raw) {
  let s = String(raw ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .trim()
  if (!s) return []

  let blocks = s
    .split(/\n\s*\n+/)
    .map(normalizeDescriptionBlock)
    .filter(Boolean)

  // Solo saltos simples (sin línea vacía): cada línea como párrafo si parece intencional
  if (blocks.length === 1 && s.includes('\n') && !/\n\s*\n/.test(s)) {
    const lines = s.split(/\n/).map((l) => l.trim()).filter(Boolean)
    if (lines.length >= 2 && lines.every((l) => l.length >= 12)) {
      blocks = lines.map(normalizeDescriptionBlock).filter(Boolean)
    }
  }

  const expanded = []
  for (const b of blocks) {
    expanded.push(...chunkLongBlockIntoParagraphs(b))
  }
  return expanded
}

/**
 * Opción “lead + cuerpo”: 1–2 primeras frases del primer bloque más destacadas; el resto igual que antes.
 */
function extractDescriptionLeadAndBody(paragraphs) {
  const safe = Array.isArray(paragraphs) ? paragraphs.map((p) => String(p).trim()).filter(Boolean) : []
  if (!safe.length) return { lead: null, bodyParagraphs: [] }

  const first = safe[0]
  const sentences = first
    .split(/(?<=[.!?…])\s+/u)
    .map((x) => x.trim())
    .filter(Boolean)

  if (sentences.length <= 1) {
    return {
      lead: first,
      bodyParagraphs: safe.slice(1),
    }
  }

  let nLead = 1
  if (sentences[0].length < 52 && sentences.length >= 2) nLead = 2

  const lead = sentences.slice(0, nLead).join(' ')
  const tailFirst = sentences.slice(nLead).join(' ')

  const bodyParagraphs = []
  if (tailFirst) {
    bodyParagraphs.push(...chunkLongBlockIntoParagraphs(tailFirst, 240))
  }
  bodyParagraphs.push(...safe.slice(1))
  return { lead, bodyParagraphs }
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

  const title = product && product.name ? `${product.name} | La Guarida Instrumentos` : 'La Guarida — Instrumentos'
  const rawDescMeta = product ? String(product.description || '').trim() : ''
  const metaSnippet = rawDescMeta
    ? (descriptionLooksLikeMarkdown(rawDescMeta)
        ? markdownToPlainText(rawDescMeta, 150)
        : rawDescMeta.slice(0, 150))
    : ''
  const description = product
    ? `${(product.brand || '').toString()} ${(product.model || '').toString()} — ${metaSnippet}`.trim()
    : 'Tienda de instrumentos musicales en Argentina — guitarras, bajos, amplificadores y accesorios.'
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

  let relatedProducts = []
  try {
    if (product) {
      const allProducts = (await getPublicCatalogRows({ includeReserved: false }))
        .filter((p) => p.slug !== product.slug)
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
            <li><a href="/catalogo" className="hover:text-[var(--dark-text-primary)] transition-colors">Catálogo</a></li>
          </ol>
        </nav>
        <div className="rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] p-8 md:p-10 text-center">
          <h1 className="text-xl font-semibold text-[var(--dark-text-primary)]">Producto no encontrado</h1>
          <p className="mt-2 text-sm text-[var(--dark-muted)]">No encontramos ese instrumento. Revisá el catálogo o contactanos por WhatsApp.</p>
          <Button href="/catalogo" variant="ghost-subtle" className="mt-6">
            Ver catálogo
          </Button>
        </div>
      </div>
    )
  }

  const consultHref = buildWaMeHref(whatsAppProductMessage(product.name))
  const brandLogo = resolveProductBrandLogo(product)
  const headerLogo = brandLogo
  const modelLabel =
    String(product.model || '').trim() ||
    (productIsCustomShopGuitar(product) ? 'Custom Shop' : '')
  const categoryLabel = brandLogo
    ? modelLabel
    : ([product.brand, product.model].filter(Boolean).join(' · ') || 'Premium guitars')
  const displayTitle = getProductDetailDisplayTitle(product, brandLogo, modelLabel)
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
  const productSpecRows = [
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
  ].filter((spec) => spec.value && String(spec.value).trim() !== '')
  const descriptionText = String(product.description || '').trim()
  const descriptionUseMarkdown = descriptionLooksLikeMarkdown(descriptionText)
  let descriptionLead = null
  let descriptionBodyParagraphs = []
  if (!descriptionUseMarkdown) {
    const descriptionParagraphs = splitDescriptionParagraphs(product.description)
    const descriptionBlocks =
      descriptionParagraphs.length > 0 ? descriptionParagraphs : [DESCRIPTION_FALLBACK]
    const extracted = extractDescriptionLeadAndBody(descriptionBlocks)
    descriptionLead = extracted.lead
    descriptionBodyParagraphs = extracted.bodyParagraphs
  }
  const productUrl = absoluteUrl(`/guitars/${slug}`)
  const galleryImageUrl = resolveGalleryImageRef(product.image_url) || ''
  const galleryImages = Array.isArray(product.images)
    ? product.images.map((x) => resolveGalleryImageRef(x)).filter(Boolean)
    : []
  const productImageUrl = imageService.resolve(product.image_url || (product.images && product.images[0]))
  const absoluteImage = toAbsoluteUrl(productImageUrl)

  const numericPrice = parseNumericPriceForSchema(product.price)
  const offerCurrency = product.currency === 'ARS' ? 'ARS' : 'USD'
  const aggregateRatingValue = toFiniteNumber(product.aggregate_rating)
  const reviewCountValue = toFiniteNumber(product.review_count)
  const reviewsForSchema = mapReviewsForSchema(product.reviews).slice(0, 5)
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: absoluteUrl('/catalogo') },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
    ],
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      (descriptionUseMarkdown ? markdownToPlainText(descriptionText) : descriptionText) ||
      `${product.name} — La Guarida Instrumentos`,
    url: productUrl,
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.sku && { sku: product.sku }),
    ...(absoluteImage && { image: absoluteImage }),
    ...(numericPrice != null && {
      offers: {
        '@type': 'Offer',
        price: numericPrice,
        priceCurrency: offerCurrency,
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

  const desktopTitle = headerLogo ? displayTitle : product.name
  const desktopBrandLabel = product.brand || categoryLabel || null
  const priceLabel = product.price ? formatPriceDisplay(product.price) : null

  return (
    <div className="product-detail-page min-h-screen w-full min-w-0 max-md:overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="product-detail-hero-section product-detail-layout w-full min-w-0 bg-[var(--dark-surface-2)] max-md:px-0 px-4 pt-0 pb-5 max-lg:mx-0 max-md:rounded-b-[20px] sm:px-5 sm:pt-6 sm:pb-10 md:px-6 md:pt-3 lg:-mx-8 lg:px-8 lg:pt-3 lg:pb-16 rounded-b-[24px] md:rounded-b-[32px]">
        <div className="container-tight product-detail-layout__grid w-full">
          <nav aria-label="Breadcrumb" className="product-detail-layout__crumb w-full mb-0 mt-3 md:mb-4 md:mt-0">
            <ol className="product-detail-breadcrumb flex flex-wrap items-center gap-1.5 text-[12px] max-md:text-[13px] sm:text-[14px] md:text-[15px] xl:text-base text-[var(--dark-muted)]">
              <li><a href="/" className="hover:text-[var(--dark-text-primary)] transition-colors">Inicio</a></li>
              <li aria-hidden className="opacity-50">/</li>
              <li><a href="/catalogo" className="hover:text-[var(--dark-text-primary)] transition-colors">Catálogo</a></li>
              <li aria-hidden className="opacity-50">/</li>
              <li className="min-w-0 flex-1 text-[var(--dark-text-secondary)] sm:flex-none sm:max-w-[280px] lg:max-w-[min(100%,28rem)] xl:max-w-[min(100%,40rem)]" aria-current="page">
                <span className="block truncate">{product.name}</span>
              </li>
            </ol>
          </nav>

          <FadeInView className="product-detail-layout__gallery product-detail-gallery-wrap min-w-0">
            <ProductGalleryModern
              image_url={galleryImageUrl}
              images={galleryImages}
              altBase={`${product.name}${product.brand ? ' — ' + product.brand : ''}`}
            />
          </FadeInView>

          {/* Identidad: mobile/tablet. En desktop el h1 vive en el panel sticky. */}
          <FadeInView className="product-detail-layout__identity product-detail-identity mb-6 max-md:mb-0 max-md:mt-2 md:mb-8 lg:hidden" delay={0.05}>
            {headerLogo ? (
              <ProductDetailLogoMark logo={headerLogo} size="hero" />
            ) : null}
            {categoryLabel ? (
              <p className="product-detail-kicker mt-2 text-[11px] sm:text-xs md:text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--dark-muted)] max-md:mt-1.5 md:mt-2.5">
                {categoryLabel}
              </p>
            ) : null}
            <h1
              className={`product-detail-title leading-[1.08] font-bold text-[var(--dark-text-primary)] tracking-tight text-left ${
                headerLogo ? 'product-detail-title--with-logo' : ''
              } ${categoryLabel || headerLogo ? 'mt-2 max-md:mt-1.5 md:mt-3' : 'mt-0'}`}
            >
              {desktopTitle}
            </h1>
            {priceLabel ? (
              <p className="price-highlight product-detail-price product-detail-price--mobile-hero mt-2.5 text-2xl font-bold tracking-tight md:hidden">
                {priceLabel}
              </p>
            ) : null}
            <p className="product-detail-availability mt-2 flex items-center gap-2 text-[13px] font-medium text-[var(--dark-text-secondary)] md:hidden">
              <span className="product-detail-availability__dot" aria-hidden />
              Disponible
            </p>
          </FadeInView>

          {/* Panel compra sticky desktop: debajo de galería full-width, columna derecha con la descripción */}
          <div className="product-detail-layout__buy hidden min-w-0 lg:block">
            <ProductDesktopPurchasePanel
              brandLabel={desktopBrandLabel}
              headerLogo={headerLogo}
              title={desktopTitle}
              priceLabel={priceLabel}
              consultHref={consultHref}
              productName={product.name}
              slug={slug}
              productUrl={productUrl}
            />
          </div>

          {/* CTA + confianza + ficha: mobile/tablet */}
          <FadeInView
            className="product-detail-layout__cta product-detail-primary-block mt-5 max-md:mt-3 min-w-0 space-y-4 max-md:space-y-3 sm:mt-10 sm:space-y-6 md:mt-12 scroll-mt-[calc(var(--site-header-h,3.25rem)+0.75rem)] lg:hidden"
            delay={0.04}
          >
            <div id="pdp-primary-block" className="space-y-4 max-md:space-y-3 sm:space-y-5">
              {priceLabel ? (
                <p className="price-highlight product-detail-price hidden text-2xl font-bold tracking-tight sm:text-[30px] md:block md:text-[32px]">
                  {priceLabel}
                </p>
              ) : null}

              <p className="product-detail-availability hidden items-center gap-2 text-sm font-medium text-[var(--dark-text-secondary)] md:flex lg:hidden">
                <span className="product-detail-availability__dot" aria-hidden />
                Disponible
              </p>

              <ProductPurchaseTrustSignals />

              <ProductPageCTA
                price={product.price}
                consultHref={consultHref}
                productName={product.name}
                showPrice={false}
              >
                <ProductShareAndFavorite slug={slug} name={product.name} url={productUrl} />
              </ProductPageCTA>
            </div>

            {hasFicha ? <ProductDetailSpecSheet specs={productSpecRows} /> : null}
          </FadeInView>

          <FadeInView className="product-detail-layout__info mt-5 max-md:mt-4 min-w-0 sm:mt-10 md:mt-12 lg:mt-10" delay={0.08}>
            <ProductDetailInfoPanel highlights={product.highlights}>
              <div className="product-detail-desc-stack">
                {descriptionUseMarkdown ? (
                  <ProductDescriptionMarkdown>
                    {descriptionText || DESCRIPTION_FALLBACK}
                  </ProductDescriptionMarkdown>
                ) : (
                  <>
                    {descriptionLead ? (
                      <p className="product-detail-desc-lead m-0 mb-2 sm:mb-2.5 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[1.125rem] min-[1920px]:text-[1.2rem] min-[2560px]:text-[1.28rem] font-medium leading-[1.48] sm:leading-[1.5] tracking-tight text-[var(--dark-text-primary)]">
                        {descriptionLead}
                      </p>
                    ) : null}
                    {descriptionBodyParagraphs.length > 0 ? (
                      <div className="product-detail-body space-y-2 sm:space-y-2 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[1.125rem] min-[1920px]:text-[1.2rem] min-[2560px]:text-[1.28rem] leading-[1.48] sm:leading-[1.5] text-[var(--dark-text-secondary)]">
                        {descriptionBodyParagraphs.map((para, idx) => (
                          <p key={idx} className="m-0">
                            {para}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </ProductDetailInfoPanel>
            {hasFicha ? (
              <div className="mt-6 hidden lg:block xl:mt-8">
                <ProductDetailSpecSheet specs={productSpecRows} />
              </div>
            ) : null}
          </FadeInView>
        </div>
      </section>

      {relatedProducts && relatedProducts.length > 0 && (
        <FadeInView as="section" className="container-tight mt-5 max-md:mt-4 sm:mt-12 md:mt-16 lg:mt-16 pb-0 max-md:pb-8 sm:pb-10 md:pb-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title-premium section-underline-ocre text-[var(--dark-text-primary)] mb-2.5 max-md:mb-2 sm:mb-6">También te recomendamos</h2>
          <RelatedProductsScroll products={relatedProducts} />
        </FadeInView>
      )}

      <ProductMobileStickyBar
        productName={product.name}
        priceLabel={priceLabel}
        consultHref={consultHref}
      />
    </div>
  )
}
