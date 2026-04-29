"use client"

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ScrollReveal from './ScrollReveal'

const TRUST_SALES_COUNT = 184

const FOLLOWERS_K = 15.3
const QUALITY_PCT = 100

const DURATION_MS = 1500
const REVEAL_TO_COUNT_MS = 160
const FRAME_STRIDE = 1

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

const STATS_META = [
  {
    key: 'followers',
    label: 'Trayectoria',
    description: 'Seguidores y comunidad activa'
  },
  {
    key: 'sales',
    label: 'Ventas concretadas',
    description: 'Instrumentos vendidos con envío y seguimiento'
  },
  {
    key: 'quality',
    label: 'Calidad de atención',
    description: 'Asesoramiento personalizado antes de comprar'
  }
]

function formatFollowers(k) {
  return `${k.toFixed(1).replace('.', ',')}k`
}

function formatSales(n) {
  return String(Math.round(n))
}

function formatQuality(p) {
  return `${Math.round(p)}%`
}

const StatCard = memo(function StatCard({ label, value, description, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border-0 bg-[var(--dark-bg-card)] px-4 py-5 text-left md:gap-2.5 md:rounded-xl md:px-5 md:py-6 ${className}`}
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--vintage-gold)] md:text-xs md:tracking-[0.18em]">
        {label}
      </p>
      <p className="flex min-h-[2.75rem] items-baseline text-2xl font-bold tabular-nums tracking-tight text-[var(--color-white)] md:min-h-[3rem] md:text-[1.75rem] lg:text-[1.85rem]">
        <span className="inline-block min-w-[6.5ch] max-w-full">{value}</span>
      </p>
      <p className="text-xs leading-relaxed text-[var(--vintage-muted)] md:text-[0.8125rem]">{description}</p>
    </div>
  )
})

function TrustSectionRulesDouble() {
  return (
    <div className="flex w-full flex-col gap-1" aria-hidden>
      <div className="h-px w-full shrink-0 bg-[var(--vintage-gold)]/70" />
      <div className="h-px w-full shrink-0 bg-[var(--vintage-gold)]/40" />
    </div>
  )
}

export default function HomeTrustStats() {
  const rafRef = useRef(0)
  const countTimeoutRef = useRef(0)
  const cancelledRef = useRef(false)
  const [display, setDisplay] = useState(() => ({
    k: 0,
    sales: 0,
    pct: 0
  }))

  const runCountUp = useCallback(() => {
    const t0 = performance.now()
    let frame = 0

    const tick = (now) => {
      if (cancelledRef.current) return

      const t = Math.min(1, (now - t0) / DURATION_MS)
      const e = easeOutCubic(t)
      const next = {
        k: FOLLOWERS_K * e,
        sales: TRUST_SALES_COUNT * e,
        pct: QUALITY_PCT * e
      }

      const done = t >= 1
      if (done || frame % FRAME_STRIDE === 0) {
        setDisplay(
          done
            ? { k: FOLLOWERS_K, sales: TRUST_SALES_COUNT, pct: QUALITY_PCT }
            : next
        )
      }

      frame += 1

      if (!done && !cancelledRef.current) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const onReveal = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay({
        k: FOLLOWERS_K,
        sales: TRUST_SALES_COUNT,
        pct: QUALITY_PCT
      })
      return
    }
    const countDelay = window.matchMedia('(min-width: 768px)').matches ? REVEAL_TO_COUNT_MS : 0
    countTimeoutRef.current = window.setTimeout(() => {
      if (!cancelledRef.current) runCountUp()
    }, countDelay)
  }, [runCountUp])

  useEffect(() => {
    cancelledRef.current = false
    return () => {
      cancelledRef.current = true
      window.clearTimeout(countTimeoutRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const values = useMemo(
    () => ({
      followers: formatFollowers(display.k),
      sales: formatSales(display.sales),
      quality: formatQuality(display.pct)
    }),
    [display.k, display.sales, display.pct]
  )

  const valueFor = (key) =>
    key === 'followers' ? values.followers : key === 'sales' ? values.sales : values.quality

  return (
    <section
      className="mx-0 mt-0 mb-2 w-full bg-[var(--dark-bg-page)] sm:mb-2 md:mt-1 md:mb-3"
      aria-label="Indicadores de trayectoria y confianza"
    >
      <ScrollReveal
        className="block w-full"
        threshold={0.08}
        rootMargin="64px 0px -8% 0px"
        onVisible={onReveal}
      >
        <div className="flex flex-col gap-2 px-0 pt-1 pb-3 md:mx-auto md:max-w-6xl md:gap-3 md:px-0 md:pt-2 md:pb-5 lg:px-0 lg:pt-2 lg:pb-5">
          <TrustSectionRulesDouble />
          <div className="flex flex-col gap-3 md:hidden">
            {STATS_META.map((item) => (
              <StatCard
                key={item.key}
                label={item.label}
                value={valueFor(item.key)}
                description={item.description}
                className="w-full !gap-1 !py-3 md:!gap-1.5 md:!py-3.5 [&>p:nth-of-type(2)]:!min-h-[2.1rem] md:[&>p:nth-of-type(2)]:!min-h-[2.35rem]"
              />
            ))}
          </div>
          <div className="hidden min-w-0 md:flex md:flex-row md:items-stretch md:gap-4 lg:gap-5">
            {STATS_META.map((item) => (
              <StatCard
                key={item.key}
                label={item.label}
                value={valueFor(item.key)}
                description={item.description}
                className="min-w-0 flex-1 !gap-1 !py-3 md:!gap-1.5 md:!py-3.5 [&>p:nth-of-type(2)]:!min-h-[2.1rem] md:[&>p:nth-of-type(2)]:!min-h-[2.35rem]"
              />
            ))}
          </div>
          <TrustSectionRulesDouble />
        </div>
      </ScrollReveal>
    </section>
  )
}
