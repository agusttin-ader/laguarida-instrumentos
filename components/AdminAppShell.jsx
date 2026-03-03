"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import styles from './admin.module.css'

/** En login no mostramos header para que coincida con desktop (logo solo en el contenido). */
export default function AdminAppShell({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login' || pathname === '/admin/loguin'

  return (
    <div className={styles.appShell}>
      {!isLogin && (
        <header className={styles.header}>
          <div className={styles.logo}>La Guarida</div>
        </header>
      )}
      <main className={styles.main}>{children}</main>
    </div>
  )
}
