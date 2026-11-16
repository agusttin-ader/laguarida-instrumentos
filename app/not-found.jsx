import Link from 'next/link'
import SiteShell from '../components/SiteShell'

export default function NotFound() {
  return (
    <SiteShell>
      <div className="container-tight py-16 text-center">
        <p className="section-kicker-minimal mb-2">404</p>
        <h1 className="section-heading-editorial mb-4">Página no encontrada</h1>
        <p className="mb-8 text-[var(--dark-muted)]">El enlace no existe o el producto ya no está publicado.</p>
        <Link href="/" className="no-custom-btn btn-variant-primary inline-flex min-h-11 items-center rounded-full px-6 py-2.5 text-sm font-semibold">
          Volver al inicio
        </Link>
      </div>
    </SiteShell>
  )
}