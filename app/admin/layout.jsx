import React from 'react'
import ClientAuth from './auth/ClientAuth'
import AdminIOSBootSplash from '../../components/AdminIOSBootSplash'

export const metadata = {
  title: 'Admin - La Guarida',
}

export default function AdminLayout({ children }){
  return (
    <div className="min-h-screen admin-root dark">
      <div className="admin-container mx-auto px-4 md:px-6 py-8 md:py-12">
        <ClientAuth>
          <AdminIOSBootSplash>
            <main className="space-y-8">{children}</main>
          </AdminIOSBootSplash>
        </ClientAuth>

        {/* footer removed as requested */}
      </div>
    </div>
  )
}
