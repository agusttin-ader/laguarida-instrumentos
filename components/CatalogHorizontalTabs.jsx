'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Tabs horizontales mobile: texto + línea inferior en el ítem activo (sin pills).
 * Con `showOverflowHint`, muestra degradé + flecha a la derecha mientras haya más marcas.
 */
export default function CatalogHorizontalTabs({
  label,
  ariaLabel,
  items,
  className = '',
  showOverflowHint = false,
}) {
  const scrollRef = useRef(null)
  const [canScrollMore, setCanScrollMore] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) {
      setCanScrollMore(false)
      return
    }
    const maxScroll = el.scrollWidth - el.clientWidth
    const hasOverflow = maxScroll > 4
    const atEnd = el.scrollLeft >= maxScroll - 6
    setCanScrollMore(hasOverflow && !atEnd)
  }, [])

  useEffect(() => {
    if (!showOverflowHint) {
      setCanScrollMore(false)
      return undefined
    }

    const el = scrollRef.current
    if (!el) return undefined

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateScrollState)
      ro.observe(el)
    }

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
      ro?.disconnect()
    }
  }, [showOverflowHint, items, updateScrollState])

  return (
    <nav aria-label={ariaLabel || label} className={`catalog-mobile-tabs md:hidden ${className}`}>
      {label ? (
        <p className="catalog-mobile-tabs__kicker mb-2 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dark-muted)] max-md:px-[var(--mobile-gutter)]">
          {label}
        </p>
      ) : null}

      <div
        className={[
          'catalog-mobile-tabs__track',
          showOverflowHint ? 'catalog-mobile-tabs__track--hint' : '',
          showOverflowHint && canScrollMore ? 'is-scrollable' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          ref={scrollRef}
          className="catalog-mobile-tabs__scroll flex overflow-x-auto overscroll-x-contain border-b border-white/[0.08] px-4 pb-px max-md:px-[var(--mobile-gutter)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth scroll-px-[var(--mobile-gutter)]"
        >
          {items.map((item) => {
            const itemClass = `catalog-mobile-tabs__item shrink-0 snap-start ${
              item.active ? 'catalog-mobile-tabs__item--active' : ''
            }`

            const content = (
              <>
                <span className="catalog-mobile-tabs__label">{item.label}</span>
                {item.sublabel ? (
                  <span className="catalog-mobile-tabs__meta">{item.sublabel}</span>
                ) : null}
              </>
            )

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className={`no-custom-btn ${itemClass}`}>
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`no-custom-btn ${itemClass}`}
              >
                {content}
              </button>
            )
          })}
        </div>

        {showOverflowHint ? (
          <div
            className="catalog-mobile-tabs__hint"
            aria-hidden={!canScrollMore}
          >
            <span className="catalog-mobile-tabs__hint-fade" />
            <span className="catalog-mobile-tabs__hint-glyph" title="Deslizá para ver más">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="catalog-mobile-tabs__hint-label">Deslizá</span>
            </span>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
