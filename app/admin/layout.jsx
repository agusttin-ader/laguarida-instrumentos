import React from 'react'
import ClientAuth from './auth/ClientAuth'
import AdminIOSBootSplash from '../../components/AdminIOSBootSplash'
import AdminAppShellWrapper from '../../components/AdminAppShellWrapper'

export const metadata = {
  title: 'Admin - La Guarida',
}

export default function AdminLayout({ children }){
  return (
    <div className="min-h-screen admin-root dark flex flex-col">
      <AdminAppShellWrapper>
        <div className="admin-container flex-1 flex flex-col mx-auto w-full max-w-[1100px] px-4 md:px-6 pt-3 pb-6 md:pt-4 md:pb-8">
          <ClientAuth>
            <AdminIOSBootSplash>
              <main className="flex-1 flex flex-col">{children}</main>
            </AdminIOSBootSplash>
          </ClientAuth>
        </div>
      </AdminAppShellWrapper>
    </div>
  )
}
