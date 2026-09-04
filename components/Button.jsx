import Link from 'next/link'

const VARIANTS = {
  primary: 'btn-variant-primary',
  ghost: 'btn-variant-ghost',
  'ghost-subtle': 'btn-pill-light',
  whatsapp: 'btn-variant-whatsapp',
  gold: 'btn-variant-gold',
  'gold-gradient': 'btn-gold-gradient',
  editorial: 'btn-variant-editorial',
  'brand-ghost': 'btn-pill-light',
  'pill-light': 'btn-pill-light',
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
