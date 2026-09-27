import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'
import { FACEBOOK_HREF, INSTAGRAM_HREF } from '../lib/socialLinks'

export { FACEBOOK_HREF, INSTAGRAM_HREF }

const socialIconBaseClass =
  'no-custom-btn social-icon-link flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 text-white shadow-[0_2px_10px_rgba(0,0,0,0.22)] transition-[transform,filter,box-shadow] duration-200 hover:scale-[1.06] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]'

const socialIconBrandClass = {
  instagram: 'social-icon-link--instagram',
  whatsapp: 'social-icon-link--whatsapp bg-[#25D366]',
  facebook: 'social-icon-link--facebook bg-[#1877F2]',
}

export function IconInstagram({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.906-9.338a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
    </svg>
  )
}

export function IconWhatsApp({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export function IconFacebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
    </svg>
  )
}

export function SocialIconButtons({ className = '', iconSize = 20, compact = false }) {
  const waHref = buildWaMeHref(WHATSAPP_DEFAULT_WEB_MESSAGE)
  const sizeClass = compact ? 'md:h-9 md:w-9' : ''

  return (
    <nav className={className} aria-label="Redes sociales">
      <a
        href={INSTAGRAM_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className={`${socialIconBaseClass} ${socialIconBrandClass.instagram} ${sizeClass}`}
      >
        <IconInstagram size={iconSize} />
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        onClick={trackWhatsAppClick}
        className={`${socialIconBaseClass} ${socialIconBrandClass.whatsapp} ${sizeClass}`}
      >
        <IconWhatsApp size={iconSize} />
      </a>
      <a
        href={FACEBOOK_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className={`${socialIconBaseClass} ${socialIconBrandClass.facebook} ${sizeClass}`}
      >
        <IconFacebook size={iconSize} />
      </a>
    </nav>
  )
}
