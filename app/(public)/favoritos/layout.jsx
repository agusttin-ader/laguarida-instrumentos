import { absoluteUrl } from '../../../lib/siteUrl'
import '../../../styles/commerce.css'
import '../../../styles/toast.css'
import StoreInteractionProviders from '../../../components/StoreInteractionProviders'

export const metadata = {
  title: 'Tu selección',
  description: 'Productos que guardaste en La Guarida. Guitarras e instrumentos que te interesan.',
  alternates: {
    canonical: absoluteUrl('/favoritos'),
  },
  robots: { index: false, follow: true },
}

export default function FavoritosLayout({ children }) {
  return <StoreInteractionProviders>{children}</StoreInteractionProviders>
}
