'use client'

import { useEffect, useState } from 'react'

function readMobileHeaderOffsetPx() {
  if (typeof window === 'undefined') return 64

  const header = document.querySelector('.site-header-mobile-shell')
  if (header?.offsetHeight) return header.offsetHeight

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--mobile-header-h')
    .trim()
  const parsed = parseFloat(raw)
  if (raw.endsWith('px') && Number.isFinite(parsed)) return parsed
  if (raw.endsWith('rem') && Number.isFinite(parsed)) {
    return parsed * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  return 64
}

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

    let observer

    const bindObserver = () => {
      observer?.disconnect()

      const headerOffset = readMobileHeaderOffsetPx()
      observer = new IntersectionObserver(
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
    }

    bindObserver()

    const header = document.querySelector('.site-header-mobile-shell')
    const resizeObserver =
      header && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(bindObserver)
        : null
    resizeObserver?.observe(header)

    return () => {
      observer?.disconnect()
      resizeObserver?.disconnect()
    }
  }, [])

  if (loading) return null

  return (
    <div
      className={`catalog-mobile-sticky-summary md:hidden fixed left-0 right-0 z-[calc(var(--z-header-mobile)-1)] border-b border-white/[0.08] bg-[color-mix(in_srgb,var(--dark-bg-card)_92%,transparent)] px-[var(--mobile-gutter)] py-2.5 backdrop-blur-md motion-reduce:transition-none ${
        visible ? 'is-visible translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
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
