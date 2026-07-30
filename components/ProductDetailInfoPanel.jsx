function HighlightsRow({ chipList }) {
  if (!chipList.length) return null
  return (
    <div className="pb-2 max-md:pb-1.5 sm:pb-3">
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

/** PDP: destacados + descripción (la ficha técnica va junto al precio/CTA). */
export default function ProductDetailInfoPanel({ highlights = [], children }) {
  const chipList = Array.isArray(highlights)
    ? highlights.map((s) => String(s).trim()).filter(Boolean)
    : []

  return (
    <div className="product-detail-info-panel w-full space-y-3 max-md:space-y-2.5 sm:space-y-4">
      <HighlightsRow chipList={chipList} />
      <div className="product-detail-info-panel__single">{children}</div>
    </div>
  )
}
