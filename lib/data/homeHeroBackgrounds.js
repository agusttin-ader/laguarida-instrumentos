import fs from 'fs'
import path from 'path'

const HERO_DIR = path.join(process.cwd(), 'public/images/hero')
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i

/** Imágenes estáticas del hero (`public/images/hero`). */
export function getHomeHeroBackgrounds() {
  try {
    if (!fs.existsSync(HERO_DIR)) return []
    return fs
      .readdirSync(HERO_DIR)
      .filter((file) => IMAGE_EXT.test(file))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => ({
        src: `/images/hero/${file}`,
        alt: 'La Guarida — instrumentos musicales',
      }))
  } catch {
    return []
  }
}
