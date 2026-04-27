"use client"

import React, { useEffect, useState } from 'react'

export default function AdminAppShellWrapper({ children }) {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (typeof window.navigator !== 'undefined' && window.navigator.standalone === true) ||
      document.referrer.includes('android-app://')
    setIsStandalone(standalone)
  }, [])

  if (!isStandalone) return <>{children}</>

  return (
    <div className="admin-app-shell mx-auto w-full max-w-[640px] md:max-w-[720px] min-h-[100dvh] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(2,6,23,0.5)] bg-gradient-to-b from-white/[0.02] to-white/[0.01]">
      {children}
    </div>
  )
}
