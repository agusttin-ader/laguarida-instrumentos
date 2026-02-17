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
  function truncate(text, n = 60){
    if (!text) return ''
    return text.length > n ? text.slice(0, n-1).trimEnd() + '…' : text
  }
  return (
    <article className="card-compact transform transition-transform duration-200 hover:-translate-y-1">
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
        <h3 className="mt-2 display-xl text-gray-900 line-clamp-3">
          {titleText.replace(/Professional/g, 'Pro')}
        </h3>
        {p.price && <div className="mt-2 price-large">{p.price}</div>}
        <p className="mt-4 body-copy muted-text line-clamp-2 break-words">{truncate(p.description || 'Edición limitada — diseño editorial con foco en proporciones.', 60)}</p>
        <div className="mt-4">
          <Link href={`/guitars/${p.slug || p.id}`} className="btn-minimal btn-focus">Ver</Link>
        </div>
      </div>
    </article>
  )
}
export default React.memo(ProductCard)
