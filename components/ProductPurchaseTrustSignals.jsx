/**
 * Señales de confianza compactas junto a precio / disponibilidad.
 * Textos alineados al FAQ del sitio (stock, envíos, pagos, permutas).
 */
const TRUST_ITEMS = [
  {
    id: 'stock',
    label: 'Stock confirmado',
    Icon: StockIcon,
  },
  {
    id: 'shipping',
    label: 'Consultá envíos a todo el país',
    Icon: ShippingIcon,
  },
  {
    id: 'payments',
    label: 'USD, ARS al cambio del día y USDT',
    Icon: PaymentsIcon,
  },
  {
    id: 'trade',
    label: 'Permutas a evaluar',
    Icon: TradeIcon,
  },
]

function StockIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 7L9.5 17.5 4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShippingIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7h11v10H3V7zm11 3h4l3 3v4h-7V10z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="18.5" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="18.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

function PaymentsIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function TradeIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h11l-2-2M17 17H6l2 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 7v4M6 17v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export default function ProductPurchaseTrustSignals({ className = '' }) {
  return (
    <ul
      className={`product-trust-signals ${className}`.trim()}
      aria-label="Condiciones de compra"
    >
      {TRUST_ITEMS.map(({ id, label, Icon }) => (
        <li key={id} className="product-trust-signals__item">
          <span className="product-trust-signals__icon" aria-hidden>
            <Icon className="product-trust-signals__svg" />
          </span>
          <span className="product-trust-signals__label">{label}</span>
        </li>
      ))}
    </ul>
  )
}
