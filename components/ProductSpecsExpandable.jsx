"use client"

import React, { useState } from 'react'

const INITIAL_VISIBLE = 3

function SpecItem({ spec, className = '', style }) {
  return (
    <li
      className={`text-[13px] leading-snug text-[var(--dark-text-secondary)] ${className}`.trim()}
      style={style}
    >
      <span className="text-[var(--dark-muted)]">{spec.label}</span>{' '}
      <span className="font-medium text-[var(--dark-text-primary)]">{spec.value}</span>
    </li>
  )
}

/**
 * En móvil: muestra las primeras 3 specs y una flecha táctil para desplegar el resto.
 * En desktop: muestra todas las specs sin flecha.
 */
export default function ProductSpecsExpandable({ specs = [] }) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = specs.length > INITIAL_VISIBLE

  if (!specs.length) return null

  const extraSpecs = specs.slice(INITIAL_VISIBLE)

  return (
    <>
      {/* Solo móvil: lista con expand/collapse */}
      <div className="md:hidden mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dark-text-secondary)] mb-3">Ficha técnica</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
          {specs.slice(0, INITIAL_VISIBLE).map((spec, idx) => (
            <SpecItem key={idx} spec={spec} />
          ))}
        </ul>
        {hasMore && (
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${expanded ? 'product-specs-expandable-expanded' : ''}`}
            style={{
              maxHeight: expanded ? '800px' : 0,
              opacity: expanded ? 1 : 0
            }}
          >
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 pt-2">
              {extraSpecs.map((spec, idx) => (
                <SpecItem
                  key={idx}
                  spec={spec}
                  className="spec-item-extra"
                  style={expanded ? { animationDelay: `${idx * 40}ms` } : undefined}
                />
              ))}
            </ul>
          </div>
        )}
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Ver menos especificaciones' : 'Ver más especificaciones'}
            className="no-custom-btn mt-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--dark-muted)] hover:text-[var(--dark-text-primary)] active:opacity-80 transition-transform active:scale-95 touch-manipulation"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Solo desktop: todas las specs, sin flecha */}
      <div className="hidden md:block mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dark-text-secondary)] mb-3">Ficha técnica</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
          {specs.map((spec, idx) => (
            <SpecItem key={idx} spec={spec} />
          ))}
        </ul>
      </div>
    </>
  )
}
