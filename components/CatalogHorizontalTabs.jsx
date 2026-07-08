'use client'

import Link from 'next/link'

/**
 * Tabs horizontales mobile: texto + línea inferior en el ítem activo (sin pills).
 */
export default function CatalogHorizontalTabs({ label, ariaLabel, items, className = '' }) {
  return (
    <nav aria-label={ariaLabel || label} className={`catalog-mobile-tabs md:hidden ${className}`}>
      {label ? (
        <p className="catalog-mobile-tabs__kicker mb-2 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dark-muted)] max-md:px-[var(--mobile-gutter)]">
          {label}
        </p>
      ) : null}
      <div className="catalog-mobile-tabs__scroll flex overflow-x-auto border-b border-white/[0.08] px-4 pb-px max-md:px-[var(--mobile-gutter)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-px-[var(--mobile-gutter)]">
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
    </nav>
  )
}
