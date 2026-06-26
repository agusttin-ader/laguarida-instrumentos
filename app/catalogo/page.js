import React, { Suspense } from 'react'
import CatalogPageContent from '../../components/CatalogPageContent'
import { absoluteUrl } from '../../lib/siteUrl'

export const revalidate = 600

export const metadata = {
  title: 'Catálogo — La Guarida',
  description:
    'Catálogo completo de guitarras e instrumentos musicales seleccionados. Stratocaster, Telecaster, Les Paul, PRS y más.',
  alternates: {
    canonical: absoluteUrl('/catalogo'),
  },
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogPageContent />
    </Suspense>
  )
}
