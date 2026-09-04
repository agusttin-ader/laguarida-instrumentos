import HomePageContent from '../components/HomePageContent'
import HeroPreloads from '../components/HeroPreloads'
import { getHomeHeroBackgrounds } from '../lib/data/homeHeroBackgrounds'
import { getWeeklyFeaturedExpensiveProducts } from '../lib/data/homeFeaturedExpensive'
import { absoluteUrl } from '../lib/siteUrl'

export const revalidate = 600

export const metadata = {
  title: 'La Guarida — Guitarras e Instrumentos en Argentina',
  description:
    'Tienda de guitarras e instrumentos musicales en Argentina. Stock real, asesoramiento profesional y atención personalizada. Guitarras, bajos, amplificadores y accesorios.',
  keywords: [
    'guitarras Argentina',
    'instrumentos musicales',
    'tienda de guitarras',
    'guitarras eléctricas',
    'bajos',
    'La Guarida',
    'La Guarida Instrumentos',
  ],
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: 'La Guarida — Guitarras e Instrumentos en Argentina',
    description:
      'Tienda de guitarras e instrumentos musicales en Argentina. Stock real, asesoramiento profesional y atención personalizada.',
    url: absoluteUrl('/'),
    type: 'website',
  },
}

export default function Page() {
  const heroSlides = getHomeHeroBackgrounds()
  const featuredProducts = getWeeklyFeaturedExpensiveProducts()
  return (
    <>
      <HeroPreloads slides={heroSlides} />
      <HomePageContent heroSlides={heroSlides} featuredProducts={featuredProducts} />
    </>
  )
}
