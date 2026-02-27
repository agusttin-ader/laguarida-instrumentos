import React from 'react'
import AdminServiceWorkerRegister from '../../components/AdminServiceWorkerRegister'
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
        <link rel="apple-touch-icon" href="/images/logo/logo-fondo-oscuro.PNG" />
      </head>
      <body className={`${styles.adminBody} dark`}>
        <div className={styles.appShell}>
          <header className={styles.header}>
            <div className={styles.logo}>La Guarida</div>
          </header>
          <main className={styles.main}>{children}</main>
        </div>
        <AdminServiceWorkerRegister />
      </body>
    </html>
  )
}
