import React from 'react'
import AdminServiceWorkerRegister from '../../components/AdminServiceWorkerRegister'
import ClientAuth from './auth/ClientAuth'
import AdminIOSBootSplash from '../../components/AdminIOSBootSplash'
import styles from '../../components/admin.module.css'

export const metadata = {
  title: 'La Guarida — Admin',
  description: 'Panel de administración (versión app)',
  manifest: '/manifest-admin.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0b1220',
}

export default function AdminLayout({ children }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            'window.__adminHideSplash=function(){var e=document.getElementById("admin-boot-splash");if(e){e.classList.add("admin-boot-splash-fade");e.setAttribute("aria-hidden","true");setTimeout(function(){e.remove();},200);}};',
        }}
      />
      <div id="admin-boot-splash" className="admin-boot-splash-visible" aria-hidden="false">
        <div className="admin-splash-inner">
          <div className="admin-splash-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/og-pick-icon.PNG" alt="" width={96} height={96} fetchPriority="high" />
          </div>
          <p className="admin-splash-label">La Guarida Admin</p>
        </div>
      </div>
      <div className={`${styles.adminBody} admin-root dark min-h-screen`}>
        <div className={`${styles.appShell} admin-app-shell min-h-screen flex flex-col`}>
          <ClientAuth>
            <AdminIOSBootSplash>
              {/* SiteShell ya envuelve /admin en <main>; evitar <main> anidado */}
              <div className="flex flex-1 flex-col px-4 pt-3 pb-6">{children}</div>
            </AdminIOSBootSplash>
          </ClientAuth>
        </div>
        <AdminServiceWorkerRegister />
      </div>
    </>
  )
}
