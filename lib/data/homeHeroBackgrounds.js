import fs from 'fs'
import path from 'path'
import { enrichHeroSlide } from '../utils/heroImageVariants'

const HERO_DIR = path.join(process.cwd(), 'public/images/hero')
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i

function stem(file) {
  return String(file).replace(/\.[a-z0-9]+$/i, '')
}

/** Imágenes estáticas del hero (`public/images/hero`). Prefiere WebP si existe junto al original. */
export function getHomeHeroBackgrounds() {
  try {
    if (!fs.existsSync(HERO_DIR)) return []
    const files = fs.readdirSync(HERO_DIR).filter((file) => IMAGE_EXT.test(file))
    const webpStems = new Set(
      files.filter((file) => /\.webp$/i.test(file)).map(stem)
    )
    return files
      .filter((file) => {
        if (/\.webp$/i.test(file)) return true
        return !webpStems.has(stem(file))
      })
      .sort((a, b) => a.localeCompare(b))
      .map((file) =>
        enrichHeroSlide({
          src: `/images/hero/${file}`,
          alt: 'La Guarida — instrumentos musicales',
        })
      )
  } catch {
    return []
  }
}
