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
    console.log('slug:', slug)
    if (slug) {
      const supabase = getSupabaseServerClient()
      // Only filter by slug; use maybeSingle
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      console.log('product:', data)
      console.log('error:', error)
      if (data) product = normalizeProduct(data)
    }
  } catch (err) {
    console.log('error:', err)
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
    } catch (err) {
      console.log('local fallback read error:', err)
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
  } catch (err) {
    console.log('related products error:', err)
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

  return (
    <div className="container-tight">
      <header className="mt-8">
        <p className="text-sm muted-text">Catálogo · Guitarras</p>
      </header>

      <div className="block lg:hidden mt-2">
        <p className="text-sm muted-text">{product.brand || ''} · {product.model || ''}</p>
        <h2 className="mt-0 display-xxl tight-tracking">{product.name}</h2>
        <p className="mt-0 subtitle-compact muted-text">{product.subtitle || ''}</p>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8 items-start">
        {/* Left column: gallery (balanced) */}
        <section className="w-full lg:col-span-6 flex justify-center">
          <div className="w-full overflow-hidden" style={{ height: 'auto', maxWidth: '640px' }}>
            <GuitarGallery image_url={product.image_url} images={product.images} altBase={`${product.name}${product.brand ? ' — ' + product.brand : ''}`} />
          </div>
        </section>

        {/* Right column: details (balanced) */}
        <aside className="w-full lg:col-span-6 lg:sticky lg:top-24 self-start flex items-center">
          <div className="flex flex-col gap-2 w-full">
            <div>
              <p className="text-sm muted-text">{product.brand || ''} · {product.model || ''}</p>
              <h1 className="mt-0 display-xxl product-title tight-tracking">{product.name}</h1>
              <p className="mt-0 subtitle-compact muted-text">{product.subtitle || ''}</p>
            </div>

            <div>
              <div className="mt-3">
                <div className="price-large">{product.price}</div>
                <p className="mt-0 subtitle-compact muted-text">Edición limitada · {product.year || ''}</p>
              </div>
            </div>

            <section aria-labelledby="description-heading" className="-mt-8 body-copy">
              <h2 id="description-heading" className="sr-only">Descripción</h2>
              {product.description}
            </section>

            <div className="-mt-5 self-start">
              <a
                href={`https://wa.me/541168696491?text=${encodeURIComponent(`Hola me interesa la ${product.name}, me podrias dar mas info?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-elegant btn-elegant--dark btn-focus"
              >
                Consultar
              </a>
            </div>
          </div>
        </aside>
      </main>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">También te recomendamos</h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map(r => (
              <ProductCard key={r.id || r.slug} item={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
