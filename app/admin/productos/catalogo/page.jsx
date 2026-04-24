"use client"

import React from 'react'
import AdminProducts from '../../../../components/AdminProducts'

export default function AdminProductosCatalogoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-page-in space-y-5 md:space-y-6">
      <div className="px-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Catálogo</h1>
        <p className="mt-1 max-w-xl text-sm text-slate-300">
          Listado del catálogo con búsqueda, edición y bajas. Los cambios se reflejan en la tienda al guardar.
        </p>
      </div>
      <AdminProducts showNewProductHeroSection={false} />
    </div>
  )
}
