#!/usr/bin/env node
/**
 * Reporta imágenes de producto sin variantes WebP esperadas.
 * Uso: npm run images:audit
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const productsRoot = path.join(__dirname, '..', 'public', 'images', 'products')
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i
const VARIANT_SUFFIXES = ['card', 'carousel', 'main', 'large']

function listProductDirs() {
  if (!fs.existsSync(productsRoot)) return []
  return fs
    .readdirSync(productsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function listSourceImages(dir) {
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  return entries
    .filter((e) => e.isFile() && IMAGE_EXT.test(e.name) && e.name !== 'IMAGENES.txt')
    .map((e) => e.name)
}

function stripExtension(fileName) {
  return String(fileName || '').replace(/\.[a-z0-9]+$/i, '')
}

function main() {
  const slugs = listProductDirs()
  const missing = []
  let sources = 0

  for (const slug of slugs) {
    const dir = path.join(productsRoot, slug)
    const variantsDir = path.join(dir, 'variants')
    for (const fileName of listSourceImages(dir)) {
      sources += 1
      const base = stripExtension(fileName)
      for (const suffix of VARIANT_SUFFIXES) {
        const dest = path.join(variantsDir, `${base}.${suffix}.webp`)
        if (!fs.existsSync(dest)) {
          missing.push({ slug, fileName, suffix })
        }
      }
    }
  }

  const bySuffix = Object.fromEntries(VARIANT_SUFFIXES.map((s) => [s, 0]))
  for (const row of missing) bySuffix[row.suffix] += 1

  console.log(`Productos: ${slugs.length}`)
  console.log(`Orígenes: ${sources}`)
  console.log(`Faltantes: ${missing.length}`)
  for (const suffix of VARIANT_SUFFIXES) {
    console.log(`  .${suffix}.webp: ${bySuffix[suffix]}`)
  }

  if (missing.length) {
    console.log('\nPrimeras 20:')
    for (const row of missing.slice(0, 20)) {
      console.log(`  ${row.slug}/${row.fileName} → variants/*.${row.suffix}.webp`)
    }
    console.log('\nCorregir: npm run images:variants')
    process.exitCode = 1
  } else {
    console.log('OK — todas las variantes presentes.')
  }
}

main()