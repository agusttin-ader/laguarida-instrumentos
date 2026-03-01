import React from 'react'
import AdminProducts from '../../components/AdminProducts'

export default function AdminIndex(){
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-4 py-4 md:px-7 md:py-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
        <div className="section-kicker-minimal inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-white/75">
          Consola de administración
        </div>
        <h1 className="section-title-minimal mt-2.5 text-white md:text-3xl">Panel de Administración</h1>
        <p className="mt-1 text-[13px] md:text-sm text-white/70">Gestioná productos, imágenes y catálogo con una vista centralizada.</p>
      </div>
      <AdminProducts />
    </div>
  )
}
