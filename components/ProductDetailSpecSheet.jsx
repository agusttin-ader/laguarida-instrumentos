'use client'

import React from 'react'

function SpecRow({ spec }) {
  return (
    <li className="product-detail-body text-[14px] sm:text-[15px] md:text-[16px] leading-[1.48] sm:leading-[1.5] text-[var(--dark-text-secondary)]">
      <span className="text-[var(--dark-muted)]">{spec.label}</span>{' '}
      <span className="font-medium text-[var(--dark-text-primary)]">{spec.value}</span>
    </li>
  )
}

export default function ProductDetailSpecSheet({ specs = [] }) {
  const specList = Array.isArray(specs) ? specs.filter((s) => s?.value && String(s.value).trim() !== '') : []
  if (!specList.length) return null

  return (
    <div className="product-detail-spec-sheet border-t border-[var(--dark-border)] pt-5 sm:pt-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dark-muted)] sm:mb-3.5">
        Ficha técnica
      </p>
      <ul className="m-0 grid grid-cols-1 gap-x-6 gap-y-1 p-0 sm:grid-cols-2">
        {specList.map((spec, idx) => (
          <SpecRow key={`${spec.label}-${idx}`} spec={spec} />
        ))}
      </ul>
    </div>
  )
}
