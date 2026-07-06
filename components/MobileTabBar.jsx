"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFavorites } from './ProductShareAndFavorite'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'

const WA_HREF = buildWaMeHref(WHATSAPP_DEFAULT_WEB_MESSAGE)

function HomeIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function CatalogIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" />
    </svg>
  )
}

function HeartIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 1.6 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.8 7.6c0 5.8-8.8 11.4-8.8 11.4S3.2 13.4 3.2 7.6C3.2 5 5 3.2 7.6 3.2c1.7 0 3.3.9 4.4 2.3 1.1-1.4 2.7-2.3 4.4-2.3 2.6 0 4.4 1.8 4.4 4.4z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3.4a8.6 8.6 0 0 0-7.4 12.98L3.4 20.6l4.34-1.14A8.6 8.6 0 1 0 12 3.4Z" />
      <path d="M9.4 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.03.3.16.12.26.4 1 .43 1.07.04.08.06.17 0 .27-.05.1-.1.16-.19.24-.1.08-.2.17-.28.24-.1.1-.2.2-.08.4.12.2.53.87 1.14 1.4.78.7 1.44.9 1.63.98.2.1.31.08.43-.04.12-.12.5-.57.63-.77.14-.2.28-.16.46-.1.18.08 1.17.55 1.37.65.2.1.33.14.38.22.04.08.04.48-.12.94-.16.47-.9.9-1.24.95" />
    </svg>
  )
}

function TabItem({ href, label, icon, active, external = false, accentClass = '', badge = 0 }) {
  const colorClass = active ? 'text-[var(--vintage-gold)]' : accentClass || 'text-[var(--dark-muted)]'
  const inner = (
    <span className="relative flex flex-col items-center justify-center gap-[3px]">
      <span className={`relative flex h-7 w-7 items-center justify-center ${colorClass}`}>
        {icon}
        {badge > 0 ? (
          <span
            className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--vintage-gold)] px-1 text-[10px] font-bold leading-none text-[var(--palette-ink)] ring-2 ring-[var(--dark-bg-card)]"
            aria-hidden
          >
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </span>
      <span className={`text-[10px] font-semibold tracking-[0.02em] ${colorClass}`}>{label}</span>
    </span>
  )

  const baseClass =
    'no-custom-btn relative flex min-h-[3.25rem] flex-1 items-center justify-center bg-transparent p-0 text-center transition-colors duration-200 active:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--vintage-gold)]/50'

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={baseClass}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} aria-label={label} aria-current={active ? 'page' : undefined} className={baseClass}>
      {inner}
    </Link>
  )
}

export default function MobileTabBar() {
  const pathname = usePathname()
  const { slugs } = useFavorites()
  const favCount = Array.isArray(slugs) ? slugs.length : 0

  const path = typeof pathname === 'string' ? pathname : ''
  const isHome = path === '/' || path === ''
  const isCatalog = path.startsWith('/catalogo')
  const isFavorites = path.startsWith('/favoritos')

  return (
    <nav
      aria-label="Navegación inferior"
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-[var(--z-bottom-nav)] flex items-stretch border-t border-[rgba(var(--palette-gold-rgb),0.28)] bg-[var(--dark-bg-card)] shadow-[0_-8px_28px_rgba(0,0,0,0.4)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <TabItem href="/" label="Inicio" icon={<HomeIcon active={isHome} />} active={isHome} />
      <TabItem href="/catalogo" label="Catálogo" icon={<CatalogIcon active={isCatalog} />} active={isCatalog} />
      <TabItem href="/favoritos" label="Favoritos" icon={<HeartIcon active={isFavorites} />} active={isFavorites} badge={favCount} />
      <TabItem href={WA_HREF} label="WhatsApp" icon={<WhatsAppIcon />} external accentClass="text-[#25D366]" />
    </nav>
  )
}
