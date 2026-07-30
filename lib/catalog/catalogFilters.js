import { parseNumericPriceForSchema } from '../utils/normalizeProduct'
import { productSearchText } from './catalogTaxonomy'

/** Params ortogonales a marca/modelo (compatibles con /catalogo?marca=fender). */
export const CATALOG_FILTER_KEYS = ['tipo', 'precioMin', 'precioMax', 'estado']

export const CATALOG_TYPE_OPTIONS = [
  { id: 'electrica', label: 'Eléctricas' },
  { id: 'acustica', label: 'Acústicas' },
  { id: 'amplificador', label: 'Amplificadores' },
]

export const CATALOG_STATUS_OPTIONS = [
  { id: 'disponible', label: 'Disponible' },
]

const AMP_RE = /amplificador|\bamp\b|combo|cabinet|\bhead\b|valvular|solid state/i
const ACOUSTIC_RE = /taylor|acustic|acoustic|grand auditorium|dreadnought|electro.?ac/i

/**
 * @typedef {{ tipo: string, precioMin: string, precioMax: string, estado: string }} CatalogFilters
 */

/** @returns {CatalogFilters} */
export function emptyCatalogFilters() {
  return { tipo: '', precioMin: '', precioMax: '', estado: '' }
}

function sanitizeTipo(value) {
  const v = String(value || '').trim().toLowerCase()
  return CATALOG_TYPE_OPTIONS.some((o) => o.id === v) ? v : ''
}

function sanitizeEstado(value) {
  const v = String(value || '').trim().toLowerCase()
  return CATALOG_STATUS_OPTIONS.some((o) => o.id === v) ? v : ''
}

function sanitizePriceInput(value) {
  if (value == null || value === '') return ''
  const n = Number(String(value).replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return ''
  return String(Math.round(n))
}

/**
 * Lee filtros desde searchParams (Next) o URLSearchParams.
 * @returns {CatalogFilters}
 */
export function parseCatalogFilterParams(params) {
  if (!params) return emptyCatalogFilters()
  const get = (key) => {
    if (typeof params.get === 'function') return params.get(key)
    const v = params[key]
    return Array.isArray(v) ? v[0] : v
  }
  return {
    tipo: sanitizeTipo(get('tipo')),
    precioMin: sanitizePriceInput(get('precioMin')),
    precioMax: sanitizePriceInput(get('precioMax')),
    estado: sanitizeEstado(get('estado')),
  }
}

export function countActiveCatalogFilters(filters) {
  if (!filters) return 0
  let n = 0
  if (filters.tipo) n += 1
  if (filters.precioMin) n += 1
  if (filters.precioMax) n += 1
  if (filters.estado) n += 1
  return n
}

export function catalogFiltersAreActive(filters) {
  return countActiveCatalogFilters(filters) > 0
}

/**
 * Arma query string del catálogo preservando marca/modelo + filtros.
 * @param {{ marca?: string, modelo?: string } & Partial<CatalogFilters>} opts
 */
export function buildCatalogSearchParams(opts = {}) {
  const p = new URLSearchParams()
  const marca = String(opts.marca || '').trim()
  const modelo = String(opts.modelo || '').trim()
  if (marca) p.set('marca', marca)
  if (modelo) p.set('modelo', modelo)

  const filters = {
    ...emptyCatalogFilters(),
    ...opts,
    tipo: sanitizeTipo(opts.tipo),
    precioMin: sanitizePriceInput(opts.precioMin),
    precioMax: sanitizePriceInput(opts.precioMax),
    estado: sanitizeEstado(opts.estado),
  }

  if (filters.tipo) p.set('tipo', filters.tipo)
  if (filters.precioMin) p.set('precioMin', filters.precioMin)
  if (filters.precioMax) p.set('precioMax', filters.precioMax)
  if (filters.estado) p.set('estado', filters.estado)

  return p
}

export function catalogHref(opts = {}) {
  const q = buildCatalogSearchParams(opts).toString()
  return q ? `/catalogo?${q}` : '/catalogo'
}

/** Extrae solo los filtros ortogonales para reutilizar al cambiar marca/modelo. */
export function pickOrthogonalFilters(filters = {}) {
  return {
    tipo: sanitizeTipo(filters.tipo),
    precioMin: sanitizePriceInput(filters.precioMin),
    precioMax: sanitizePriceInput(filters.precioMax),
    estado: sanitizeEstado(filters.estado),
  }
}

export function productMatchesCatalogType(product, typeId) {
  if (!typeId) return true
  const text = productSearchText(product)
  if (typeId === 'amplificador') return AMP_RE.test(text)
  if (typeId === 'acustica') return !AMP_RE.test(text) && ACOUSTIC_RE.test(text)
  if (typeId === 'electrica') return !AMP_RE.test(text) && !ACOUSTIC_RE.test(text)
  return true
}

export function productMatchesCatalogStatus(product, estado) {
  if (!estado) return true
  if (estado === 'disponible') {
    const status = String(product?.listing_status || 'available').toLowerCase()
    return status !== 'reserved'
  }
  return true
}

export function productMatchesPriceRange(product, precioMin, precioMax) {
  const min = precioMin ? Number(precioMin) : null
  const max = precioMax ? Number(precioMax) : null
  if (min == null && max == null) return true
  if ((min != null && !Number.isFinite(min)) || (max != null && !Number.isFinite(max))) return true

  const value = parseNumericPriceForSchema(product?.price)
  if (value == null) return false
  if (min != null && value < min) return false
  if (max != null && value > max) return false
  return true
}

/** Aplica filtros ortogonales (no marca/modelo). */
export function applyCatalogFilters(products, filters) {
  const list = Array.isArray(products) ? products : []
  if (!filters || !catalogFiltersAreActive(filters)) return list

  return list.filter((product) => {
    if (!productMatchesCatalogType(product, filters.tipo)) return false
    if (!productMatchesCatalogStatus(product, filters.estado)) return false
    if (!productMatchesPriceRange(product, filters.precioMin, filters.precioMax)) return false
    return true
  })
}
