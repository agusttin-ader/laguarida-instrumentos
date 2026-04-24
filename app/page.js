import HomePageContent from '../components/HomePageContent'
import { fetchHeroProduct } from '../lib/data/fetchHeroProduct'
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

export default async function Page() {
  const heroProduct = await fetchHeroProduct()

  return <HomePageContent heroProduct={heroProduct} />
}
