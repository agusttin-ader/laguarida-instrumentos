import SiteShell from '../../components/SiteShell'

/** Tienda pública: header, footer y efectos de shell (admin no pasa por acá). */
export default function PublicLayout({ children }) {
  return <SiteShell>{children}</SiteShell>
}