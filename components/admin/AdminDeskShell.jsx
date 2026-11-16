'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Plus,
  List,
  Storefront,
  SignOut,
  X,
} from 'phosphor-react'
import { SITE_MARK_SRC } from '../../lib/branding/logo'

function navActive(pathname, matcher) {
  if (typeof matcher === 'function') return matcher(pathname)
  return pathname === matcher || pathname === `${matcher}/`
}

function matchCatalogo(pathname) {
  if (pathname === '/admin/productos/catalogo' || pathname === '/admin/productos/catalogo/') return true
  if (pathname === '/admin/productos' || pathname === '/admin/productos/') return true
  return /^\/admin\/productos\/[^/]+\/editar(?:\/|$)/.test(pathname)
}

function matchNuevo(pathname) {
  return pathname === '/admin/productos/nuevo' || pathname === '/admin/productos/nuevo/'
}

function pageMetaFromPath(pathname) {
  if (matchNuevo(pathname)) {
    return { eyebrow: 'Admin · Productos', title: 'Nuevo producto' }
  }
  if (/^\/admin\/productos\/[^/]+\/editar/.test(pathname)) {
    return { eyebrow: 'Admin · Productos', title: 'Editar producto' }
  }
  if (matchCatalogo(pathname)) {
    return { eyebrow: 'Admin · Productos', title: 'Catálogo' }
  }
  return { eyebrow: 'La Guarida', title: 'Panel' }
}

const productosNavItems = [
  {
    href: '/admin/productos/catalogo',
    label: 'Catálogo',
    icon: List,
    match: matchCatalogo,
  },
  {
    href: '/admin/productos/nuevo',
    label: 'Nuevo producto',
    icon: Plus,
    match: matchNuevo,
  },
]

function releaseBodyScrollLock() {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  document.body.classList.remove('modal-open')
}

