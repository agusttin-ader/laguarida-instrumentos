#!/usr/bin/env node
/**
 * Variantes WebP del hero home (mobile + desktop).
 *
 * Entrada:  public/images/hero/*.{jpg,jpeg,png,webp}
 * Salida:   public/images/hero/variants/<stem>.{mobile|desktop}.webp
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const VARIANTS = {
  mobile: { width: 828, quality: 74 },
  desktop: { width: 1600, quality: 78 },
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const heroDir = path.join(__dirname, '..', 'public', 'images', 'hero')
const outDir = path.join(heroDir, 'variants')
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i
const force = process.argv.includes('--force')

function listSources() {
  if (!fs.existsSync(heroDir)) return []
  return fs
    .readdirSync(heroDir, { withFileTypes: true })
    .filter((e) => e.isFile() && IMAGE_EXT.test(e.name))
    .map((e) => e.name)
}

function stripExtension(fileName) {
  return String(fileName || '').replace(/\.[a-z0-9]+$/i, '')
}

function pickSourceFile(stem, files) {
  const webp = files.find((f) => stripExtension(f) === stem && /\.webp$/i.test(f))
  if (webp) return webp
  return files.find((f) => stripExtension(f) === stem)
}

function needsWrite(srcPath, destPath) {
  if (force) return true
  if (!fs.existsSync(destPath)) return true
  try {
    return fs.statSync(srcPath).mtimeMs > fs.statSync(destPath).mtimeMs
  } catch {
    return true
  }
}

async function writeVariant(srcPath, destPath, { width, quality }) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true })
  await sharp(srcPath, { failOn: 'none' })
    .rotate()
    .resize({ width, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(destPath)
}

async function main() {
  const files = listSources()
  const stems = [...new Set(files.map(stripExtension))]
  if (!stems.length) {
    console.log('No hay imágenes en public/images/hero/')
    return
  }

  let created = 0
  let skipped = 0
  let failed = 0

  for (const stem of stems) {
    const sourceName = pickSourceFile(stem, files)
    if (!sourceName) continue
    const srcPath = path.join(heroDir, sourceName)

    for (const [suffix, spec] of Object.entries(VARIANTS)) {
      const destPath = path.join(outDir, `${stem}.${suffix}.webp`)
      if (!needsWrite(srcPath, destPath)) {
        skipped += 1
        continue
      }
      try {
        await writeVariant(srcPath, destPath, spec)
        created += 1
        console.log(`  + ${path.basename(destPath)}`)
      } catch (err) {
        failed += 1
        console.warn(`  fail ${stem}.${suffix}: ${err.message || err}`)
      }
    }
  }

  console.log('')
  console.log(`Hero stems: ${stems.length}`)
  console.log(`Variantes nuevas/actualizadas: ${created}`)
  console.log(`Omitidas (al día): ${skipped}`)
  if (failed) console.log(`Errores: ${failed}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
