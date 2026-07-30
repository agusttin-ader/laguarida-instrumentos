import CatalogPageContent from '../../components/CatalogPageContent'
import { getPublicCatalogRows } from '../../lib/data/publicCatalog'
import normalizeProduct from '../../lib/utils/normalizeProduct'
import { absoluteUrl } from '../../lib/siteUrl'

export const revalidate = 600

export const metadata = {
  title: 'Catálogo',
  description:
    'Catálogo completo de guitarras e instrumentos musicales seleccionados. Stratocaster, Telecaster, Les Paul, PRS y más.',
  alternates: {
    canonical: absoluteUrl('/catalogo'),
  },
  openGraph: {
    title: 'Catálogo — La Guarida',
    description:
      'Catálogo completo de guitarras e instrumentos musicales seleccionados. Stratocaster, Telecaster, Les Paul, PRS y más.',
    url: absoluteUrl('/catalogo'),
    type: 'website',
  },
}

export default async function CatalogoPage({ searchParams }) {
  const params = await searchParams
  const marcaParam = typeof params?.marca === 'string' ? params.marca : ''
  const modeloParam = typeof params?.modelo === 'string' ? params.modelo : ''
  const filterParams = {
    tipo: typeof params?.tipo === 'string' ? params.tipo : '',
    precioMin: typeof params?.precioMin === 'string' ? params.precioMin : '',
    precioMax: typeof params?.precioMax === 'string' ? params.precioMax : '',
    estado: typeof params?.estado === 'string' ? params.estado : '',
  }

  const rows = await getPublicCatalogRows()
  const initialProducts = rows.map((row) => normalizeProduct(row))

  return (
    <CatalogPageContent
      initialProducts={initialProducts}
      marcaParam={marcaParam}
      modeloParam={modeloParam}
      filterParams={filterParams}
    />
  )
}
