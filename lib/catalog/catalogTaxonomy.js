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
        matches: (text) => /stratocaster|\bstrat\b/i.test(text),
      },
      {
        id: 'telecaster',
        label: 'Telecaster',
        subtitle: 'TELECASTER · SOLID BODY',
        matches: (text) => /telecaster|\btele\b/i.test(text),
      },
      {
        id: 'custom-shop',
        label: 'Custom Shop',
        subtitle: 'MASTERBUILT · RELIC',
        matches: () => false,
      },
      {
        id: 'squier',
        label: 'Squier',
        subtitle: 'AFFINITY · CLASSIC VIBE · PLAYER',
        matches: (text) => /\bsquier\b/i.test(text),
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
    name: 'Paul Reed Smith',
    filterBrand: 'paul reed',
    kicker: 'CUSTOM 24 · SILVER SKY · CORE',
    models: [
      {
        id: 'custom-24',
        label: 'Custom 24',
        subtitle: 'CORE · CUSTOM SHOP',
        matches: (text) =>
          /paul reed|\bprs\b/i.test(text) &&
          /custom|custom 24|custom shop|prs custom/i.test(text) &&
          !/silver sky/i.test(text),
      },
      {
        id: 'silver-sky',
        label: 'Silver Sky',
        subtitle: 'STRAT · JOHN MAYER',
        matches: (text) => /silver sky/i.test(text),
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
    id: 'otros',
    name: 'Otros',
    filterBrand: 'otros',
    kicker: 'ELÉCTRICAS · ACÚSTICAS · AMPLIFICADORES',
    models: [
      {
        id: 'electricas',
        label: 'Eléctricas',
        subtitle: 'RGX · STRAT · SOLID BODY',
        matches: (text) =>
          !/amplificador|\bamp\b|combo|cabinet|head|taylor|acustic|acoustic|grand auditorium|dreadnought/i.test(
            text
          ),
      },
      {
        id: 'acusticas',
        label: 'Acústicas',
        subtitle: 'TAYLOR · GRAND AUDITORIUM · ELECTRO',
        matches: (text) =>
          !/amplificador|\bamp\b|combo|cabinet|head/i.test(text) &&
          /taylor|acustic|acoustic|grand auditorium|dreadnought|electro.?ac/i.test(text),
      },
      {
        id: 'amplificadores',
        label: 'Amplificadores',
        subtitle: 'COMBOS · CABINETS · HEADS',
        matches: (text) => /amplificador|\bamp\b|combo|cabinet|head|valvular|solid state/i.test(text),
      },
    ],
  },
]

/** Alias de marca en URL (?marca=) → filterBrand canónico */
const CATALOG_BRAND_ALIASES = {
  squier: 'fender',
  epiphone: 'gibson',
  taylor: 'otros',
  prs: 'prs',
}

export function productSearchText(product) {
  const raw = [
    product?.name,
    product?.model,
    product?.description,
    product?.brand,
    product?.wood,
    product?.mics,
  ]
    .filter(Boolean)
    .join(' ')
  return raw.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

const MAIN_CATALOG_BRAND_IDS = new Set(['fender', 'gibson', 'prs', 'ibanez'])

function matchesMainCatalogBrand(product, brand) {
  const text = productSearchText(product)
  const key = brand.filterBrand.toLowerCase()
  if (key === 'paul reed') return /paul reed|\bprs\b/i.test(text)
  if (key === 'fender') return /\bfender\b|\bsquier\b/i.test(text)
  if (key === 'gibson') return /\bgibson\b|\bepiphone\b/i.test(text)
  if (key === 'ibanez') return /\bibanez\b/i.test(text)
  return text.includes(key)
}

export function productBelongsToMainCatalogBrand(product) {
  return CATALOG_BRAND_TAXONOMY.some(
    (brand) => MAIN_CATALOG_BRAND_IDS.has(brand.id) && matchesMainCatalogBrand(product, brand)
  )
}

/** Solo guitarras Custom Shop — ignora menciones en descripción (ej. mics "custom shop vintage style"). */
export function productIsCustomShopGuitar(product) {
  const nameModel = [product?.name, product?.model].filter(Boolean).join(' ').toLowerCase()
  if (/\bcustom shop\b/i.test(nameModel)) return true

  const text = productSearchText(product)
  if (/(?:stratocaster|strat|telecaster|tele)\s+custom shop/i.test(text)) return true
  if (/custom shop\s+(?:strat|tele|stratocaster|telecaster|\d{2})/i.test(text)) return true
  if (/fender\s+custom shop/i.test(text)) return true
  if (/custom shop.*(?:relic|closet classic|masterbuilt|edición limitada)/i.test(text)) return true

  return false
}

export function productMatchesBrand(product, brand) {
  if (brand.id === 'otros') {
    return !productBelongsToMainCatalogBrand(product)
  }
  return matchesMainCatalogBrand(product, brand)
}

export function productMatchesModel(product, modelDef) {
  const text = productSearchText(product)
  if (modelDef.id === 'custom-shop') {
    return productIsCustomShopGuitar(product)
  }
  if (modelDef.id === 'stratocaster' || modelDef.id === 'telecaster') {
    return (
      modelDef.matches(text) &&
      !productIsCustomShopGuitar(product) &&
      !/\brgx\b/i.test(text) &&
      !/\bsquier\b/i.test(text)
    )
  }
  if (modelDef.id === 'les-paul') {
    return modelDef.matches(text) && !/\bepiphone\b/i.test(text)
  }
  return modelDef.matches(text)
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

/** Modelos de una marca; incluye los que tienen 0 unidades en stock. */
export function buildBrandModelGroups(products, brand) {
  const inBrand = products.filter((p) => productMatchesBrand(p, brand))
  return brand.models.map((modelDef) => {
    const items = inBrand.filter((p) => productMatchesModel(p, modelDef))
    return {
      ...modelDef,
      count: items.length,
      products: items,
    }
  })
}

const FEMININE_MODEL_LABELS = new Set([
  'Stratocaster',
  'Telecaster',
  'Squier',
  'Eléctricas',
  'Acústicas',
  'Epiphone',
  'Les Paul',
  'Super Strat',
])

/** Mensaje cuando un modelo/línea no tiene stock. */
export function getModelEmptyStockMessage(label) {
  const article = FEMININE_MODEL_LABELS.has(label) ? 'ninguna' : 'ningún'
  return `Todavía no ingresó ${article} ${label}.`
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
