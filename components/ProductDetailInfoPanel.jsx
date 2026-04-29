'use client'

import React, { useId, useState } from 'react'

function SpecRow({ spec }) {
  return (
    <li className="product-detail-body text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] leading-[1.48] sm:leading-[1.5] text-[var(--dark-text-secondary)]">
      <span className="text-[var(--dark-muted)]">{spec.label}</span>{' '}
      <span className="font-medium text-[var(--dark-text-primary)]">{spec.value}</span>
    </li>
  )
}

function HighlightsRow({ chipList }) {
  if (!chipList.length) return null
  return (
    <div className="pb-3 sm:pb-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dark-muted)] mb-1.5">
        Destacados
      </p>
      <div
        className="flex gap-2 md:flex-wrap max-md:flex-nowrap max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-1 max-md:-mx-1 max-md:px-1 max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {chipList.map((line, i) => (
          <span
            key={i}
            role="listitem"
            className="inline-flex max-w-full items-center rounded-full border border-white/[0.12] bg-black/30 px-2.5 py-1 text-left text-[11px] sm:text-[12px] leading-snug text-[var(--dark-text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-md:snap-start max-md:shrink-0 max-md:max-w-[min(100%,260px)] supports-[backdrop-filter]:backdrop-blur-sm"
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * PDP: destacados en carril horizontal (snap en móvil) + tabs Descripción / Ficha (subrayado, sin “card”).
 */
export default function ProductDetailInfoPanel({ highlights = [], specs = [], children }) {
  const uid = useId()
  const tabDescId = `${uid}-tab-desc`
  const tabSpecId = `${uid}-tab-spec`
  const panelDescId = `${uid}-panel-desc`
  const panelSpecId = `${uid}-panel-spec`

  const chipList = Array.isArray(highlights)
    ? highlights.map((s) => String(s).trim()).filter(Boolean)
    : []
  const specList = Array.isArray(specs) ? specs.filter((s) => s?.value && String(s.value).trim() !== '') : []

  const [tab, setTab] = useState('description')

  const shellClass = 'product-detail-info-panel w-full space-y-3 sm:space-y-4'

  if (specList.length === 0) {
    return (
      <div className={shellClass}>
        <HighlightsRow chipList={chipList} />
        <div className="product-detail-info-panel__single">{children}</div>
      </div>
    )
  }

  return (
    <div className={shellClass}>
      <HighlightsRow chipList={chipList} />

      <div
        role="tablist"
        aria-label="Información del producto"
        className="flex border-b border-[var(--dark-border)]"
      >
        <button
          type="button"
          role="tab"
          id={tabDescId}
          aria-selected={tab === 'description'}
          aria-controls={panelDescId}
          tabIndex={tab === 'description' ? 0 : -1}
          onClick={() => setTab('description')}
          className={`no-custom-btn min-h-[44px] flex-1 px-2 py-2 text-center text-[12px] sm:text-[13px] font-semibold tracking-tight transition-[color,box-shadow,border-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--palette-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)] border-b-2 -mb-px ${
            tab === 'description'
              ? 'border-[var(--palette-orange)] text-[var(--dark-text-primary)] shadow-[0_8px_24px_rgba(242,174,48,0.18)]'
              : 'border-transparent text-[var(--dark-muted)] hover:text-[var(--palette-sand)]'
          }`}
        >
          Descripción
        </button>
        <button
          type="button"
          role="tab"
          id={tabSpecId}
          aria-selected={tab === 'specs'}
          aria-controls={panelSpecId}
          tabIndex={tab === 'specs' ? 0 : -1}
          onClick={() => setTab('specs')}
          className={`no-custom-btn min-h-[44px] flex-1 px-2 py-2 text-center text-[12px] sm:text-[13px] font-semibold tracking-tight transition-[color,box-shadow,border-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--palette-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)] border-b-2 -mb-px ${
            tab === 'specs'
              ? 'border-[var(--palette-orange)] text-[var(--dark-text-primary)] shadow-[0_8px_24px_rgba(242,174,48,0.18)]'
              : 'border-transparent text-[var(--dark-muted)] hover:text-[var(--palette-sand)]'
          }`}
        >
          Ficha técnica
        </button>
      </div>

      <div className="product-detail-info-panel__panels overflow-hidden pt-2.5 sm:pt-3">
        <div
          className={`flex w-[200%] transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:duration-0 ${
            tab === 'description' ? 'translate-x-0' : '-translate-x-1/2'
          }`}
        >
          <div
            id={panelDescId}
            role="tabpanel"
            aria-labelledby={tabDescId}
            aria-hidden={tab !== 'description'}
            className={`product-detail-info-panel__panel w-1/2 shrink-0 pr-1 sm:pr-2 ${
              tab !== 'description' ? 'pointer-events-none select-none' : ''
            }`}
          >
            {children}
          </div>
          <div
            id={panelSpecId}
            role="tabpanel"
            aria-labelledby={tabSpecId}
            aria-hidden={tab !== 'specs'}
            className={`product-detail-info-panel__panel w-1/2 shrink-0 pl-1 sm:pl-2 ${
              tab !== 'specs' ? 'pointer-events-none select-none' : ''
            }`}
          >
            <ul className="m-0 grid grid-cols-1 gap-x-6 gap-y-1 p-0 sm:grid-cols-2">
              {specList.map((spec, idx) => (
                <SpecRow key={`${spec.label}-${idx}`} spec={spec} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
