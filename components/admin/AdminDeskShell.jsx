'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Plus,
  List,
  Storefront,
  SignOut,
  X,
} from 'phosphor-react'

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

const productosNavItems = [
  {
    href: '/admin/productos/nuevo',
    label: 'Nuevo producto',
    icon: Plus,
    match: matchNuevo,
    iconClass: 'text-emerald-400',
  },
  {
    href: '/admin/productos/catalogo',
    label: 'Catálogo',
    icon: List,
    match: matchCatalogo,
    iconClass: 'text-indigo-300',
  },
]

/**
 * Layout dashboard modo oscuro + sidebar (alto contraste).
 */
export default function AdminDeskShell({
  children,
  user,
  loading,
  online,
  onLogout,
}) {
  const pathname = usePathname() || ''
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const syncBodyScroll = () => {
      if (mq.matches && drawerOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    syncBodyScroll()
    mq.addEventListener('change', syncBodyScroll)
    return () => {
      mq.removeEventListener('change', syncBodyScroll)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const displayName = user?.email
    ? String(user.email).split('@')[0].replace(/[._-]/g, ' ').trim()
    : ''

  return (
    <div className="admin-desk-root flex min-h-screen w-full bg-[#0f1219] text-slate-100">
      <aside
        className={`admin-desk-sidebar flex flex-col bg-[#12151f] text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] max-md:transform-gpu
          fixed inset-0 z-[70] h-dvh w-full max-w-none overflow-hidden border-0
          md:sticky md:inset-auto md:top-0 md:z-auto md:h-screen md:w-[260px] md:max-w-[260px] md:shrink-0 md:overflow-visible md:border-r md:border-white/10 md:duration-0
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex min-h-16 items-center gap-2 border-b border-white/10 px-5 pt-[max(0px,env(safe-area-inset-top,0px))] md:pt-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <img
              src="/images/logo/og-pick-icon.PNG"
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold tracking-tight text-white">La Guarida</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Admin
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

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-3 py-5">
          <div className="min-h-0 flex-1">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Productos
            </p>
            <ul className="space-y-1">
              {productosNavItems.map(({ href, label, icon: Icon, match, iconClass }) => {
                const active = navActive(pathname, match)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out no-custom-btn ${
                        active
                          ? 'bg-white/[0.14] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                          : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <Icon
                        size={22}
                        weight={active ? 'bold' : 'regular'}
                        className={active ? iconClass : 'text-slate-500'}
                      />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="mt-auto border-t border-white/10 pt-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors duration-200 ease-out hover:bg-white/[0.08] hover:text-white no-custom-btn"
            >
              <Storefront size={22} weight="regular" className="text-emerald-400" />
              Ver tienda
            </a>
          </div>
        </nav>

        <div
          className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-3"
        >
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false)
              onLogout()
            }}
            className="admin-desk-btn-danger-on-hover group flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-semibold no-custom-btn transition-[background-color,border-color,box-shadow,color] duration-150"
          >
            <SignOut size={20} weight="bold" className="shrink-0" />
            Cerrar sesión
          </button>
          <p className="mt-3 px-1 text-center text-[10px] text-slate-500">
            © La Guarida Instrumentos
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="admin-desk-top sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#161b26] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.35)] sm:px-6 md:px-8">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-slate-200 shadow-sm transition-transform duration-150 hover:bg-white/10 active:scale-[0.96] md:hidden no-custom-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            <List size={24} weight="bold" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-400 sm:text-sm">Bienvenido de nuevo</p>
            <p className="truncate text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
              {loading ? '…' : displayName || 'Administrador'}{' '}
              <span className="inline-flex items-center gap-1 align-middle" aria-hidden>
                <span>👋</span>
                <span>🎸</span>
              </span>
            </p>
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            {online === true || online === false ? (
              <span
                className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-200 sm:inline-flex"
                title={online ? 'Conectado' : 'Sin conexión'}
              >
                <span
                  className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  aria-hidden
                />
                {online ? 'En línea' : 'Sin red'}
              </span>
            ) : null}
            {user?.email ? (
              <span className="hidden max-w-[200px] truncate rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-300 lg:inline-block">
                {user.email}
              </span>
            ) : null}
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
