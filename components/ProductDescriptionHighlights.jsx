import React from 'react'

/** Lista de destacados encima de la descripción larga (ficha de producto). */
export default function ProductDescriptionHighlights({ items = [] }) {
  const list = Array.isArray(items)
    ? items.map((s) => String(s).trim()).filter(Boolean)
    : []
  if (!list.length) return null

  return (
    <div className="product-detail-highlights mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-[var(--dark-border)]">
      <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dark-text-secondary)] mb-3 sm:mb-3.5">
        Destacados
      </p>
      <ul className="m-0 list-none space-y-2.5 sm:space-y-3 pl-0">
        {list.map((line, i) => (
          <li
            key={i}
            className="flex gap-3 text-[15px] sm:text-[16px] md:text-[17px] leading-snug text-[var(--dark-text-secondary)]"
          >
            <span
              className="mt-[0.35rem] shrink-0 h-1.5 w-1.5 rounded-full bg-[var(--vintage-gold)] shadow-[0_0_12px_rgba(var(--palette-gold-rgb),0.35)]"
              aria-hidden
            />
            <span className="min-w-0 text-[var(--dark-text-primary)] font-medium">{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
