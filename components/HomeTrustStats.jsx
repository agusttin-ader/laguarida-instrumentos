"use client"

import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ScrollReveal from './ScrollReveal'

/** Actualizar si el contador pasa a venir de API o env. */
const TRUST_SALES_COUNT = 184

const FOLLOWERS_K = 15.3
const QUALITY_PCT = 100

const DURATION_MS = 1500
/** Retraso antes del conteo en desktop para alinear con el fade del ScrollReveal. */
const REVEAL_TO_COUNT_MS = 160
/** 1 = actualización cada frame (conteo más legible); subir a 2 si hiciera falta aligerar CPU. */
const FRAME_STRIDE = 1

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

/** #C9A227 — gradientes inline evitan fallos de Tailwind con `var(--x)/opacity`. */
const GRADIENT_GOLD_H = 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 39, 0.75) 50%, transparent 100%)'
const GRADIENT_CREAM_H = 'linear-gradient(90deg, transparent 0%, rgba(247, 244, 238, 0.28) 50%, transparent 100%)'
const GRADIENT_GOLD_V = 'linear-gradient(180deg, transparent 0%, rgba(201, 162, 39, 0.65) 45%, rgba(201, 162, 39, 0.65) 55%, transparent 100%)'
const GRADIENT_GOLD_H_MOBILE = 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 39, 0.6) 50%, transparent 100%)'

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

function EditorialSectionRule() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2" aria-hidden>
      <div
        className="h-[2px] w-full min-w-0 shrink-0"
        style={{ background: GRADIENT_GOLD_H }}
      />
      <div
        className="h-px w-full min-w-0 shrink-0"
        style={{ background: GRADIENT_CREAM_H }}
      />
    </div>
  )
}

function GoldRuleVertical() {
  return (
    <div
      className="hidden w-[2px] shrink-0 self-stretch md:mx-3 md:block md:min-h-[7.5rem] lg:mx-4 lg:min-h-[8rem]"
      style={{ background: GRADIENT_GOLD_V }}
      aria-hidden
    />
  )
}

function GoldRuleMobileBetween() {
  return (
    <div
      className="my-4 h-[2px] w-full min-w-0 shrink-0 md:hidden"
      style={{ background: GRADIENT_GOLD_H_MOBILE }}
      aria-hidden
    />
  )
}

const StatCard = memo(function StatCard({ label, value, description, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-[color:rgba(201,162,39,0.2)] bg-[var(--dark-bg-card)] px-4 py-5 text-left shadow-[inset_0_1px_0_0_var(--vintage-gold-soft)] md:gap-2.5 md:rounded-xl md:px-5 md:py-6 ${className}`}
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

/**
 * Bloque de confianza — mismo ScrollReveal que el resto del home; conteo al hacerse visible.
 */
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
      className="-mx-4 mt-6 mb-5 w-[calc(100%+2rem)] bg-[var(--dark-bg-page)] sm:-mx-5 sm:mt-8 sm:mb-7 sm:w-[calc(100%+2.5rem)] md:mx-0 md:mt-10 md:mb-10 md:w-full"
      aria-label="Indicadores de trayectoria y confianza"
    >
      <ScrollReveal
        className="block w-full"
        threshold={0.08}
        rootMargin="64px 0px -8% 0px"
        onVisible={onReveal}
      >
        <EditorialSectionRule />

        <div className="md:hidden">
          <div className="flex flex-col gap-0 px-4 pb-3 pt-3">
            {STATS_META.map((item, index) => (
              <Fragment key={item.key}>
                {index > 0 ? <GoldRuleMobileBetween /> : null}
                <StatCard
                  label={item.label}
                  value={valueFor(item.key)}
                  description={item.description}
                  className="w-full"
                />
              </Fragment>
            ))}
          </div>
        </div>

        <div className="mx-auto hidden max-w-6xl md:block md:px-4 md:py-8 lg:px-0 lg:py-10">
          <div className="flex min-w-0 flex-row items-stretch justify-center gap-0 lg:gap-1">
            {STATS_META.map((item, index) => (
              <Fragment key={item.key}>
                {index > 0 ? (
                  <>
                    <GoldRuleMobileBetween />
                    <GoldRuleVertical />
                  </>
                ) : null}
                <StatCard
                  label={item.label}
                  value={valueFor(item.key)}
                  description={item.description}
                  className="flex-1"
                />
              </Fragment>
            ))}
          </div>
        </div>

        <EditorialSectionRule />
      </ScrollReveal>
    </section>
  )
}
