import Link from 'next/link'

const VARIANTS = {
  primary:
    'bg-[var(--dark-cta-bg)] text-[var(--dark-cta-text)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-[var(--dark-cta-hover)] hover:scale-[1.02] active:scale-[0.98]',
  ghost:
    'border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:bg-white/25',
  'ghost-subtle':
    'border border-white/15 bg-transparent text-[var(--dark-text-primary)] hover:border-white/25 hover:bg-white/[0.04]',
  whatsapp:
    'bg-[#25D366] text-white shadow-[0_2px_12px_rgba(37,211,102,0.35)] hover:bg-[#20bd5a] hover:shadow-[0_4px_18px_rgba(37,211,102,0.45)] active:scale-[0.99] focus-visible:ring-[#25D366]',
  gold:
    'bg-[var(--palette-gold)] text-[#181715] hover:opacity-90',
  'gold-gradient':
    'bg-gradient-to-r from-[#f2ae30] to-[#f28729] text-[var(--palette-ink)] shadow-[0_4px_20px_rgba(var(--palette-gold-rgb),0.25)] hover:shadow-[0_6px_26px_rgba(var(--palette-gold-rgb),0.35)]',
  editorial:
    'border border-[rgba(var(--palette-gold-rgb),0.35)] bg-white/[0.03] text-[var(--dark-text-primary)] tracking-wide',
  'brand-ghost':
    'border border-white/10 bg-white/[0.03] text-[var(--dark-text-secondary)] font-medium hover:border-[rgba(var(--palette-gold-rgb),0.35)] hover:bg-white/[0.06] hover:text-[var(--dark-text-primary)]',
}

const SIZES = {
  default: 'min-h-[var(--btn-h-mobile)] px-5 py-2.5 text-sm md:min-h-[var(--btn-h-desktop)]',
  lg: 'min-h-[var(--btn-h-mobile)] px-6 py-3 text-sm sm:text-base',
  full: 'w-full min-h-[var(--btn-h-mobile)] px-5 py-2.5 text-sm',
}

const BASE =
  'no-custom-btn inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]'

function buildClassName(variant, size, className) {
  return [BASE, VARIANTS[variant] || VARIANTS.primary, SIZES[size] || SIZES.default, className]
    .filter(Boolean)
    .join(' ')
}

export default function Button({
  as,
  variant = 'primary',
  size = 'default',
  href,
  className = '',
  children,
  ...props
}) {
  const classes = buildClassName(variant, size, className)
  const Component = as || (href ? Link : 'button')

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('//')
    if (isExternal) {
      return (
        <a href={href} className={classes} {...props}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}
