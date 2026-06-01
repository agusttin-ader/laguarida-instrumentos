#!/usr/bin/env node
/**
 * Copia el catálogo de Supabase a data/products-backup.json (solo filas, URLs de storage como en DB).
 * Uso: npm run sync:catalog
 *
 * Requiere en .env.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outPath = path.join(root, 'data', 'products-backup.json')

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

function storagePathFromUrl(url) {
  if (!url || typeof url !== 'string') return url
  const marker = '/storage/v1/object/public/products/'
  const i = url.indexOf(marker)
  if (i === -1) return url
  try {
    return decodeURIComponent(url.slice(i + marker.length).split('?')[0])
  } catch {
    return url.slice(i + marker.length)
  }
}

function rowForBackup(row) {
  const images = Array.isArray(row.images)
    ? row.images.map((u) => storagePathFromUrl(u))
    : []
  const image_url = storagePathFromUrl(row.image_url) || images[0] || ''
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

async function main() {
  loadEnvLocal()
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
  }

  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  const rows = (data || []).map(rowForBackup)
  fs.writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
  console.log(`OK: ${rows.length} productos → ${outPath}`)
  console.log(
    'Tip: si las fotos están solo en Storage, descargalas a public/images/products/<slug>/ o usá URLs completas en el backup.'
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
