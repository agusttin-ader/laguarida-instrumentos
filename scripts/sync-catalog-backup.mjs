#!/usr/bin/env node
/**
 * 1. Copia catálogo Supabase → data/products-backup.json
 * 2. Crea public/images/products/<slug>/ por cada producto
 * 3. Descarga fotos desde Storage con el nombre que espera el backup local
 * 4. Renombra archivos sueltos en la carpeta al nombre correcto (orden alfabético)
 *
 * Uso: npm run sync:catalog
 *      npm run sync:catalog -- --skip-download   (solo JSON + carpetas + renombrar)
 *
 * Requiere .env.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outPath = path.join(root, 'data', 'products-backup.json')
const productsRoot = path.join(root, 'public', 'images', 'products')
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'products'
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i

const skipDownload = process.argv.includes('--skip-download')

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

function encodePathSegments(rel = '') {
  return rel
    .split('/')
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join('/')
}

function storagePathFromUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const u = url.trim().split('?')[0]
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = u.indexOf(marker)
  if (i !== -1) {
    try {
      return decodeURIComponent(u.slice(i + marker.length))
    } catch {
      return u.slice(i + marker.length)
    }
  }
  if (!u.includes('/') && IMAGE_EXT.test(u)) return u
  return ''
}

function fileNameFromRef(ref) {
  const s = String(ref || '').trim()
  if (!s) return ''
  if (s.startsWith('/images/products/')) {
    const parts = s.split('/').filter(Boolean)
    return parts[parts.length - 1] || ''
  }
  const fromStorage = storagePathFromUrl(s)
  if (fromStorage) return fromStorage.split('/').pop() || ''
  if (!s.includes('/')) return s
  return s.split('/').pop() || ''
}

/** Nombres de archivo en orden: principal primero, luego galería sin duplicar. */
function expectedImageFileNames(row) {
  const ordered = []
  const seen = new Set()
  const primary = fileNameFromRef(row.image_url)
  if (primary && !seen.has(primary)) {
    seen.add(primary)
    ordered.push(primary)
  }
  if (Array.isArray(row.images)) {
    for (const im of row.images) {
      const name = fileNameFromRef(im)
      if (name && !seen.has(name)) {
        seen.add(name)
        ordered.push(name)
      }
    }
  }
  return ordered
}

function toLocalImageFileName(ref) {
  const raw = storagePathFromUrl(ref) || fileNameFromRef(ref)
  if (!raw) return ''
  return raw.includes('/') ? raw.split('/').pop() : raw
}

function rowForBackup(row) {
  const images = Array.isArray(row.images)
    ? row.images.map((u) => toLocalImageFileName(u)).filter(Boolean)
    : []
  const image_url = toLocalImageFileName(row.image_url) || images[0] || ''
  return {
    ...row,
    image_url,
    images,
    listing_status:
      String(row.listing_status || 'available').toLowerCase() === 'reserved'
        ? 'reserved'
        : 'available',
  }
}

