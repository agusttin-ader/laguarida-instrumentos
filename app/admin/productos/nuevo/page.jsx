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
    <div className="mx-auto w-full max-w-5xl animate-page-in space-y-5 md:space-y-6">
      <div className="flex flex-col gap-3 px-0.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/productos/catalogo"
            className="no-custom-btn mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-indigo-300"
          >
            <CaretLeft size={14} weight="bold" aria-hidden />
            Volver a productos
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Nuevo producto</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-300">
            Completá la ficha en esta página; al guardar volvés al listado para seguir editando otros ítems.
          </p>
        </div>
      </div>
      <AdminProductForm mode="create" />
    </div>
  )
}
