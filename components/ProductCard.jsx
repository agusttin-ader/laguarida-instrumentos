"use client"

import React, { useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import Link from 'next/link'
import ImageWithSkeleton from './ImageWithSkeleton'

function ProductCard({item}){
  const p = normalizeProduct(item)
  const rawImg = p.image_url || (p.images && p.images[0])
  const img = imageService.resolve(rawImg)
    const [errored, setErrored] = useState(false)
  const titleText = p.name || ''
  const headingId = `product-title-${p.slug || p.id}`
  function truncate(text, n = 60){
    if (!text) return ''
    return text.length > n ? text.slice(0, n-1).trimEnd() + '…' : text
  }
  function keyFragment(text, words = 12){
    if (!text) return ''
    // prefer first full sentence
    const s = String(text).trim()
    const firstSentenceMatch = s.match(/^(.*?[\.\!\?])\s+/)
    if (firstSentenceMatch && firstSentenceMatch[1]){
      const sent = firstSentenceMatch[1].trim()
      const wordCount = sent.split(/\s+/).length
      if (wordCount <= words) return sent
    }
    // fallback: first `words` words (no ellipsis)
    const parts = s.split(/\s+/).filter(Boolean).slice(0, words)
    return parts.join(' ')
  }
  function splitTitle(text){
    if (!text) return text
    const s = text.trim()
    // If short, don't split
    if (s.length < 20) return s
    const mid = Math.floor(s.length / 2)
    // find nearest space to the middle, prefer breaking at a space
    let left = s.lastIndexOf(' ', mid)
    let right = s.indexOf(' ', mid + 1)
    let idx = left > -1 ? left : (right > -1 ? right : -1)
    if (idx === -1) return s
    const first = s.slice(0, idx).trim()
    const second = s.slice(idx + 1).trim()
    return (
      <>
        {first}<br />{second}
      </>
    )
  }
  return (
    <article aria-labelledby={headingId} className="card-compact transform transition-transform duration-200 hover:-translate-y-1">
      {/* Reveal wrapper around the image and meta so cards animate on scroll */}
      <div>
          {img && !errored ? (
           <div className="w-full rounded-md overflow-hidden relative" style={{aspectRatio: '3 / 4'}}>
             <img
               src={img}
               alt={titleText || 'Imagen del producto'}
               onError={() => setErrored(true)}
               onLoad={() => setErrored(false)}
               style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
             />
          </div>
        ) : (
          <div className="image-placeholder w-full rounded-md overflow-hidden" style={{aspectRatio: '3 / 4'}}></div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm subtitle-compact muted-text">{item.subtitle || ''}</p>
        <h3 id={headingId} className="mt-2 card-title text-gray-900">
          {splitTitle(titleText)}
        </h3>
        {p.price && <div className="mt-2 price-large">{p.price}</div>}
        <p className="mt-4 card-desc">{keyFragment(p.description || 'Edición limitada — diseño editorial con foco en proporciones.', 14)}</p>
        <div className="mt-4">
            <Link href={`/guitars/${p.slug || p.id}`} className="btn-elegant--light" aria-label={`Ver detalles de ${titleText}`}>Ver detalles</Link>
        </div>
      </div>
    </article>
  )
}
export default React.memo(ProductCard)
