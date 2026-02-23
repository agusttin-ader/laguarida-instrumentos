"use client"

import React, { useState } from 'react'
import ProductGrid from './ProductGrid'

export default function FeaturedSelection(){
  const [q, setQ] = useState('')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 id="seleccion-heading" className="text-2xl md:text-3xl font-semibold text-gray-900">Selección destacada</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="search-pill" role="search">
              <span className="search-icon" aria-hidden>
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
      </div>

      <article>
        <ProductGrid filters={{ q }} />
      </article>
    </>
  )
}
