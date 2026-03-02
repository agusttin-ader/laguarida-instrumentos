import React from 'react'
const SITE_URL = 'https://laguarida.com'
import fs from 'fs/promises'
import path from 'path'
export const dynamic = 'force-dynamic'
import GuitarGallery from '../../../components/GuitarGallery'
import normalizeProduct from '../../../lib/utils/normalizeProduct'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import ProductCard from '../../../components/ProductCard'
import imageService from '../../../lib/utils/imageService'
import ProductShareAndFavorite from '../../../components/ProductShareAndFavorite'

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
  const specsText = [product.model, product.wood, product.mics].filter(Boolean).map(s => Array.isArray(s) ? s.join(', ') : s).join(' · ')
  const hasSpecs = specsText.length > 0
  const modelValue = product.model || 'N/A'
  const woodValue = Array.isArray(product.wood) ? product.wood.join(', ') : (product.wood || 'N/A')
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
    <div className="container-tight pt-10 sm:pt-14 pb-28 md:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mt-2 sm:mt-4 mb-3">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Catálogo · Guitarras</p>
      </header>
      <div className="max-w-6xl mx-auto rounded-[28px] overflow-hidden border border-[#dfe3ea] bg-[#f3f5f9] dark:bg-[#10131b] dark:border-[#2a3142] shadow-[0_22px_55px_rgba(12,20,39,0.16)] dark:shadow-[0_22px_55px_rgba(0,0,0,0.45)]">
        <main className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] items-stretch">
          <section className="bg-[#fbfbfc] dark:bg-[#0d1118] px-6 py-8 md:px-10 md:py-10 border-r border-[#e6e8ef] dark:border-[#232a3a]">
            <GuitarGallery image_url={product.image_url} images={product.images} altBase={`${product.name}${product.brand ? ' — ' + product.brand : ''}`} />
          </section>

          <aside className="px-6 py-7 md:px-10 md:py-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500 mb-2">{categoryLabel}</p>
            <h1 className="text-[1.95rem] leading-[1.15] font-bold text-[#131722] dark:text-[#f5f7ff] mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-5">
              <span className="w-3 h-3 rounded-full bg-[#d4d7de] border border-[#c2c8d4] dark:bg-[#8d97ac] dark:border-[#667089]" aria-hidden />
              <span className="w-3 h-3 rounded-full bg-[#2e3d5a] dark:bg-[#d9e2ff]" aria-hidden />
            </div>

            {hasSpecs && (
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">{specsText}</p>
            )}

            <p className="text-[14px] leading-7 text-gray-600 dark:text-gray-300 max-w-md mb-6">
              {descriptionText || 'Instrumento seleccionado y revisado profesionalmente, ideal para estudio y escenario.'}
            </p>

            <div className="flex gap-3 mb-7">
              <div className="min-w-[112px] px-3 py-2.5 border border-[#d6dbe6] dark:border-[#3a4358] rounded-md bg-[#f8f9fc] dark:bg-[#141a26]">
                <p className="text-[9px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 mb-1">Modelo</p>
                <p className="text-sm font-semibold text-[#1a2030] dark:text-[#eef2ff]">{modelValue}</p>
              </div>
              <div className="min-w-[112px] px-3 py-2.5 border border-[#d6dbe6] dark:border-[#3a4358] rounded-md bg-[#f8f9fc] dark:bg-[#141a26]">
                <p className="text-[9px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 mb-1">Madera</p>
                <p className="text-sm font-semibold text-[#1a2030] dark:text-[#eef2ff]">{woodValue}</p>
              </div>
            </div>

            <p className="text-[30px] font-bold text-[#161c2c] dark:text-[#f7f9ff] mb-6">{product.price}</p>

            <div className="flex flex-wrap gap-3 items-center">
              <a
                href={consultHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Consultar por WhatsApp sobre ${product.name}`}
                className="no-custom-btn inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#0f1628] text-white dark:bg-[#e9eefc] dark:text-[#111728] font-semibold text-sm hover:bg-[#1a2239] dark:hover:bg-[#dbe5ff] transition-colors"
              >
                <span>Consultar</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
                </svg>
              </a>
              <ProductShareAndFavorite slug={slug} name={product.name} url={productUrl} />
            </div>
          </aside>
        </main>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-10 sm:mt-12">
          <h2 className="section-title-premium section-underline-ocre text-gray-900 dark:text-white mb-4">También te recomendamos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {relatedProducts.map(r => (
              <ProductCard key={r.id || r.slug} item={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
