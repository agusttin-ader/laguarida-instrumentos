import HomePageContent from '../components/HomePageContent'
import { getHomeHeroBackgrounds } from '../lib/data/homeHeroBackgrounds'
import { getWeeklyFeaturedExpensiveProducts } from '../lib/data/homeFeaturedExpensive'
import { absoluteUrl } from '../lib/siteUrl'

export const revalidate = 600

export const metadata = {
  title: 'Catálogo — La Guarida',
  description:
    'Catálogo de guitarras e instrumentos musicales en Argentina. Venta de guitarras nuevas y usados, accesorios y amplificadores. Encontrá guitarras, bajos y equipos con asesoramiento profesional.',
  alternates: {
    canonical: absoluteUrl('/')
  }
}

export default function Page() {
  const heroSlides = getHomeHeroBackgrounds()
  const featuredProducts = getWeeklyFeaturedExpensiveProducts()
  return <HomePageContent heroSlides={heroSlides} featuredProducts={featuredProducts} />
}
