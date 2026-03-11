"use client"

import React, { useState } from 'react'
import ProductGrid from './ProductGrid'

export default function FeaturedSelection(){
  const [q, setQ] = useState('')

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 md:gap-6 mb-3 sm:mb-5 md:mb-6 section-heading-entrance">
        <h2 id="seleccion-heading" className="section-title-premium section-underline-ocre text-gray-900 dark:text-white">Catalogo</h2>
        <div className="w-full sm:w-auto min-w-0">
          <div className="search-pill w-full sm:max-w-sm" role="search">
            <span className="search-icon flex-shrink-0" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/></svg>
            </span>
            <input
              aria-label="Buscar en selección destacada"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar (ej. Strato, Les Paul)"
              className="search-input"
            />
          </div>
        </div>
      </div>

      <article>
        <ProductGrid filters={{ q }} />
      </article>
    </>
  )
}
