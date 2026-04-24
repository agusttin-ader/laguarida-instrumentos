#!/usr/bin/env node
/**
 * Limpieza Supabase alineada al catálogo público del sitio.
 *
 * Variables (en la terminal o en `.env.local` en la raíz del repo; el script carga `.env.local` solo):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SITE_URL o NEXT_PUBLIC_SITE_URL (URL pública del sitio)
 *
 * Uso:
 *   npm run cleanup:supabase
 *   # o con variables en la terminal:
 *   SITE_URL=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/cleanup-supabase-from-site.mjs
 *
 * Por defecto solo muestra (dry-run). Para aplicar:
 *   ... node scripts/cleanup-supabase-from-site.mjs --execute --prune-db
 *   ... node scripts/cleanup-supabase-from-site.mjs --execute --prune-storage
 *   ... node scripts/cleanup-supabase-from-site.mjs --execute --prune-db --prune-storage
 *
 * Seguridad:
 *   - Aborta si el API devuelve 0 productos o muy pocos vs la DB (salvo --force).
 *   - Usa fetch sin caché hacia /api/products.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Carga `.env.local` si existe (no pisa variables ya definidas en la terminal). */
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const BUCKET = 'products'
const MARKER = '/storage/v1/object/public/products/'

function env(name) {
  const v = process.env[name]
  return v && String(v).trim() ? String(v).trim() : ''
}

function pathFromPublicUrl(url) {
  if (!url || typeof url !== 'string') return null
  const u = url.trim().split('?')[0]
  const i = u.indexOf(MARKER)
  if (i === -1) return null
  try {
    return decodeURIComponent(u.slice(i + MARKER.length))
  } catch {
    return u.slice(i + MARKER.length)
  }
}

function collectReferencedPaths(rows) {
  const set = new Set()
  for (const row of rows) {
    if (row.image_url) {
      const p = pathFromPublicUrl(row.image_url)
      if (p) set.add(p)
    }
    if (Array.isArray(row.images)) {
      for (const im of row.images) {
        const p = pathFromPublicUrl(im)
        if (p) set.add(p)
      }
    }
  }
  return set
}

function parseArgs(argv) {
  return {
    execute: argv.includes('--execute'),
    pruneDb: argv.includes('--prune-db'),
    pruneStorage: argv.includes('--prune-storage'),
    force: argv.includes('--force'),
  }
}

async function fetchPublicCatalog(siteUrl) {
  const base = siteUrl.replace(/\/$/, '')
  const url = `${base}/api/products`
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('API no devolvió un array')
  }
  return data
}

async function fetchAllProductRows(admin) {
  const pageSize = 500
  const all = []
  let from = 0
  for (;;) {
    const { data, error } = await admin
      .from('products')
      .select('id, slug, image_url, images')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) throw error
    if (!data?.length) break
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}

/** Lista rutas de objeto en el bucket (recorre subcarpetas si existen). */
async function listStorageObjectPaths(admin) {
  async function walk(prefix) {
    const out = []
    let offset = 0
    const limit = 1000
    for (;;) {
      const { data, error } = await admin.storage.from(BUCKET).list(prefix, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })
      if (error) throw error
      const batch = data || []
      if (!batch.length) break

      for (const item of batch) {
        const full = prefix ? `${prefix}/${item.name}` : item.name
        const isFile =
          item.metadata &&
          typeof item.metadata === 'object' &&
          (item.metadata.size != null || item.metadata.mimetype != null)
        if (isFile) out.push(full)
        else {
          const sub = await walk(full)
          out.push(...sub)
        }
      }

      if (batch.length < limit) break
      offset += limit
    }
    return out
  }
  return walk('')
}

async function removeStoragePaths(admin, paths) {
  const chunk = 100
  let removed = 0
  for (let i = 0; i < paths.length; i += chunk) {
    const slice = paths.slice(i, i + chunk)
    const { error } = await admin.storage.from(BUCKET).remove(slice)
    if (error) throw error
    removed += slice.length
  }
  return removed
}

