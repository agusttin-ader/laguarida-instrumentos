"use client"

import React from 'react'
import dynamic from 'next/dynamic'

const AdminProducts = dynamic(() => import('../../../../components/AdminProducts'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center gap-3 py-16" aria-busy="true">
      <span className="app-loading-spinner" aria-hidden />
      <p className="text-sm text-slate-400">Cargando catálogo…</p>
    </div>
  ),
})

export default function AdminProductosCatalogoPage() {
  return (
    <div className="admin-page mx-auto w-full min-w-0 max-w-6xl space-y-5 sm:space-y-6 md:space-y-7">
      <p className="admin-page-lead px-0.5">
        Listado del catálogo con búsqueda, edición y bajas. Los cambios se reflejan en la tienda al guardar.
      </p>
      <AdminProducts showNewProductHeroSection={false} />
    </div>
  )
}
