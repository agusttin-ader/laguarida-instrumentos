import React from 'react'
import AdminProducts from '../../components/AdminProducts'

export default function AdminIndex(){
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="admin-premium-card px-5 py-5 md:px-8 md:py-6">
        <div className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] uppercase tracking-widest text-white/70">
          Consola de administración
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-white md:text-2xl">Panel de Administración</h1>
        <p className="mt-1.5 text-sm text-white/60">Gestioná productos, imágenes y catálogo con una vista centralizada.</p>
      </div>
      <AdminProducts />
    </div>
  )
}
