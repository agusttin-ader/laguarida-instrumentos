import React from 'react'
import AdminServiceWorkerRegister from '../../components/AdminServiceWorkerRegister'
import ClientAuth from './auth/ClientAuth'
import AdminIOSBootSplash from '../../components/AdminIOSBootSplash'
import styles from '../../components/admin.module.css'

export const metadata = {
  title: 'La Guarida — Admin',
  description: 'Panel de administración (versión app)'
}

export default function AdminLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest-admin.json" />
        <meta name="theme-color" content="#0b1220" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/images/logo/og-pick-icon.PNG" />
      </head>
      <body className={`${styles.adminBody} dark`}>
        <div className={`${styles.appShell} admin-app-shell min-h-screen flex flex-col`}>
          <ClientAuth>
            <AdminIOSBootSplash>
              <main className="flex-1 flex flex-col px-4 pt-3 pb-6">{children}</main>
            </AdminIOSBootSplash>
          </ClientAuth>
        </div>
        <AdminServiceWorkerRegister />
      </body>
    </html>
  )
}
