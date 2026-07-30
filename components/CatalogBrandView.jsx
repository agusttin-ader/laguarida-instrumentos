'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useMemo } from 'react'
import CatalogSidebarDivider from './CatalogSidebarDivider'
import CatalogSidebarBrandLink from './CatalogSidebarBrandLink'
import CatalogSidebarModelItem from './CatalogSidebarModelItem'
import CatalogEditorialCard from './CatalogEditorialCard'
import FilterSelect from './FilterSelect'
import ProductCard from './ProductCard'
import {
  buildBrandModelGroups,
  getCatalogBrandList,
  getModelEmptyStockMessage,
  productMatchesBrand,
} from '../lib/catalog/catalogTaxonomy'
import { catalogHref } from '../lib/catalog/catalogFilters'
import { HOME_BRANDS } from '../lib/data/homeBrands'
import { getModelGroupLogo, getModelGroupLogoHeaderClass } from '../lib/catalog/modelGroupLogos'

function BrandPairHeading({ homeBrand, brandName }) {
  if (!homeBrand?.logo) {
    return (
      <h2 className="font-display text-[1.75rem] font-semibold tracking-tight text-[var(--dark-text-primary)] max-md:hidden sm:text-[2rem]">
        {brandName}
      </h2>
    )
  }

  const partners = homeBrand.partnerLogos || []

  return (
    <div
      className="catalog-brand-pair max-md:hidden"
      role="img"
      aria-label={
        partners.length
          ? `${homeBrand.name} / ${partners.map((p) => p.name).join(' / ')}`
          : homeBrand.name
      }
    >
      <img
        src={homeBrand.logo}
        alt=""
        aria-hidden
        className="catalog-brand-pair__logo"
      />
      {partners.map((partner) => (
        <Fragment key={partner.src}>
          <span className="catalog-brand-pair__sep" aria-hidden>
            /
          </span>
          <img
            src={partner.src}
            alt=""
            aria-hidden
            className="catalog-brand-pair__logo catalog-brand-pair__logo--partner"
          />
        </Fragment>
      ))}
    </div>
  )
}

function BrandIntro({ brand, brandLogo, isOtrosBrand }) {
  return (
    <header className="catalog-page-header__intro">
      <nav aria-label="Breadcrumb" className="mb-1.5 text-xs text-[var(--dark-muted)] sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="no-custom-btn inline-flex min-h-11 items-center transition-colors hover:text-[var(--dark-text-primary)]"
            >
              Inicio
            </Link>
          </li>
          <li aria-hidden className="opacity-50">/</li>
          <li>
            <Link
              href={catalogHref()}
              className="no-custom-btn inline-flex min-h-11 items-center transition-colors hover:text-[var(--dark-text-primary)]"
            >
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
        href={catalogHref()}
        className="no-custom-btn mb-2 inline-flex min-h-[40px] items-center gap-1.5 py-0.5 text-sm font-medium text-[var(--dark-muted)] transition-colors hover:text-[var(--dark-text-primary)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver al catálogo
      </Link>

      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--dark-muted)]">
        {brand.kicker}
      </p>
      {brandLogo ? (
        <img
          src={brandLogo}
          alt={brand.name}
          className="catalog-brand-header__logo mt-2.5"
        />
      ) : (
        <h1 className="section-heading-editorial mt-2.5">
          {brand.name}
        </h1>
      )}
      <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[var(--dark-muted)] sm:mt-3 sm:text-base">
        {isOtrosBrand
          ? 'Instrumentos fuera de las marcas principales. Elegí el tipo en la columna izquierda.'
          : 'Podés ver todo el stock de la marca o filtrar por modelo.'}
      </p>
    </header>
  )
}

