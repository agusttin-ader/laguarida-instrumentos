import React from 'react'
import ClientAuth from './auth/ClientAuth'

export const metadata = {
  title: 'Admin - La Guarida',
}

export default function AdminLayout({ children }){
  return (
    <div className="min-h-screen bg-[#f6efe6] text-gray-900">
      <div className="admin-container mx-auto px-4 md:px-6 py-8 md:py-12">
        <header className="bg-white border-b border-gray-100 p-6 mb-8 rounded-xl shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="header-logo-wrapper w-36">
                <img src="/images/logo/logo-fondo-claro.PNG" alt="La Guarida" loading="eager" style={{height: 'auto', width: '100%'}} className="logo-light w-full h-auto" />
              </div>
              <div>
                <div className="text-lg font-semibold">Panel de Administración</div>
                <div className="text-xs text-gray-600">Área de administración</div>
              </div>
            </div>

            <div className="hidden md:block" aria-hidden>
              {/* decorative spacer to keep header balanced */}
            </div>
          </div>
        </header>

        <ClientAuth>
          <main className="space-y-8">{children}</main>
        </ClientAuth>

        <footer className="mt-12 text-sm text-gray-600">
          <div>Admin — interfaz de administración.</div>
        </footer>
      </div>
    </div>
  )
}
