'use client'

import React, { useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CATALOG_STATUS_OPTIONS,
  CATALOG_TYPE_OPTIONS,
  catalogFiltersAreActive,
  catalogHref,
  countActiveCatalogFilters,
  emptyCatalogFilters,
  pickOrthogonalFilters,
} from '../lib/catalog/catalogFilters'
import { CATALOG_BRAND_TAXONOMY } from '../lib/catalog/catalogTaxonomy'
import { HOME_BRANDS } from '../lib/data/homeBrands'
import FilterSelect from './FilterSelect'

/**
 * Panel de filtros del catálogo.
 * - Desktop: barra horizontal compacta.
 * - Móvil: acordeón con Aplicar / Limpiar.
 * (Lógica y params de URL sin cambios.)
 */
export default function CatalogFiltersPanel({
  marcaParam = '',
  modeloParam = '',
  filters,
  showBrandSelect = true,
  className = '',
}) {
  const router = useRouter()
  const baseId = useId()
  const activeCount = countActiveCatalogFilters(filters)
  const hasActive = catalogFiltersAreActive(filters)
  const [openMobile, setOpenMobile] = useState(activeCount > 0)
  const [draft, setDraft] = useState(() => ({
    ...emptyCatalogFilters(),
    ...pickOrthogonalFilters(filters),
    marca: marcaParam || '',
  }))

  useEffect(() => {
    setDraft({
      ...emptyCatalogFilters(),
      ...pickOrthogonalFilters(filters),
      marca: marcaParam || '',
    })
  }, [filters, marcaParam])

  const brandOptions = useMemo(
    () => [
      { value: '', label: 'Todas' },
      ...CATALOG_BRAND_TAXONOMY.map((brand) => {
        const home = HOME_BRANDS.find((b) => b.id === brand.id)
        return {
          value: home?.filterBrand || brand.filterBrand,
          label: brand.name,
        }
      }),
    ],
    []
  )

  const typeOptions = useMemo(
    () => [
      { value: '', label: 'Todos' },
      ...CATALOG_TYPE_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label })),
    ],
    []
  )

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Todas' },
      ...CATALOG_STATUS_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label })),
    ],
    []
  )

  function pushFilters(next, { dropModelo = false } = {}) {
    const orthogonal = pickOrthogonalFilters(next)
    const nextMarca = String(next.marca != null ? next.marca : marcaParam || '').trim()
    router.push(
      catalogHref({
        marca: nextMarca || undefined,
        modelo: dropModelo || !nextMarca ? undefined : modeloParam || undefined,
        ...orthogonal,
      }),
      { scroll: false }
    )
  }

  function applyDraft() {
    const nextMarca = String(draft.marca || '').trim()
    const marcaChanged = nextMarca !== String(marcaParam || '').trim()
    pushFilters(
      {
        ...draft,
        marca: nextMarca,
      },
      { dropModelo: marcaChanged }
    )
    setOpenMobile(false)
  }

  function clearFilters() {
    const cleared = emptyCatalogFilters()
    setDraft({ ...cleared, marca: marcaParam || '' })
    pushFilters({ ...cleared, marca: marcaParam || '' })
  }

  function onDesktopChange(patch) {
    const next = { ...draft, ...patch }
    setDraft(next)
    const marcaChanged =
      String(next.marca || '').trim() !== String(marcaParam || '').trim()
    pushFilters(next, { dropModelo: marcaChanged })
  }

  const formFields = (mode) => {
    const isMobile = mode === 'mobile'
    const values = draft
    const setValue = (patch) => {
      if (isMobile) setDraft((prev) => ({ ...prev, ...patch }))
      else onDesktopChange(patch)
    }

    return (
      <div className={`catalog-filters__fields${showBrandSelect ? '' : ' catalog-filters__fields--no-brand'}`}>
        {showBrandSelect ? (
          <div className="catalog-filters__field">
            <FilterSelect
              id={`${baseId}-${mode}-marca`}
              label="Marca"
              value={values.marca || ''}
              options={brandOptions}
              onChange={(marca) => setValue({ marca })}
            />
          </div>
        ) : null}

        <div className="catalog-filters__field">
          <FilterSelect
            id={`${baseId}-${mode}-tipo`}
            label="Tipo"
            value={values.tipo || ''}
            options={typeOptions}
            onChange={(tipo) => setValue({ tipo })}
          />
        </div>

        <div className="catalog-filters__field">
          <label htmlFor={`${baseId}-${mode}-precio-min`} className="catalog-filters__label">
            Precio mín.
          </label>
          <input
            id={`${baseId}-${mode}-precio-min`}
            type="number"
            inputMode="numeric"
            min="0"
            step="50"
            placeholder="Mín."
            className="catalog-filters__control"
            value={values.precioMin || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, precioMin: e.target.value }))}
            onBlur={(e) => {
              if (isMobile) return
              onDesktopChange({
                precioMin: e.currentTarget.value,
                precioMax: values.precioMax || '',
              })
            }}
            data-price="min"
            aria-label="Precio mínimo"
          />
        </div>

        <div className="catalog-filters__field">
          <label htmlFor={`${baseId}-${mode}-precio-max`} className="catalog-filters__label">
            Precio máx.
          </label>
          <input
            id={`${baseId}-${mode}-precio-max`}
            type="number"
            inputMode="numeric"
            min="0"
            step="50"
            placeholder="Máx."
            className="catalog-filters__control"
            value={values.precioMax || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, precioMax: e.target.value }))}
            onBlur={(e) => {
              if (isMobile) return
              onDesktopChange({
                precioMin: values.precioMin || '',
                precioMax: e.currentTarget.value,
              })
            }}
            data-price="max"
            aria-label="Precio máximo"
          />
        </div>

        <div className="catalog-filters__field">
          <FilterSelect
            id={`${baseId}-${mode}-estado`}
            label="Disponibilidad"
            value={values.estado || ''}
            options={statusOptions}
            onChange={(estado) => setValue({ estado })}
          />
        </div>

        {hasActive && !isMobile ? (
          <div className="catalog-filters__field catalog-filters__field--action">
            <span className="catalog-filters__label catalog-filters__label--spacer" aria-hidden>
              &nbsp;
            </span>
            <button
              type="button"
              className="no-custom-btn catalog-filters__clear"
              onClick={clearFilters}
            >
              Limpiar
            </button>
          </div>
        ) : null}

        {isMobile ? (
          <p className="catalog-filters__hint">Precio según el valor publicado (USD / ARS).</p>
        ) : null}
      </div>
    )
  }

  return (
    <section
      className={`catalog-filters ${className}`.trim()}
      aria-label="Filtros del catálogo"
    >
      <div className="md:hidden">
        <button
          type="button"
          className="no-custom-btn catalog-filters__toggle"
          aria-expanded={openMobile}
          aria-controls={`${baseId}-panel`}
          onClick={() => setOpenMobile((v) => !v)}
        >
          <span>
            Filtros
            {activeCount > 0 ? (
              <span className="catalog-filters__badge">{activeCount}</span>
            ) : null}
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className={`transition-transform ${openMobile ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {openMobile ? (
          <div id={`${baseId}-panel`} className="catalog-filters__panel catalog-filters__panel--mobile">
            {formFields('mobile')}
            <div className="catalog-filters__actions">
              <button
                type="button"
                className="no-custom-btn catalog-filters__btn catalog-filters__btn--ghost"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className="no-custom-btn catalog-filters__btn catalog-filters__btn--primary"
                onClick={applyDraft}
              >
                Aplicar
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="catalog-filters__panel catalog-filters__panel--desktop hidden md:block">
        {formFields('desktop')}
      </div>
    </section>
  )
}
