'use client'

import { useEffect, useState } from 'react'

export default function CatalogMobileStickySummary({
  count = 0,
  loading = false,
  filtersActive = false,
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const sentinel = document.getElementById('catalog-mobile-sentinel')
    if (!sentinel) return undefined

    const headerOffset =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--mobile-header-h')
      ) || 64

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${headerOffset + 4}px 0px 0px 0px`,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  if (loading) return null

  return (
    <div
      className={`catalog-mobile-sticky-summary md:hidden fixed left-0 right-0 top-[var(--mobile-header-h,4rem)] z-[calc(var(--z-header)-1)] border-b border-white/[0.08] bg-[color-mix(in_srgb,var(--dark-bg-card)_92%,transparent)] px-[var(--mobile-gutter)] py-2.5 backdrop-blur-md transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      <p className="text-center text-[13px] tabular-nums tracking-tight text-[var(--dark-text-secondary)]">
        <span className="font-semibold text-[var(--dark-text-primary)]">{count}</span>
        {count === 1 ? ' instrumento' : ' instrumentos'}
        {filtersActive ? (
          <span className="text-[var(--dark-muted)]"> · filtrados</span>
        ) : (
          <span className="text-[var(--dark-muted)]"> · disponibles</span>
        )}
      </p>
    </div>
  )
}