function publicStorageUrl(supabaseUrl, storagePath) {
  const base = supabaseUrl.replace(/\/$/, '')
  const encoded = encodePathSegments(storagePath)
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`
}

function storagePathForDownload(ref) {
  const s = String(ref || '').trim()
  if (!s) return ''
  const fromUrl = storagePathFromUrl(s)
  if (fromUrl) return fromUrl
  if (!s.includes('/') && IMAGE_EXT.test(s)) return s
  return ''
}

async function downloadToFile(url, destPath) {
  if (fs.existsSync(destPath)) return 'skip'
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return 'fail'
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(destPath, buf)
  return 'ok'
}

/** Archivos en carpeta con nombre distinto al esperado → renombrar en orden alfabético. */
function renameLooseImages(dir, expectedNames, slug) {
  if (!expectedNames.length) return 0
  let existing = []
  try {
    existing = fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f) && f !== 'IMAGENES.txt')
  } catch {
    return 0
  }
  const expectedSet = new Set(expectedNames)
  const orphans = existing.filter((f) => !expectedSet.has(f)).sort((a, b) => a.localeCompare(b, 'es'))
  const missing = expectedNames.filter((name) => !existing.includes(name))
  if (!orphans.length || !missing.length) return 0

  const n = Math.min(orphans.length, missing.length)
  if (orphans.length !== missing.length) {
    console.warn(
      `  ${slug}: ${orphans.length} archivo(s) suelto(s), ${missing.length} nombre(s) libre(s) — renombrando ${n}`
    )
  }
  let renamed = 0
  for (let i = 0; i < n; i++) {
    const from = path.join(dir, orphans[i])
    const to = path.join(dir, missing[i])
    if (fs.existsSync(to)) continue
    fs.renameSync(from, to)
    renamed += 1
  }
  return renamed
}

function writeImagenesTxt(dir, row, expectedNames) {
  const slug = row.slug
  const lines = [
    `Producto: ${row.name || slug}`,
    `Carpeta: public/images/products/${slug}/`,
    '',
    'Nombres que usa el sitio en local (generado por npm run sync:catalog):',
    '',
    ...expectedNames.map((f, i) => `${i + 1}. ${f}`),
    '',
    'Podés soltar fotos con cualquier nombre; al volver a correr sync:catalog se renombran solas.',
    '',
    'Después de agregar fotos, generá variantes livianas: npm run images:variants',
  ]
  fs.writeFileSync(path.join(dir, 'IMAGENES.txt'), `${lines.join('\n')}\n`, 'utf8')
}

async function syncProductImages(row, supabaseUrl) {
  const slug = String(row.slug || '').trim()
  if (!slug) return { dir: null, downloaded: 0, skipped: 0, failed: 0, renamed: 0 }

  const expectedNames = expectedImageFileNames(row)
  const dir = path.join(productsRoot, slug)
  fs.mkdirSync(dir, { recursive: true })
  writeImagenesTxt(dir, row, expectedNames)

  let downloaded = 0
  let skipped = 0
  let failed = 0

  if (!skipDownload && supabaseUrl) {
    const refs = []
    const primaryPath = storagePathForDownload(row.image_url)
    if (primaryPath) refs.push(primaryPath)
    if (Array.isArray(row.images)) {
      for (const im of row.images) {
        const p = storagePathForDownload(im)
        if (p && !refs.includes(p)) refs.push(p)
      }
    }

    for (let i = 0; i < refs.length; i++) {
      const storagePath = refs[i]
      const fileName = expectedNames[i] || storagePath.split('/').pop()
      if (!fileName) continue
      const dest = path.join(dir, fileName)
      const url = publicStorageUrl(supabaseUrl, storagePath)
      const result = await downloadToFile(url, dest)
      if (result === 'ok') downloaded += 1
      else if (result === 'skip') skipped += 1
      else failed += 1
    }
  }

  const renamed = renameLooseImages(dir, expectedNames, slug)
  return { dir, downloaded, skipped, failed, renamed }
}

function writeChecklist(rows) {
  const checklist = rows
    .filter((r) => r.slug)
    .map((r) => {
      const files = expectedImageFileNames(r)
      return `[${r.slug}]\n${files.map((f) => `  public/images/products/${r.slug}/${f}`).join('\n')}`
    })
    .join('\n\n')
  fs.writeFileSync(path.join(root, 'data', 'product-image-checklist.txt'), `${checklist}\n`, 'utf8')
}

async function main() {
  loadEnvLocal()
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!urlOrMissing(supabaseUrl, key)) process.exit(1)

  const admin = createClient(supabaseUrl, key, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(formatSupabaseError(error, supabaseUrl))
    process.exit(1)
  }

  const rows = (data || []).map(rowForBackup)
  fs.writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
  console.log(`OK: ${rows.length} productos → ${outPath}`)

  fs.mkdirSync(productsRoot, { recursive: true })
  let totalDown = 0
  let totalSkip = 0
  let totalFail = 0
  let totalRenamed = 0
  let folders = 0

  for (const row of rows) {
    const stats = await syncProductImages(row, supabaseUrl)
    if (!stats.dir) continue
    folders += 1
    totalDown += stats.downloaded
    totalSkip += stats.skipped
    totalRenamed += stats.renamed
    totalFail += stats.failed
    const slug = row.slug
    if (stats.downloaded || stats.renamed) {
      console.log(
        `  ${slug}: +${stats.downloaded} descargadas, ${stats.renamed} renombradas` +
          (stats.failed ? `, ${stats.failed} fallidas` : '')
      )
    }
  }

  writeChecklist(rows)

  console.log('')
  console.log(`Carpetas: ${folders} en public/images/products/`)
  if (!skipDownload) {
    console.log(`Imágenes: ${totalDown} nuevas, ${totalSkip} ya existían, ${totalFail} error de descarga`)
  } else {
    console.log('Descarga omitida (--skip-download)')
  }
  console.log(`Renombradas en carpeta: ${totalRenamed}`)
  console.log('Checklist: data/product-image-checklist.txt')
  console.log('Siguiente: npm run images:variants  (WebP livianos para catálogo/ficha)')
}

function formatSupabaseError(error, supabaseUrl) {
  const msg = String(error?.message || error || '')
  if (
    msg.includes('521') ||
    msg.includes('Web server is down') ||
    msg.trimStart().startsWith('<!DOCTYPE')
  ) {
    const host = supabaseUrl ? new URL(supabaseUrl).hostname : 'tu proyecto Supabase'
    return [
      `Supabase no responde (${host}).`,
      'Error 521: el proyecto está pausado o el servidor no levantó todavía.',
      'Dashboard → Restore project → esperá 2–5 min → npm run sync:catalog',
    ].join('\n')
  }
  if (msg.length > 400) {
    return `${msg.slice(0, 180)}… (respuesta inesperada; revisá SUPABASE_URL en .env.local)`
  }
  return msg
}

function formatFetchError(error, supabaseUrl) {
  const cause = error?.cause
  if (cause?.code === 'ENOTFOUND') {
    const host = supabaseUrl ? new URL(supabaseUrl).hostname : 'SUPABASE_URL'
    return `No se pudo resolver ${host}. Revisá SUPABASE_URL en .env.local.`
  }
  if (cause?.message) return `fetch failed: ${cause.message}`
  return String(error?.message || error)
}
function urlOrMissing(supabaseUrl, key) {
  if (!supabaseUrl || !key) {
    console.error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
    return false
  }
  return true
}

main().catch((e) => {
  loadEnvLocal()
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  console.error(formatFetchError(e, supabaseUrl))
  process.exit(1)
})
