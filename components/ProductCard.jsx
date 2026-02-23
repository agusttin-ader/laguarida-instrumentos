"use client"

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
  function keyFragment(text, words = 12){
    if (!text) return ''
    // prefer first full sentence
    const s = String(text).trim()
    const firstSentenceMatch = s.match(/^(.*?[.!?])\s+/)
    if (firstSentenceMatch && firstSentenceMatch[1]){
      const sent = firstSentenceMatch[1].trim()
      const wordCount = sent.split(/\s+/).length
      if (wordCount <= words) return sent
    }
    // fallback: first `words` words (no ellipsis)
    const parts = s.split(/\s+/).filter(Boolean).slice(0, words)
    return parts.join(' ')
  }
  
  // Extract up to 3 specifications from a free-form description.
  // Priority: madera (wood), color, pickups (type). If none of the three
  // are present, try to include 'puente' (bridge). Return an array of up
  // to 3 short spec strings.
  function extractSpecs(text){
    if (!text) return []
    const s = String(text)

    const patterns = {
      madera: [ /\balder\b/i, /\barce\b/i, /\bmaple\b/i, /\bash\b/i, /\bmahogany\b/i, /\bcaoba\b/i, /\bbasswood\b/i, /\blinden\b/i, /\bpoplar\b/i, /\b\w+wood\b/i ],
      color: [ /\b3T Sunburst\b/i, /\bnitro 3T Sunburst\b/i, /\bsunburst\b/i, /\bblack\b/i, /\bnegro\b/i, /\bwhite\b/i, /\bblanco\b/i, /\bnatural\b/i, /\bcherry\b/i, /\bamber\b/i, /\bbrown\b/i ]
    }

    // More specific pickups patterns with normalized labels
    const pickupsPatterns = [
      [/\b(p90|p-?90)\b/i, 'P90'],
      [/\b(humbucker|humbuckers|hh)\b/i, 'Humbuckers'],
      [/\b(single-?coil|single coil|single|sss)\b/i, 'Single-coil'],
      [/\b(hss|sss)\b/i, 'SSS/HSS']
    ]

    const bridgePattern = /\b(bridge|puente|tremolo|vibrato|hardtail|lyre)\b/i

    const found = []

    function pushMatch(list){
      for (const rx of list){
        const m = s.match(rx)
        if (m && m[0]){
          const val = String(m[0]).trim()
          // avoid duplicates
          if (!found.some(f => f.toLowerCase() === val.toLowerCase())){
            found.push(titleCase(val))
            return true
          }
        }
      }
      return false
    }

    function pushPickupMatch(list){
      for (const item of list){
        const rx = item[0]
        const label = item[1]
        const m = s.match(rx)
        if (m){
          if (!found.some(f => f.toLowerCase() === label.toLowerCase())){
            found.push(label)
            return true
          }
        }
      }
      return false
    }

    function titleCase(str){
      return str.replace(/\s+/g,' ').trim().replace(/\b(\w)/g, c => c.toUpperCase())
    }

    // Try in priority order
    pushMatch(patterns.madera)
    pushMatch(patterns.color)
    pushPickupMatch(pickupsPatterns)

    // If none of the three were found but we can capture a detailed pickups
    // description like "Pickups CS Fat 50'", extract the text after "pickups".
    if (found.length < 3){
      const pickmatch = s.match(/pickups?[:\s\-–—]+([^\n\r.]+)/i)
      if (pickmatch && pickmatch[1]){
        const desc = String(pickmatch[1]).trim().replace(/[.,;:]+$/,'')
        if (desc && !found.some(f => f.toLowerCase() === desc.toLowerCase())){
          found.push(desc)
        }
      }
    }

    // If still space and bridge exists, include bridge
    if (found.length < 3){
      const mb = s.match(bridgePattern)
      if (mb && mb[0]){
        const val = String(mb[0]).trim()
        if (!found.some(f => f.toLowerCase() === val.toLowerCase())){
          found.push(titleCase(val))
        }
      }
    }

    // Truncate each spec to at most 6 words, and limit to 3 specs total
    const truncated = found.map(f => {
      const parts = String(f).split(/\s+/).filter(Boolean).slice(0,6)
      return parts.join(' ')
    })
    return truncated.slice(0,3)
  }
  
  
  function renderTitleThreeLines(text){
    if (!text) return <>&nbsp;<br />&nbsp;<br />&nbsp;</>
    const words = String(text).trim().split(/\s+/).filter(Boolean)
    // If few words, place one per line and pad with non-breaking spaces
    if (words.length <= 3){
      const lines = [words[0] || '\u00A0', words[1] || '\u00A0', words[2] || '\u00A0']
      return (
        <>
          {lines[0]}<br />{lines[1]}<br />{lines[2]}
        </>
      )
    }

    // Distribute words into 3 chunks as evenly as possible
    const base = Math.floor(words.length / 3)
    const rem = words.length % 3
    const counts = [base, base, base]
    for (let i = 0; i < rem; i++) counts[i]++
    const chunks = []
    let idx = 0
    for (let i = 0; i < 3; i++){
      const c = words.slice(idx, idx + counts[i]).join(' ')
      chunks.push(c || '\u00A0')
      idx += counts[i]
    }
    return (
      <>
        {chunks[0]}<br />{chunks[1]}<br />{chunks[2]}
      </>
    )
  }
  return (
    <article aria-labelledby={headingId} className="card-compact transform transition-transform duration-200 hover:-translate-y-1">
      {/* Reveal wrapper around the image and meta so cards animate on scroll */}
      <div>
        <Link href={`/guitars/${p.slug || p.id}`} aria-label={`Ir a ${titleText || 'producto'}`} className="block w-full">
          {img && !errored ? (
            <div className="w-full rounded-md overflow-hidden flex items-center justify-center bg-white" style={{aspectRatio: '3 / 4'}}>
              <img
                src={img}
                alt={titleText || 'Imagen del producto'}
                onError={() => setErrored(true)}
                onLoad={() => setErrored(false)}
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          ) : (
            <div className="image-placeholder w-full rounded-md overflow-hidden flex items-center justify-center bg-white" style={{aspectRatio: '3 / 4'}}></div>
          )}
        </Link>
      </div>

      <div className="mt-4 card-body">
        <p className="text-sm subtitle-compact muted-text">{item.subtitle || ''}</p>
        <h3 id={headingId} className="mt-2 card-title text-gray-900">
          {renderTitleThreeLines(titleText)}
        </h3>
        {p.price && <div className="mt-2 price-large">{p.price}</div>}
        <p className="mt-4 card-desc">
          {(() => {
            // Start with explicit spec fields if present
            const specsFromFields = []
            if (p.wood) specsFromFields.push(String(p.wood).trim())
            if (p.mics) specsFromFields.push(String(p.mics).trim())
            if (p.model) specsFromFields.push(String(p.model).trim())

            // Then extract from description, avoiding duplicates
            const extracted = extractSpecs(p.description || '')
            for (const s of extracted) {
              if (!specsFromFields.some(x => x.toLowerCase() === String(s).toLowerCase())) specsFromFields.push(s)
            }

            if (specsFromFields.length) return specsFromFields.join(' · ')
            return keyFragment(p.description || 'Edición limitada — diseño editorial con foco en proporciones.', 14)
          })()}
        </p>
        <div className="mt-4 card-actions">
          <Link href={`/guitars/${p.slug || p.id}`} className="btn-elegant--light" aria-label={`Ver detalles de ${titleText}`}>Ver detalles</Link>
        </div>
      </div>
    </article>
  )
}
export default React.memo(ProductCard)