async function main() {
  loadEnvLocal()

  const { execute, pruneDb, pruneStorage, force } = parseArgs(process.argv.slice(2))

  const siteUrl = env('SITE_URL') || env('NEXT_PUBLIC_SITE_URL')
  const supabaseUrl = env('SUPABASE_URL')
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY')

  if (!siteUrl || !supabaseUrl || !serviceKey) {
    console.error(
      'Faltan SITE_URL (o NEXT_PUBLIC_SITE_URL), SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Revisá `.env.local` en la raíz del proyecto.'
    )
    process.exit(1)
  }

  if (execute && !pruneDb && !pruneStorage) {
    console.error('Con --execute indicá --prune-db y/o --prune-storage.')
    process.exit(1)
  }

  console.log('Sitio:', siteUrl)
  console.log('Supabase:', supabaseUrl)
  console.log('Modo:', execute ? 'EJECUCIÓN' : 'dry-run (solo informe)')

  const apiProducts = await fetchPublicCatalog(siteUrl)
  const apiSlugs = new Set(
    apiProducts.map((p) => p.slug).filter((s) => s && String(s).trim())
  )

  if (apiSlugs.size === 0) {
    console.error('Abort: el API no devolvió ningún slug. No se borra nada.')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const dbRows = await fetchAllProductRows(admin)
  const dbBySlug = new Map(dbRows.map((r) => [r.slug, r]))

  const inDbNotInApi = dbRows.filter((r) => r.slug && !apiSlugs.has(r.slug))
  const inApiNotInDb = [...apiSlugs].filter((s) => !dbBySlug.has(s))

  console.log('\n--- Resumen ---')
  console.log('Productos en API (público):', apiSlugs.size)
  console.log('Filas en tabla products:', dbRows.length)
  console.log('En DB pero no en API (candidatos a borrar):', inDbNotInApi.length)
  if (inApiNotInDb.length) {
    console.log('Slugs en API pero no en DB (raro):', inApiNotInDb.length)
    console.log(inApiNotInDb.slice(0, 20).join(', '), inApiNotInDb.length > 20 ? '…' : '')
  }

  const ratio = dbRows.length ? apiSlugs.size / dbRows.length : 1
  if (ratio < 0.85 && inDbNotInApi.length > 5 && !force) {
    console.error(
      `\nAbort: el API tiene muchos menos ítems que la DB (ratio ${ratio.toFixed(2)}).` +
        ' Revisá SITE_URL o caché. Para continuar igual: --force'
    )
    process.exit(1)
  }

  if (inDbNotInApi.length) {
    console.log('\nFilas a eliminar de `products`:')
    for (const r of inDbNotInApi.slice(0, 50)) {
      console.log(`  - ${r.slug} (${r.id})`)
    }
    if (inDbNotInApi.length > 50) console.log(`  … y ${inDbNotInApi.length - 50} más`)
  }

  const referencedAfterPrune = collectReferencedPaths(
    dbRows.filter((r) => r.slug && apiSlugs.has(r.slug))
  )
  const referencedAll = collectReferencedPaths(dbRows)

  let orphanPaths = []
  if (pruneStorage || !execute) {
    console.log('\n--- Storage: listando objetos ---')
    const allPaths = await listStorageObjectPaths(admin)
    orphanPaths = allPaths.filter((p) => !referencedAll.has(p))
    const orphanAfterDbPrune = allPaths.filter((p) => !referencedAfterPrune.has(p))
    console.log('Objetos en bucket:', allPaths.length)
    console.log('No referenciados por ningún producto (actual):', orphanPaths.length)
    console.log(
      'Quedarían huérfanos si se aplicara prune-db (estimado):',
      orphanAfterDbPrune.length
    )
    if (orphanPaths.length && orphanPaths.length <= 30) {
      for (const p of orphanPaths) console.log(`  - ${p}`)
    }
  }

  if (!execute) {
    console.log(
      '\nDry-run terminado. Para borrar: añadí --execute --prune-db y/o --prune-storage'
    )
    return
  }

  if (pruneDb && inDbNotInApi.length) {
    const ids = inDbNotInApi.map((r) => r.id)
    const { error } = await admin.from('products').delete().in('id', ids)
    if (error) throw error
    console.log(`\nEliminadas ${ids.length} filas de products.`)
  }

  if (pruneStorage) {
    const rowsNow = await fetchAllProductRows(admin)
    const ref = collectReferencedPaths(rowsNow)
    const allPaths = await listStorageObjectPaths(admin)
    const toDelete = allPaths.filter((p) => !ref.has(p))
    if (toDelete.length) {
      await removeStoragePaths(admin, toDelete)
      console.log(`\nEliminados ${toDelete.length} objetos del bucket ${BUCKET}.`)
    } else {
      console.log('\nStorage: nada que borrar (sin huérfanos).')
    }
  }

  console.log('\nListo.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
