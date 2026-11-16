"use client"

import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { CaretLeft } from 'phosphor-react'

const AdminProductForm = dynamic(() => import('../../../../components/admin/AdminProductForm'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center gap-3 py-16" aria-busy="true">
      <span className="app-loading-spinner" aria-hidden />
      <p className="text-sm text-slate-400">Cargando formulario…</p>
    </div>
  ),
})

export default function AdminProductoNuevoPage() {
  return (
    <div className="admin-page mx-auto w-full max-w-6xl space-y-6">
      <div className="px-0.5">
        <Link
          href="/admin/productos/catalogo"
          className="no-custom-btn mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-[var(--admin-accent)]"
        >
          <CaretLeft size={14} weight="bold" aria-hidden />
          Volver al catálogo
        </Link>
        <p className="admin-page-lead">
          Completá la ficha en esta página; al guardar volvés al listado para seguir editando otros ítems.
        </p>
      </div>
      <AdminProductForm mode="create" />
    </div>
  )
}
