'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Plus,
  List,
  Storefront,
  SignOut,
  X,
} from 'phosphor-react'

const SIDEBAR_W = 'w-[260px]'

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

  const displayName = user?.email
    ? String(user.email).split('@')[0].replace(/[._-]/g, ' ').trim()
    : ''

  return (
    <div className="admin-desk-root flex min-h-screen w-full bg-[#0f1219] text-slate-100">
      {drawerOpen ? (
        /* div (no <button>): estilos globales de button usan border-radius:999px y deforman un overlay a pantalla completa */
        <div
          className="fixed inset-0 z-[60] cursor-default bg-black/55 md:hidden"
          onClick={() => setDrawerOpen(false)}
          role="presentation"
          aria-hidden
        />
      ) : null}

      <aside
        className={`admin-desk-sidebar fixed md:sticky top-0 z-[70] flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#12151f] text-white transition-transform duration-200 ease-out md:translate-x-0 ${SIDEBAR_W} ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-black/40">
            <span className="text-[11px] font-black tracking-tight text-slate-900">LG</span>
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold tracking-tight text-white">La Guarida</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Admin
            </p>
          </div>
          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 md:hidden no-custom-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar"
          >
            <X size={22} weight="bold" />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
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
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors no-custom-btn ${
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
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white no-custom-btn"
            >
              <Storefront size={22} weight="regular" className="text-emerald-400" />
              Ver tienda
            </a>
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false)
              onLogout()
            }}
            className="admin-desk-btn-danger flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-semibold no-custom-btn"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-slate-200 shadow-sm hover:bg-white/10 md:hidden no-custom-btn"
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
