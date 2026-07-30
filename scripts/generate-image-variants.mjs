#!/usr/bin/env node
/**
 * Genera variantes WebP estáticas junto a cada foto de producto.
 *
 * Entrada:  public/images/products/<slug>/<archivo>.{jpg,jpeg,png,webp,...}
 * Salida:   public/images/products/<slug>/variants/<archivo>.{card|main|large}.webp
 *
 * Uso:
 *   npm run images:variants
 *   npm run images:variants -- --force   (regenera aunque existan)
 *
 * No modifica image_url / images del catálogo: la UI resuelve la variante en forDisplay().
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

/** Debe coincidir con lib/utils/staticImageVariants.js → STATIC_VARIANT_FILES */
const STATIC_VARIANT_FILES = {
  card: { width: 480, quality: 58, suffix: 'card' },
  main: { width: 1280, quality: 70, suffix: 'main' },
  large: { width: 1600, quality: 74, suffix: 'large' },
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const productsRoot = path.join(root, 'public', 'images', 'products')
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i
const force = process.argv.includes('--force')

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

function needsWrite(srcPath, destPath) {
  if (force) return true
  if (!fs.existsSync(destPath)) return true
  try {
    const srcStat = fs.statSync(srcPath)
    const destStat = fs.statSync(destPath)
    return srcStat.mtimeMs > destStat.mtimeMs
  } catch {
    return true
  }
}

async function writeVariant(srcPath, destPath, { width, quality }) {
  const pipeline = sharp(srcPath, { failOn: 'none' })
    .rotate()
    .resize({
      width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })

  await fs.promises.mkdir(path.dirname(destPath), { recursive: true })
  await pipeline.toFile(destPath)
}

async function processProduct(slug) {
  const dir = path.join(productsRoot, slug)
  const sources = listSourceImages(dir)
  const variantsDir = path.join(dir, 'variants')
  let created = 0
  let skipped = 0
  let failed = 0

  for (const fileName of sources) {
    const srcPath = path.join(dir, fileName)
    const base = stripExtension(fileName)
    for (const spec of Object.values(STATIC_VARIANT_FILES)) {
      const destName = `${base}.${spec.suffix}.webp`
      const destPath = path.join(variantsDir, destName)
      if (!needsWrite(srcPath, destPath)) {
        skipped += 1
        continue
      }
      try {
        await writeVariant(srcPath, destPath, spec)
        created += 1
      } catch (err) {
        failed += 1
        console.warn(`  fail ${slug}/${fileName} → ${destName}: ${err.message || err}`)
      }
    }
  }

  return { sources: sources.length, created, skipped, failed }
}

async function main() {
  const slugs = listProductDirs()
  if (!slugs.length) {
    console.log('No hay carpetas en public/images/products/')
    return
  }

  let totalCreated = 0
  let totalSkipped = 0
  let totalFailed = 0
  let totalSources = 0

  console.log(`Generando variantes WebP (${Object.keys(STATIC_VARIANT_FILES).join(', ')})…`)
  if (force) console.log('Modo --force: regenera todas')

  for (const slug of slugs) {
    const stats = await processProduct(slug)
    totalSources += stats.sources
    totalCreated += stats.created
    totalSkipped += stats.skipped
    totalFailed += stats.failed
    if (stats.created || stats.failed) {
      console.log(
        `  ${slug}: ${stats.sources} origen(es), +${stats.created} variantes` +
          (stats.failed ? `, ${stats.failed} error(es)` : '')
      )
    }
  }

  console.log('')
  console.log(`Productos: ${slugs.length}`)
  console.log(`Orígenes: ${totalSources}`)
  console.log(`Variantes nuevas/actualizadas: ${totalCreated}`)
  console.log(`Omitidas (al día): ${totalSkipped}`)
  if (totalFailed) console.log(`Errores: ${totalFailed}`)
  console.log('Listo. La UI usa estas rutas vía imageService.forDisplay().')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
