import HomePageContent from '../components/HomePageContent'
import { HOME_HERO_VARIANTS } from '../lib/homeHeroImage'
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
  const featuredProducts = getWeeklyFeaturedExpensiveProducts()

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={HOME_HERO_VARIANTS.mobile}
        media="(max-width: 767px)"
        type="image/webp"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={HOME_HERO_VARIANTS.desktop}
        media="(min-width: 768px)"
        type="image/webp"
        fetchPriority="high"
      />
      <HomePageContent featuredProducts={featuredProducts} />
    </>
  )
}