export default function AdminDeskShell({
  children,
  user,
  loading,
  online,
  onLogout,
}) {
  const pathname = usePathname() || ''
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { eyebrow, title } = useMemo(() => pageMetaFromPath(pathname), [pathname])

  const userInitial = useMemo(() => {
    const email = String(user?.email || '').trim()
    if (!email) return '?'
    return email[0].toUpperCase()
  }, [user?.email])

  useEffect(() => {
    setDrawerOpen(false)
    releaseBodyScrollLock()
  }, [pathname])

  useEffect(() => {
    releaseBodyScrollLock()
    return () => releaseBodyScrollLock()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    if (mq.matches && drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      releaseBodyScrollLock()
    }
    return () => releaseBodyScrollLock()
  }, [drawerOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) {
        setDrawerOpen(false)
        releaseBodyScrollLock()
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const sidebarNav = (
    <>
      <div className="flex min-h-[4.25rem] items-center gap-3 border-b border-white/[0.08] px-5 pt-[max(0px,env(safe-area-inset-top,0px))] md:pt-0">
        <div className="admin-desk-brand-mark flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/20">
          <img
            src={SITE_MARK_SRC}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-serif text-[15px] font-semibold tracking-tight text-white">La Guarida</p>
          <p className="admin-desk-eyebrow mt-0.5 !text-[9px] !tracking-[0.22em] text-slate-500">
            Backstage
          </p>
        </div>
        <button
          type="button"
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-transform duration-150 hover:bg-white/10 active:scale-[0.96] md:hidden no-custom-btn"
          onClick={() => setDrawerOpen(false)}
          aria-label="Cerrar"
        >
          <X size={22} weight="bold" />
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-3 py-6">
        <div className="min-h-0 flex-1">
          <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Productos
          </p>
          <ul className="space-y-1">
            {productosNavItems.map(({ href, label, icon: Icon, match }) => {
              const active = navActive(pathname, match)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`admin-nav-link flex items-center gap-3 px-3 py-2.5 text-sm font-medium no-custom-btn ${
                      active
                        ? 'admin-nav-link--active text-white'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                    }`}
                  >
                    <Icon
                      size={22}
                      weight={active ? 'fill' : 'regular'}
                      className={active ? 'text-[var(--admin-accent)]' : 'text-slate-500'}
                    />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="mt-auto border-t border-white/[0.08] pt-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setDrawerOpen(false)}
            className="admin-nav-link flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-100 no-custom-btn"
          >
            <Storefront size={22} weight="regular" className="text-[var(--admin-accent)]" />
            Ver tienda
          </a>
        </div>
      </nav>

      <div className="border-t border-white/[0.08] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-3">
        <button
          type="button"
          onClick={() => {
            setDrawerOpen(false)
            onLogout()
          }}
          className="admin-desk-btn-danger-on-hover group flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold no-custom-btn"
        >
          <SignOut size={20} weight="bold" className="shrink-0" />
          Cerrar sesión
        </button>
        <p className="mt-3 px-1 text-center text-[10px] tracking-wide text-slate-600">
          La Guarida Instrumentos
        </p>
      </div>
    </>
  )

  return (
    <div className="admin-desk-root w-full max-w-[100vw] text-slate-100 max-md:block md:flex md:min-h-dvh">
      {drawerOpen ? (
        <button
          type="button"
          className="admin-desk-backdrop fixed inset-0 z-[65] bg-black/55 backdrop-blur-[2px] md:hidden no-custom-btn"
          aria-label="Cerrar menú"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      {/* Desktop: sidebar siempre visible */}
      <aside className="admin-desk-sidebar admin-desk-sidebar--desktop hidden h-screen w-[268px] shrink-0 flex-col border-r border-white/[0.08] md:flex">
        {sidebarNav}
      </aside>

      {/* Mobile: drawer solo cuando está abierto (nada superpuesto en reposo) */}
      {drawerOpen ? (
        <aside
          className="admin-desk-sidebar admin-desk-sidebar--drawer fixed inset-y-0 left-0 z-[70] flex h-dvh w-[min(100vw,288px)] max-w-[min(100vw,288px)] flex-col overflow-hidden border-r border-white/[0.08] shadow-2xl md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de administración"
        >
          {sidebarNav}
        </aside>
      ) : null}

      <div className="admin-desk-main-column flex min-h-dvh min-w-0 w-full max-w-full flex-col">
        <header className="admin-desk-top sticky top-0 z-30 flex items-center gap-2 border-b px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 md:px-8">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition-transform duration-150 hover:border-[rgba(var(--palette-gold-rgb),0.25)] hover:bg-white/[0.08] active:scale-[0.96] md:hidden no-custom-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={drawerOpen}
          >
            <List size={22} weight="bold" />
          </button>
          <div className="min-w-0 flex-1 pr-1">
            <p className="admin-desk-eyebrow hidden sm:block">{eyebrow}</p>
            <h1 className="admin-desk-page-title truncate text-[1.125rem] leading-tight sm:text-[1.375rem]">
              {loading ? '…' : title}
            </h1>
          </div>
          <div className="admin-desk-header-actions flex shrink-0 items-center gap-1.5 sm:gap-2">
            {(online === true || online === false) && (
              <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300 sm:inline-flex">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  aria-hidden
                />
                {online ? 'En línea' : 'Sin red'}
              </span>
            )}
            {user?.email ? (
              <span className="admin-user-chip relative inline-flex max-w-[2.75rem] sm:max-w-[11rem]" title={user.email}>
                <span className="admin-user-avatar relative" aria-hidden>
                  {userInitial}
                  {(online === true || online === false) ? (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#141820] sm:hidden ${online ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      aria-hidden
                    />
                  ) : null}
                </span>
                <span className="hidden truncate text-xs text-slate-300 lg:inline">
                  {user.email}
                </span>
              </span>
            ) : null}
          </div>
        </header>

        <main className="admin-desk-main flex-1 overflow-x-hidden px-3 py-4 sm:px-6 sm:py-7 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}