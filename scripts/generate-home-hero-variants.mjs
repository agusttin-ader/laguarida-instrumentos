#!/usr/bin/env node
/**
 * Variantes WebP del hero home (servidas directo desde /public, sin Image Optimizer).
 *
 *   public/images/hero/heroficial.jpg
 *   → public/images/hero/variants/heroficial.mobile.webp
 *   → public/images/hero/variants/heroficial.desktop.webp
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const srcPath = path.join(root, 'public', 'images', 'hero', 'heroficial.jpg')
const outDir = path.join(root, 'public', 'images', 'hero', 'variants')

const VARIANTS = [
  { name: 'heroficial.mobile.webp', width: 1200, quality: 78 },
  { name: 'heroficial.desktop.webp', width: 2560, quality: 82 },
]

const force = process.argv.includes('--force')

async function writeVariant({ name, width, quality }) {
  const destPath = path.join(outDir, name)
  if (!force && fs.existsSync(destPath)) {
    const srcStat = fs.statSync(srcPath)
    const destStat = fs.statSync(destPath)
    if (destStat.mtimeMs >= srcStat.mtimeMs) {
      console.log(`skip ${name} (up to date)`)
      return
    }
  }

  await fs.promises.mkdir(outDir, { recursive: true })
  await sharp(srcPath, { failOn: 'none' })
    .rotate()
    .resize({ width, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(destPath)

  const kb = Math.round(fs.statSync(destPath).size / 1024)
  console.log(`wrote ${name} (${kb} KB, max ${width}px)`)
}

async function main() {
  if (!fs.existsSync(srcPath)) {
    console.error('Missing source:', srcPath)
    process.exit(1)
  }
  for (const spec of VARIANTS) {
    await writeVariant(spec)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
