import React from 'react'
import AdminServiceWorkerRegister from '../../components/AdminServiceWorkerRegister'
import ClientAuth from './auth/ClientAuth'
import AdminIOSBootSplash from '../../components/AdminIOSBootSplash'
import RegisterAdminHideSplash from '../../components/admin/RegisterAdminHideSplash'
import styles from '../../components/admin.module.css'

export const metadata = {
  title: 'La Guarida — Admin',
  description: 'Panel de administración (versión app)',
  manifest: '/manifest-admin.json',
  robots: { index: false, follow: false },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f1219',
}

export default function AdminLayout({ children }) {
  return (
    <>
      <RegisterAdminHideSplash />
      <div id="admin-boot-splash" className="admin-boot-splash-visible" aria-hidden="false">
        <div className="admin-splash-inner">
          <div className="admin-splash-logo">
            <img src="/images/logo/og-pick-icon.PNG" alt="" width={96} height={96} fetchPriority="high" />
          </div>
          <p className="admin-splash-label">La Guarida Admin</p>
        </div>
      </div>
      <div className={`${styles.adminBody} admin-root min-h-screen`}>
        <div className={`${styles.appShell} admin-app-shell min-h-screen flex flex-col`}>
          <ClientAuth>
            <AdminIOSBootSplash>
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </AdminIOSBootSplash>
          </ClientAuth>
        </div>
        <AdminServiceWorkerRegister />
      </div>
    </>
  )
}
