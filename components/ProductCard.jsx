import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

function ProductCard({item}){
  const img = item.images && item.images[0]
  function truncate(text, n = 120){
    if (!text) return ''
    return text.length > n ? text.slice(0, n-1).trimEnd() + '…' : text
  }
  return (
    <article className="card-compact transform transition-transform duration-200 hover:-translate-y-1">
      {/* Reveal wrapper around the image and meta so cards animate on scroll */}
      <div>
        {img ? (
           <div className="w-full rounded-md overflow-hidden relative" style={{paddingTop: '110%'}}>
             <Image src={img} alt={item.title} fill style={{objectFit:'cover', objectPosition: 'center'}} sizes="(min-width:1024px) 360px, (min-width:640px) 45vw, 100vw" quality={80} loading="lazy" />
          </div>
        ) : (
          <div className="image-placeholder w-full rounded-md overflow-hidden" style={{paddingTop: '118%'}}></div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm subtitle-compact muted-text">{item.subtitle}</p>
        <h3 className="mt-2 display-xl text-gray-900 line-clamp-3">
          {item.title.replace(/Professional/g, 'Pro')}
        </h3>
        {item.price && <div className="mt-2 price-large">{item.price}</div>}
        <p className="mt-4 body-copy muted-text">{truncate(item.shortDescription || 'Edición limitada — diseño editorial con foco en proporciones.', 120)}</p>
        <div className="mt-4">
          <Link href={`/guitars/${item.slug || item.id}`} className="btn-minimal btn-focus">Ver</Link>
        </div>
      </div>
    </article>
  )
}
export default React.memo(ProductCard)
