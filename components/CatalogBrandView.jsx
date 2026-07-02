'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useMemo } from 'react'
import CatalogSidebarDivider from './CatalogSidebarDivider'
import ProductCard from './ProductCard'
import {
  buildBrandModelGroups,
} from '../lib/catalog/catalogTaxonomy'

function SidebarModelItem({ group, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(group.id)}
      className={`no-custom-btn w-full border-l-2 py-4 pl-5 pr-2 text-left transition-colors ${
        active
          ? 'border-[rgba(var(--palette-gold-rgb),0.65)] bg-white/[0.04]'
          : 'border-transparent hover:border-[rgba(var(--palette-gold-rgb),0.28)] hover:bg-white/[0.02]'
      }`}
    >
      <p className="font-display text-base font-semibold tracking-tight text-[var(--dark-text-primary)] sm:text-lg">
        {group.label}
      </p>
      {group.subtitle ? (
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--dark-muted)]">
          {group.subtitle}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-[var(--dark-muted)]">
        {group.count} {group.count === 1 ? 'instrumento' : 'instrumentos'}
      </p>
    </button>
  )
}

export default function CatalogBrandView({ brand, products, loading }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modeloParam = searchParams.get('modelo')

  const modelGroups = useMemo(
    () => buildBrandModelGroups(products, brand),
    [products, brand]
  )

  const activeModelId = useMemo(() => {
    if (modeloParam && modelGroups.some((g) => g.id === modeloParam)) return modeloParam
    return modelGroups[0]?.id || null
  }, [modeloParam, modelGroups])

  const activeGroup = modelGroups.find((g) => g.id === activeModelId) || null

  useEffect(() => {
    if (loading || !modelGroups.length) return
    if (modeloParam && modelGroups.some((g) => g.id === modeloParam)) return
    const first = modelGroups[0]?.id
    if (!first) return
    const marca = searchParams.get('marca') || brand.filterBrand
    router.replace(`/catalogo?marca=${encodeURIComponent(marca)}&modelo=${encodeURIComponent(first)}`, {
      scroll: false,
    })
  }, [loading, modelGroups, modeloParam, brand.filterBrand, router, searchParams])

  function selectModel(modelId) {
    const marca = searchParams.get('marca') || brand.filterBrand
    router.push(`/catalogo?marca=${encodeURIComponent(marca)}&modelo=${encodeURIComponent(modelId)}`, {
      scroll: false,
    })
  }

  return (
    <div className="catalog-brand-view">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-[var(--dark-muted)] sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="no-custom-btn transition-colors hover:text-[var(--dark-text-primary)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="opacity-50">/</li>
          <li>
            <Link href="/catalogo" className="no-custom-btn transition-colors hover:text-[var(--dark-text-primary)]">
              Catálogo
            </Link>
          </li>
          <li aria-hidden className="opacity-50">/</li>
          <li className="text-[var(--dark-text-secondary)]" aria-current="page">
            {brand.name}
          </li>
        </ol>
      </nav>

      <Link
        href="/catalogo"
        className="no-custom-btn mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dark-muted)] transition-colors hover:text-[var(--dark-text-primary)] sm:mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver al catálogo
      </Link>

      <header className="mb-8 max-w-3xl sm:mb-10 md:mb-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--dark-muted)]">
          {brand.kicker}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[1.02] tracking-tight text-[var(--dark-text-primary)]">
          {brand.name}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--dark-muted)] sm:text-base">
          Elegí el modelo en la columna izquierda y explorá las unidades disponibles en stock.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-[minmax(220px,280px)_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/[0.05]" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 max-[767px]:gap-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/8 bg-[var(--dark-bg-card)] md:rounded-3xl">
                <div className="aspect-[4/5] w-full animate-pulse bg-white/[0.05] md:aspect-[3/4]" />
                <div className="space-y-2 p-4 md:p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-white/15" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !modelGroups.length ? (
        <div className="rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] px-6 py-10 text-center">
          <p className="font-medium text-[var(--dark-text-primary)]">No hay {brand.name} en stock por ahora.</p>
          <Link
            href="/catalogo"
            className="no-custom-btn mt-4 inline-flex text-sm text-[var(--dark-muted)] underline-offset-4 hover:text-[var(--dark-text-primary)] hover:underline"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 md:hidden snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {modelGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => selectModel(group.id)}
                className={`no-custom-btn shrink-0 snap-start rounded-full border px-4 py-2.5 min-h-[48px] text-xs font-semibold transition-colors duration-200 ${
                  group.id === activeModelId
                    ? 'border-[rgba(var(--palette-gold-rgb),0.5)] bg-[var(--dark-cta-bg)] text-[var(--dark-cta-text)]'
                    : 'border-[var(--dark-border)] bg-[var(--dark-bg-card)] text-[var(--dark-text-secondary)] active:bg-white/[0.04]'
                }`}
              >
                {group.label} ({group.count})
              </button>
            ))}
          </div>

          <div className="catalog-layout-grid grid gap-8 md:grid-cols-[minmax(220px,280px)_1fr] md:gap-10 lg:gap-14">
            <aside className="catalog-sidebar-sticky hidden md:block">
              <nav aria-label={`Modelos ${brand.name}`}>
                {modelGroups.map((group, index) => (
                  <Fragment key={group.id}>
                    {index > 0 ? <CatalogSidebarDivider /> : null}
                    <SidebarModelItem
                      group={group}
                      active={group.id === activeModelId}
                      onSelect={selectModel}
                    />
                  </Fragment>
                ))}
              </nav>
            </aside>

            <div className="min-w-0">
              {activeGroup ? (
                <>
                  <div className="mb-6 border-b border-[var(--dark-border)] pb-5">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--dark-text-primary)] sm:text-[1.75rem]">
                      {activeGroup.label}
                    </h2>
                    {activeGroup.subtitle ? (
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--dark-muted)]">
                        {activeGroup.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-[var(--dark-muted)]">
                      {activeGroup.count} {activeGroup.count === 1 ? 'unidad' : 'unidades'} en stock
                    </p>
                  </div>

                  <div className="product-grid--mobile-enter grid w-full min-w-0 auto-rows-fr grid-cols-1 items-stretch gap-5 max-[767px]:gap-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8">
                    {activeGroup.products.map((item, idx) => (
                      <div
                        key={item.slug || item.id || idx}
                        className="home-grid-product-cell flex h-full min-w-0 w-full [content-visibility:auto] [contain-intrinsic-size:auto_28rem]"
                        style={{ '--grid-cell-i': idx }}
                      >
                        <ProductCard item={item} priority={idx < 2} maxGalleryImages={1} />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
