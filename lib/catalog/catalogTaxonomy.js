import { HOME_BRANDS } from '../data/homeBrands'

/** @typedef {{ id: string, label: string, subtitle?: string, matches: (text: string) => boolean }} CatalogModelDef */
/** @typedef {{ id: string, name: string, filterBrand: string, kicker: string, models: CatalogModelDef[] }} CatalogBrandDef */

/** @type {CatalogBrandDef[]} */
export const CATALOG_BRAND_TAXONOMY = [
  {
    id: 'fender',
    name: 'Fender',
    filterBrand: 'fender',
    kicker: 'STRATOCASTER · TELECASTER · SQUIER · CUSTOM SHOP',
    models: [
      {
        id: 'stratocaster',
        label: 'Stratocaster',
        subtitle: 'SINGLE COIL · TREMOLO',
        matches: (text) => /stratocaster|\bstrat\b/i.test(text) && !/custom shop/i.test(text),
      },
      {
        id: 'telecaster',
        label: 'Telecaster',
        subtitle: 'TELECASTER · SOLID BODY',
        matches: (text) => /telecaster|\btele\b/i.test(text) && !/custom shop/i.test(text),
      },
      {
        id: 'squier',
        label: 'Squier',
        subtitle: 'AFFINITY · CLASSIC VIBE · PLAYER',
        matches: (text) => /\bsquier\b/i.test(text),
      },
      {
        id: 'custom-shop',
        label: 'Custom Shop',
        subtitle: 'MASTERBUILT · RELIC',
        matches: (text) => /custom shop/i.test(text),
      },
    ],
  },
  {
    id: 'gibson',
    name: 'Gibson',
    filterBrand: 'gibson',
    kicker: 'LES PAUL · ES-335 · SG · EPIPHONE',
    models: [
      {
        id: 'les-paul',
        label: 'Les Paul',
        subtitle: 'HUMBUCKER · SET NECK',
        matches: (text) => /les paul/i.test(text),
      },
      {
        id: '335',
        label: '335',
        subtitle: 'SEMI HOLLOW · ES',
        matches: (text) => /\b335\b|es-335|es 335/i.test(text),
      },
      {
        id: 'sg',
        label: 'SG',
        subtitle: 'DOUBLE CUT · SOLID',
        matches: (text) => /\bsg\b/i.test(text),
      },
      {
        id: 'epiphone',
        label: 'Epiphone',
        subtitle: 'LES PAUL · DOT · CASINO',
        matches: (text) => /\bepiphone\b/i.test(text),
      },
    ],
  },
  {
    id: 'prs',
    name: 'PRS',
    filterBrand: 'paul reed',
    kicker: 'CUSTOM SHOP · CORE',
    models: [
      {
        id: 'custom-shop',
        label: 'Custom Shop',
        subtitle: 'CUSTOM 24 · CORE',
        matches: (text) => /custom|custom 24|custom shop|prs custom/i.test(text) && !/silver sky/i.test(text),
      },
    ],
  },
  {
    id: 'ibanez',
    name: 'Ibanez',
    filterBrand: 'ibanez',
    kicker: 'RG · SUPER STRAT',
    models: [
      {
        id: 'rg',
        label: 'RG',
        subtitle: 'SHRED · TREMOLO',
        matches: (text) => /\brg\b/i.test(text),
      },
      {
        id: 'super-strat',
        label: 'Super Strat',
        subtitle: 'HSH · FLOATING',
        matches: (text) => /super strat/i.test(text),
      },
    ],
  },
  {
    id: 'taylor',
    name: 'Taylor',
    filterBrand: 'taylor',
    kicker: 'ACÚSTICAS · GRAND AUDITORIUM',
    models: [
      {
        id: 'acusticas',
        label: 'Acústicas',
        subtitle: 'GRAND AUDITORIUM · ELECTRO',
        matches: (text) => /taylor|acústic|acustic|214|grand auditorium/i.test(text),
      },
    ],
  },
]

/** Alias de marca en URL (?marca=) → filterBrand canónico */
const CATALOG_BRAND_ALIASES = {
  squier: 'fender',
  epiphone: 'gibson',
}

export function productSearchText(product) {
  return [
    product?.name,
    product?.model,
    product?.description,
    product?.brand,
    product?.wood,
    product?.mics,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function productMatchesBrand(product, brand) {
  const text = productSearchText(product)
  const key = brand.filterBrand.toLowerCase()
  if (key === 'paul reed') {
    return /paul reed|\bprs\b/i.test(text)
  }
  if (key === 'fender') {
    return /\bfender\b|\bsquier\b/i.test(text)
  }
  if (key === 'gibson') {
    return /\bgibson\b|\bepiphone\b/i.test(text)
  }
  return text.includes(key)
}

export function productMatchesModel(product, modelDef) {
  return modelDef.matches(productSearchText(product))
}

export function resolveCatalogBrand(marcaParam) {
  if (!marcaParam) return null
  const key = marcaParam.trim().toLowerCase()
  const canonical = CATALOG_BRAND_ALIASES[key] || key
  return (
    CATALOG_BRAND_TAXONOMY.find(
      (b) =>
        b.id === canonical ||
        b.filterBrand.toLowerCase() === canonical ||
        b.name.toLowerCase() === canonical
    ) || null
  )
}

export function resolveBrandFromHomeFilter(filterBrand) {
  if (!filterBrand) return null
  const key = filterBrand.trim().toLowerCase()
  return CATALOG_BRAND_TAXONOMY.find((b) => b.filterBrand.toLowerCase() === key) || null
}

/** Modelos con stock para una marca; oculta los que tienen 0 unidades. */
export function buildBrandModelGroups(products, brand) {
  const inBrand = products.filter((p) => productMatchesBrand(p, brand))
  return brand.models
    .map((modelDef) => {
      const items = inBrand.filter((p) => productMatchesModel(p, modelDef))
      return {
        ...modelDef,
        count: items.length,
        products: items,
      }
    })
    .filter((group) => group.count > 0)
}

export function getCatalogBrandList(products) {
  return CATALOG_BRAND_TAXONOMY.map((brand) => {
    const count = products.filter((p) => productMatchesBrand(p, brand)).length
    return { ...brand, count }
  }).filter((b) => b.count > 0)
}

export function getHomeBrandCatalogLink(brand) {
  const home = HOME_BRANDS.find((b) => b.id === brand.id)
  const marca = home?.filterBrand || brand.filterBrand
  return `/catalogo?marca=${encodeURIComponent(marca)}`
}
