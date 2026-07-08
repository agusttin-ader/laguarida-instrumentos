import { absoluteUrl } from '../../lib/siteUrl'

export const metadata = {
  title: 'Tu selección',
  description: 'Productos que guardaste en La Guarida. Guitarras e instrumentos que te interesan.',
  alternates: {
    canonical: absoluteUrl('/favoritos'),
  },
  robots: { index: false, follow: true },
}

export default function FavoritosLayout({ children }) {
  return children
}
