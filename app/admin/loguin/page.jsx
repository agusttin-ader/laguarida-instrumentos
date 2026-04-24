"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoguinRedirect(){
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          const j = await res.json()
          if (j?.authenticated) {
            router.replace('/admin/productos/catalogo')
            return
          }
        }
      } catch {
        // ignore
      }
      // not authenticated -> go to proper login page
      router.replace('/admin/login')
    })()

    return () => { mounted = false }
  }, [router])

  return null
}
