import React from 'react'
import AdminServiceWorkerRegister from '../../components/AdminServiceWorkerRegister'
import ClientAuth from './auth/ClientAuth'
import AdminIOSBootSplash from '../../components/AdminIOSBootSplash'
import styles from '../../components/admin.module.css'

export const metadata = {
  title: 'La Guarida — Admin',
  description: 'Panel de administración (versión app)'
}

const bootSplashStyles = `
#admin-boot-splash{position:fixed;inset:0;z-index:9999;background:#06080e;}
#admin-boot-splash::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(212,164,59,0.1) 0%,rgba(9,12,19,0.94) 46%,#06080e 100%);}
#admin-boot-splash .admin-splash-inner{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:14px;z-index:1;}
#admin-boot-splash .admin-splash-logo{width:96px;height:96px;border-radius:26px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.025);box-shadow:0 28px 70px rgba(0,0,0,0.58);display:flex;align-items:center;justify-content:center;padding:15px;box-sizing:border-box;}
#admin-boot-splash .admin-splash-logo img{width:100%;height:100%;object-fit:contain;}
#admin-boot-splash .admin-splash-label{font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.72);}
#admin-boot-splash.admin-boot-splash-fade{opacity:0;transition:opacity 0.4s ease-out;}
`

export default function AdminLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest-admin.json" />
        <meta name="theme-color" content="#0b1220" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/images/logo/og-pick-icon.PNG" />
        <style dangerouslySetInnerHTML={{ __html: bootSplashStyles }} />
      </head>
      <body className={`${styles.adminBody} dark`}>
        <div id="admin-boot-splash" className="admin-boot-splash-visible" aria-hidden="false">
          <div className="admin-splash-inner">
            <div className="admin-splash-logo">
              <img src="/images/logo/og-pick-icon.PNG" alt="" width="96" height="96" fetchPriority="high" />
            </div>
            <p className="admin-splash-label">La Guarida Admin</p>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__adminHideSplash=function(){var e=document.getElementById("admin-boot-splash");if(e){e.classList.add("admin-boot-splash-fade");e.setAttribute("aria-hidden","true");setTimeout(function(){e.remove();},420);}};`
          }}
        />
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