export default function CatalogBrandView({
  brand,
  products,
  loading,
  marcaParam = '',
  modeloParam = '',
}) {
  const router = useRouter()

  const isOtrosBrand = brand.id === 'otros'

  const modelGroups = useMemo(
    () => buildBrandModelGroups(products, brand),
    [products, brand]
  )
  const brandList = useMemo(() => getCatalogBrandList(products), [products])

  const brandProducts = useMemo(
    () => products.filter((p) => productMatchesBrand(p, brand)),
    [products, brand]
  )

  const activeModelId = useMemo(() => {
    if (modeloParam && modelGroups.some((g) => g.id === modeloParam)) return modeloParam
    return null
  }, [modeloParam, modelGroups])

  const activeGroup = activeModelId
    ? modelGroups.find((g) => g.id === activeModelId) || null
    : null

  const viewProducts = activeGroup ? activeGroup.products : brandProducts
  const viewCount = viewProducts.length
  const homeBrand = HOME_BRANDS.find((b) => b.id === brand.id)
  const brandLogo = homeBrand?.logo
  const activeModelLogo = activeGroup ? getModelGroupLogo(activeGroup.id) : null

  // Solo limpia ?modelo= inválido; sin modelo = ver toda la marca (Les Paul + SG, etc.)
  useEffect(() => {
    if (loading || !modelGroups.length) return
    if (!modeloParam) return
    if (modelGroups.some((g) => g.id === modeloParam)) return
    const marca = marcaParam || brand.filterBrand
    router.replace(
      catalogHref({ marca }),
      { scroll: false }
    )
  }, [loading, modelGroups, modeloParam, marcaParam, brand.filterBrand, router])

  function selectModel(modelId) {
    const marca = marcaParam || brand.filterBrand
    router.push(
      catalogHref({
        marca,
        modelo: modelId || undefined,
      }),
      { scroll: false }
    )
  }

  const modelSelectOptions = useMemo(
    () => [
      {
        value: '',
        label: `Todos · ${brandProducts.length} en stock`,
      },
      ...modelGroups.map((group) => ({
        value: group.id,
        label: `${group.label} · ${group.count} en stock`,
      })),
    ],
    [modelGroups, brandProducts.length]
  )

  const sidebar = (
    <aside className="catalog-layout-grid__brands catalog-sidebar-sticky hidden md:block">
      <nav aria-label="Marcas" className="catalog-sidebar-nav">
        {brandList.map((entry, index) => (
          <Fragment key={entry.id}>
            {index > 0 ? <CatalogSidebarDivider /> : null}
            <CatalogSidebarBrandLink
              brand={entry}
              active={entry.id === brand.id}
            />
          </Fragment>
        ))}
      </nav>
      {modelGroups.length > 0 ? (
        <nav
          aria-label={`Modelos ${brand.name}`}
          className="catalog-sidebar-nav catalog-sidebar-nav--models mt-6 border-t border-white/[0.08] pt-4"
        >
          <p className="catalog-sidebar-section-label px-1.5 pb-2 pl-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dark-muted)]">
            Modelos
          </p>
          <CatalogSidebarModelItem
            group={{
              id: '',
              label: 'Todos',
              subtitle: 'TODA LA MARCA',
              count: brandProducts.length,
            }}
            active={!activeModelId}
            onSelect={() => selectModel('')}
          />
          {modelGroups.map((group) => (
            <Fragment key={group.id}>
              <CatalogSidebarDivider />
              <CatalogSidebarModelItem
                group={group}
                active={group.id === activeModelId}
                onSelect={selectModel}
              />
            </Fragment>
          ))}
        </nav>
      ) : null}
    </aside>
  )

  const mainContent = (
    <div className="catalog-layout-grid__main min-w-0" id="catalog-results">
      <div className="mb-4 border-b border-[var(--dark-border)] pb-4 max-md:mb-3 max-md:pb-3 md:mb-6 md:pb-5">
        {activeGroup ? (
          activeModelLogo ? (
            <img
              src={activeModelLogo}
              alt={activeGroup.label}
              className={`${getModelGroupLogoHeaderClass(activeGroup.id)} max-md:hidden`}
            />
          ) : (
            <h2 className="font-display text-[1.75rem] font-semibold tracking-tight text-[var(--dark-text-primary)] max-md:hidden sm:text-[2rem]">
              {activeGroup.label}
            </h2>
          )
        ) : (
          <BrandPairHeading homeBrand={homeBrand} brandName={brand.name} />
        )}
        {activeGroup?.subtitle ? (
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--dark-muted)] max-md:hidden">
            {activeGroup.subtitle}
          </p>
        ) : !activeGroup ? (
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--dark-muted)] max-md:hidden">
            TODA LA MARCA
          </p>
        ) : null}
        <p className="mt-1 text-xs text-[var(--dark-muted)] md:mt-2 md:text-sm">
          {viewCount === 0
            ? 'Sin stock por ahora'
            : `${viewCount} ${viewCount === 1 ? 'unidad' : 'unidades'} en stock`}
        </p>
      </div>

      {viewCount === 0 ? (
        <div className="rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] px-6 py-10 text-center sm:px-8">
          <p className="text-base font-medium text-[var(--dark-text-primary)]">
            {getModelEmptyStockMessage(activeGroup?.label || brand.name)}
          </p>
          <p className="mt-2 text-sm text-[var(--dark-muted)]">
            Cuando ingrese stock, lo vas a ver acá.
          </p>
        </div>
      ) : (
        <div className="product-grid--enter grid w-full min-w-0 grid-cols-2 items-start gap-x-2.5 gap-y-3 max-[767px]:gap-x-2.5 max-[767px]:gap-y-3 md:auto-rows-fr md:items-stretch md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8">
          {viewProducts.map((item, idx) => (
            <div
              key={item.slug || item.id || idx}
              className={`home-grid-product-cell flex min-w-0 w-full max-md:h-auto md:h-full [contain-intrinsic-size:auto_18rem] md:[contain-intrinsic-size:auto_28rem] ${
                idx < 3
                  ? 'max-md:[content-visibility:auto] md:[content-visibility:visible]'
                  : '[content-visibility:auto]'
              }`}
              style={{ '--enter-i': idx }}
            >
              <ProductCard
                item={item}
                priority={idx === 0}
                eager={idx > 0 && idx < 3}
                maxGalleryImages={1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="catalog-brand-view">
      {/* Móvil: marca (banner solo desktop/tablet) */}
      <div className="md:hidden mb-3">
        <BrandIntro
          brand={brand}
          brandLogo={brandLogo}
          isOtrosBrand={isOtrosBrand}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-[minmax(220px,280px)_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/[0.05]" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-3 max-[767px]:gap-x-2.5 max-[767px]:gap-y-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-white/8 bg-[var(--dark-bg-card)] md:rounded-3xl">
                <div className="aspect-square w-full animate-pulse bg-white/[0.05] md:aspect-[3/4]" />
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
            href={catalogHref()}
            className="no-custom-btn mt-4 inline-flex min-h-11 items-center text-sm text-[var(--dark-muted)] underline-offset-4 hover:text-[var(--dark-text-primary)] hover:underline"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="catalog-model-select md:hidden mb-4 max-md:mb-3">
            <FilterSelect
              label="Modelo"
              value={activeModelId || ''}
              options={modelSelectOptions}
              onChange={(modelId) => selectModel(modelId)}
            />
          </div>

          {/*
            Mismo layout que catálogo general:
            intro (marca) | banner
            sidebar       | productos
          */}
          <div className="catalog-layout-grid catalog-layout-grid--with-header grid gap-6 md:grid-cols-[minmax(220px,280px)_1fr] md:gap-8 lg:gap-10">
            <div className="catalog-layout-grid__intro hidden md:block">
              <BrandIntro
                brand={brand}
                brandLogo={brandLogo}
                isOtrosBrand={isOtrosBrand}
              />
            </div>

            {sidebar}

            <div className="catalog-layout-grid__card hidden md:block">
              <CatalogEditorialCard />
            </div>

            {mainContent}
          </div>
        </>
      )}
    </div>
  )
}
