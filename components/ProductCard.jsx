"use client";

import React, { useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import Link from 'next/link'

function ProductCard({item}){
  const p = normalizeProduct(item)
  const rawImg = p.image_url || (p.images && p.images[0])
  const img = imageService.resolve(rawImg)
  const [errored, setErrored] = useState(false)
  const titleText = p.name || ''
  const headingId = `product-title-${p.slug || p.id}`

  // (removed unused keyFragment helper) 

  function renderTitleThreeLines(text) {
    if (!text) return <><br /><br /></>
    const words = String(text).trim().split(/\s+/).filter(Boolean)
    let lines = []
    if (words.length <= 3) {
      lines = [words[0] || '\u00A0', words[1] || '\u00A0', words[2] || '\u00A0']
    } else {
      const base = Math.floor(words.length / 3)
      const rem = words.length % 3
      const counts = [base, base, base]
      for (let i = 0; i < rem; i++) counts[i]++
      let idx = 0
      for (let i = 0; i < 3; i++){
        lines.push(words.slice(idx, idx + counts[i]).join(' ') || '\u00A0')
        idx += counts[i]
      }
    }
    return <>{lines[0]}<br />{lines[1]}<br />{lines[2]}</>
  }

  // The design: white rounded card with top info block and large image below.
  return (
    <article
      aria-labelledby={headingId}
      className="max-w-sm w-full rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
      style={{ border: 'none', background: 'transparent' }}
    >
      <Link
        href={`/guitars/${p.slug || p.id}`}
        aria-label={`Ir a ${titleText || 'producto'}`}
        className="block"
      >
        {/* Top info overlay moved on top of the image to show blur through image */}

        {/* Image section */}
        <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: '460px', maxHeight: '620px' }}>
          {img && !errored ? (
            <img
              src={img}
              alt={titleText || 'Imagen del producto'}
              onError={() => setErrored(true)}
              onLoad={() => setErrored(false)}
              className="w-full h-full object-cover object-center"
              style={{ display: 'block', width: '100%', height: '100%' }}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
              <span className="text-3xl">🎸</span>
            </div>
          )}

          {/* Top translucent overlay placed over the image */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between px-4 py-3 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.28)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              backdropFilter: 'blur(12px) saturate(120%)',
              zIndex: 20,
            }}
          >
            <div className="flex-1">
              <h3 id={headingId} className="text-lg font-semibold text-white leading-tight mb-0">
                {renderTitleThreeLines(titleText)}
              </h3>
              {p.price && (
                <div className="text-sm font-bold text-white mt-1">{p.price}</div>
              )}
            </div>
            <div className="flex-shrink-0 ml-3">
              <button
                className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-thin hover:bg-white/20"
                aria-label={`Ver detalles de ${titleText}`}
                onClick={e => { e.preventDefault(); window.location.href = `/guitars/${p.slug || p.id}` }}
                type="button"
                style={{ boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Ver detalles
              </button>
            </div>
          </div>

          {/* Lower-left: show specs (mics · madera · model) as small pills */}
            <div className="absolute left-4 bottom-4 flex items-center gap-2">
              {(() => {
                const specs = []
                if (p.mics) specs.push(String(p.mics).trim())
                if (p.wood) specs.push(String(p.wood).trim())
                if (p.model) specs.push(String(p.model).trim())
                if (!specs.length) return null
                return specs.map((s, i) => (
                  <div key={i} className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">{s}</div>
                ))
              })()}
            </div>
        </div>
      </Link>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @media (min-width: 640px) {
          article { width: 420px }
        }
        @media (min-width: 1024px) {
          article { width: 480px }
        }
      `}</style>
    </article>
  )
}

export default ProductCard;
 
