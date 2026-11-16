import '../../../styles/catalog.css'
import '../../../styles/commerce.css'
import '../../../styles/toast.css'
import StoreInteractionProviders from '../../../components/StoreInteractionProviders'

export default function CatalogoLayout({ children }) {
  return <StoreInteractionProviders>{children}</StoreInteractionProviders>
}