import React from 'react'
import fs from 'fs/promises'
import path from 'path'
export const dynamic = 'force-dynamic'
import GuitarGallery from '../../../components/GuitarGallery'
import normalizeProduct from '../../../lib/utils/normalizeProduct'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import ProductCard from '../../../components/ProductCard'

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
      const wordsSource = (`${product.model || ''} ${product.name || ''}`).toLowerCase()
      const words = Array.from(new Set(
        wordsSource
          .split(/\s+/)
          .map(w => w.replace(/[^a-z0-9áéíóúüñ-]/gi, ''))
          .filter(Boolean)
          .filter(w => w.length >= 3)
      ))

      if (allProducts && words.length) {
        const candidates = allProducts
          .filter(p => p.slug !== product.slug)
          .map(p => normalizeProduct(p))
          .filter(p => {
            const haystack = (`${p.model || ''} ${p.name || ''}`).toLowerCase()
            return words.some(w => haystack.includes(w))
          })

        relatedProducts = candidates.slice(0, 4)
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

      <div className="block lg:hidden mt-6">
        <p className="text-sm muted-text">{product.brand || ''} · {product.model || ''}</p>
        <h1 className="mt-2 display-xxl tight-tracking">{product.name}</h1>
        <p className="mt-3 subtitle-compact muted-text">{product.subtitle || ''}</p>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8 items-start">
        <section className="lg:col-span-1">
          <GuitarGallery image_url={product.image_url} images={product.images} />
        </section>

        <aside className="lg:col-span-1">
          <div className="flex flex-col gap-4">
            <div>
              <div className="hidden lg:block">
                <p className="text-sm muted-text">{product.brand || ''} · {product.model || ''}</p>
                <h1 className="mt-2 display-xxl tight-tracking">{product.name}</h1>
                <p className="mt-3 subtitle-compact muted-text">{product.subtitle || ''}</p>
              </div>

              <div className="mt-4">
                <div className="price-large">{product.price}</div>
                <p className="mt-1 subtitle-compact muted-text">Edición limitada · {product.year || ''}</p>
              </div>
            </div>

            <div className="mt-6 body-copy">
              {product.description}
            </div>

            <div className="mt-8">
              <a
                  href={`https://wa.me/541168696491?text=${encodeURIComponent(`Hola me interesa la ${product.name}, me podrias dar mas info?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-focus w-full text-center"
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
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(r => (
              <ProductCard key={r.id || r.slug} item={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
