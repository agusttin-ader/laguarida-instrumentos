import React from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.laguaridainstrumentos.com'
import fs from 'fs/promises'
import path from 'path'
export const dynamic = 'force-dynamic'
import GuitarGallery from '../../../components/GuitarGallery'
import normalizeProduct from '../../../lib/utils/normalizeProduct'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import ProductCard from '../../../components/ProductCard'
import imageService from '../../../lib/utils/imageService'
import ProductShareAndFavorite from '../../../components/ProductShareAndFavorite'
import ProductPageCTA from '../../../components/ProductPageCTA'

// Generate page metadata dynamically based on the product data
export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams || {}
  let product = null
  try {
    if (slug) {
      const supabase = getSupabaseServerClient()
      const { data } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      if (data) product = normalizeProduct(data)
    }
  } catch {
    // ignore errors — metadata can fallback to defaults below
    product = null
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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
      type: 'website'
    },
    alternates: {
      canonical: `${SITE_URL}/guitars/${slug}`
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    }
  }
}

export default async function GuitarPage({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams ?? {}

  // Query Supabase directly for the product by slug
  let product = null
  try {
    if (slug) {
      const supabase = getSupabaseServerClient()
      // Only filter by slug; use maybeSingle
      const { data } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      if (data) product = normalizeProduct(data)
    }
  } catch {
    product = null
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
      const { data: allProducts } = await supabase.from('products').select('*').limit(200)
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
      <div className="container-tight">
        <header className="mt-8">
          <p className="text-sm muted-text">Catálogo · Guitarras</p>
        </header>
        <div className="mt-8 p-6 bg-white rounded shadow">
          <h2 className="text-lg font-semibold">Producto no encontrado</h2>
          <p className="mt-2 text-sm muted-text">No se encontró la guitarra solicitada. Revisa el listado de productos en el panel de administración.</p>
        </div>
      </div>
    )
  }

  const consultHref = `https://wa.me/5491154661749?text=${encodeURIComponent(`Hola, me interesa ${product.name}, me podrias dar mas informacion ?`)}`
  const categoryLabel = [product.brand, product.model].filter(Boolean).join(' · ') || 'Premium guitars'
  const modelValue = product.model || 'N/A'
  const woodValue = Array.isArray(product.wood) ? product.wood.join(', ') : (product.wood || 'N/A')
  const micsValue = Array.isArray(product.mics) ? product.mics.join(', ') : (product.mics || 'N/A')
  const hasFicha = product.model || product.wood || product.mics
  const descriptionText = String(product.description || '').trim()
  const productUrl = `${SITE_URL}/guitars/${slug}`
  const productImageUrl = imageService.resolve(product.image_url || (product.images && product.images[0]))
  const absoluteImage = productImageUrl && (productImageUrl.startsWith('http') ? productImageUrl : `${SITE_URL}${productImageUrl.startsWith('/') ? '' : '/'}${productImageUrl}`)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: descriptionText || `${product.name} — La Guarida Instrumentos`,
    url: productUrl,
    ...(absoluteImage && { image: absoluteImage }),
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'ARS',
        availability: 'https://schema.org/InStock'
      }
    })
  }

  return (
    <div className="container-tight pt-3 sm:pt-4 pb-8 md:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mt-0 mb-1">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500 md:hidden">Catálogo · Guitarras</p>
        <nav aria-label="Breadcrumb" className="hidden md:block">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <li><a href="/" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Inicio</a></li>
            <li aria-hidden>/</li>
            <li><a href="/#seleccion-destacada" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Catálogo</a></li>
            <li aria-hidden>/</li>
            <li className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[200px]" aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </header>
      <div className="max-w-6xl mx-auto rounded-[28px] overflow-hidden border border-[#dfe3ea] bg-[#f3f5f9] dark:bg-[#10131b] dark:border-[#2a3142] shadow-[0_22px_55px_rgba(12,20,39,0.16)] dark:shadow-[0_22px_55px_rgba(0,0,0,0.45)]">
        <main className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] items-stretch">
          <section className="bg-[#fbfbfc] dark:bg-[#0d1118] px-4 sm:px-6 py-6 sm:py-8 md:px-10 md:py-10 border-r border-[#e6e8ef] dark:border-[#232a3a]">
            <GuitarGallery image_url={product.image_url} images={product.images} altBase={`${product.name}${product.brand ? ' — ' + product.brand : ''}`} />
          </section>

          <aside className="px-4 sm:px-6 py-5 sm:py-7 md:px-10 md:py-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500 mb-2">{categoryLabel}</p>
            <h1 className="text-[1.95rem] leading-[1.15] font-bold text-[#131722] dark:text-[#f5f7ff] mb-2">{product.name}</h1>

            <p className="text-[14px] leading-7 text-gray-600 dark:text-gray-300 max-w-md mb-6">
              {descriptionText || 'Instrumento seleccionado y revisado profesionalmente, ideal para estudio y escenario.'}
            </p>

            {hasFicha && (
              <div className="mb-6 rounded-xl border border-[#d6dbe6] dark:border-white/10 bg-[#f8f9fc] dark:bg-[#0c0c0c] overflow-hidden">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 px-4 py-2.5 border-b border-[#e6e8ef] dark:border-white/10">Ficha técnica</p>
                <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e6e8ef] dark:divide-white/10">
                  <div className="px-4 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 mb-0.5">Modelo</dt>
                    <dd className="text-sm font-semibold text-[#1a2030] dark:text-[#eef2ff]">{modelValue}</dd>
                  </div>
                  <div className="px-4 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 mb-0.5">Madera</dt>
                    <dd className="text-sm font-semibold text-[#1a2030] dark:text-[#eef2ff]">{woodValue}</dd>
                  </div>
                  <div className="px-4 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 mb-0.5">Micrófonos</dt>
                    <dd className="text-sm font-semibold text-[#1a2030] dark:text-[#eef2ff]">{micsValue}</dd>
                  </div>
                </dl>
              </div>
            )}

            <ProductPageCTA
              price={product.price}
              consultHref={consultHref}
              productName={product.name}
            >
              <ProductShareAndFavorite slug={slug} name={product.name} url={productUrl} />
            </ProductPageCTA>
          </aside>
        </main>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-8 sm:mt-10 md:mt-12">
          <h2 className="section-title-premium section-underline-ocre text-gray-900 dark:text-white mb-3 sm:mb-4">También te recomendamos</h2>
          <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 md:gap-6 lg:gap-8 snap-x snap-mandatory scroll-smooth">
            {relatedProducts.map(r => (
              <div key={r.id || r.slug} className="flex-shrink-0 w-[min(280px,82vw)] sm:w-auto sm:flex-shrink snap-center">
                <ProductCard item={r} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
