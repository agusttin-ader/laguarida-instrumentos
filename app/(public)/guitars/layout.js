import '../../../styles/pdp.css'
import '../../../styles/commerce.css'
import '../../../styles/toast.css'
import StoreInteractionProviders from '../../../components/StoreInteractionProviders'

export default function GuitarsLayout({ children }) {
  return <StoreInteractionProviders>{children}</StoreInteractionProviders>
}