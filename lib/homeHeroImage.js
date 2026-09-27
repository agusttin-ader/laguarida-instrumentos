/**
 * URLs del hero home (variantes estáticas WebP, sin /_next/image).
 * Generar con: npm run images:hero
 */

export const HOME_HERO_SOURCE = '/images/hero/heroficial.jpg'

export const HOME_HERO_VARIANTS = {
  mobile: '/images/hero/variants/heroficial.mobile.webp',
  desktop: '/images/hero/variants/heroficial.desktop.webp',
}

export function getHomeHeroPhotoSources() {
  return {
    fallback: HOME_HERO_SOURCE,
    mobile: HOME_HERO_VARIANTS.mobile,
    desktop: HOME_HERO_VARIANTS.desktop,
  }
}

/** @deprecated Usar getHomeHeroPhotoSources().fallback */
export const HOME_HERO_BACKGROUND = HOME_HERO_SOURCE
