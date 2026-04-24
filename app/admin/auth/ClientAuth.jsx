"use client"
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase/client'
import AdminDeskShell from '../../../components/admin/AdminDeskShell'
import { useToast } from '../../../components/ToastContext'
import { hapticLight } from '../../../lib/haptics'

const AdminAuthContext = createContext(null)

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

const ADMIN_SPLASH_MIN_MS = 350

export default function ClientAuth({ children }){
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const isLoginPath = typeof pathname === 'string' && (pathname === '/admin/login' || pathname === '/admin/login/')
  const mountTimeRef = useRef(null)
  const splashHiddenRef = useRef(false)

  useEffect(() => {
    mountTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (loading || splashHiddenRef.current || typeof window === 'undefined') return
    const hide = window.__adminHideSplash
    if (typeof hide !== 'function') return
    const elapsed = Date.now() - (mountTimeRef.current || Date.now())
    const delay = Math.max(0, ADMIN_SPLASH_MIN_MS - elapsed)
    const t = setTimeout(() => {
      splashHiddenRef.current = true
      hide()
    }, delay)
    return () => clearTimeout(t)
  }, [loading])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data?.session ?? null)
        setUser(data?.session?.user ?? null)
      } catch {
        // Session init error; state remains null
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((event, payload) => {
      if (!mounted) return
      setSession(payload?.session ?? null)
      setUser(payload?.session?.user ?? null)
    })

    return () => {
      mounted = false
      try { subscription?.unsubscribe() } catch { /* empty */ }
    }
  }, [])

  // Mantener sesión viva: refrescar token cada 50 min (solo se cierra con "Cerrar sesión")
  useEffect(() => {
    if (!user || isLoginPath) return
    const REFRESH_MS = 50 * 60 * 1000
    const id = setInterval(() => {
      fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' }).catch(() => {})
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [user, isLoginPath])

  // En login: quitar fondo gris para que solo se vea la imagen de fondo del body
  useEffect(() => {
    if (!isLoginPath) return
    document.body.classList.add('admin-login-page')
    return () => document.body.classList.remove('admin-login-page')
  }, [isLoginPath])

  useEffect(() => {
    if (!showLogoutConfirm) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setShowLogoutConfirm(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showLogoutConfirm])

  useEffect(() => {
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    // only run on client after initial loading
    if (loading) return

    // allow the login page
    const isLogin = pathname === '/admin/login' || pathname === '/admin/login/'

    if (!user && !isLogin) {
      // Double-check session in case of a short race between sign-in and
      // session restoration. First try client-side session, then fall back
      // to a server-side check (`/api/auth/me`) which will inspect the
      // HttpOnly cookie set by the server.
      (async () => {
        try {
          const { data } = await supabase.auth.getSession()
          const sessionNow = data?.session ?? null
          if (sessionNow) {
            setSession(sessionNow)
            setUser(sessionNow.user ?? null)
            return
          }
        } catch { /* empty */ }

        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' })
          if (res.ok) {
            const j = await res.json()
            if (j?.authenticated) {
              // populate user from server response (no tokens returned)
              setUser({ id: j.user?.id, email: j.user?.email || null })
              setSession(null)
              return
            }
          }
        } catch { /* empty */ }

        router.push('/admin/login')
      })()
    }

    // if already signed in and on login page, redirect to catálogo
    if (user && isLogin) {
      router.push('/admin/productos/catalogo')
    }
  }, [loading, user, pathname, router])

  function openLogoutConfirm() {
    hapticLight()
    setShowLogoutConfirm(true)
  }

  async function doSignOut() {
    setShowLogoutConfirm(false)
    hapticLight()
    try {
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' })
      try { await supabase.auth.signOut() } catch { /* empty */ }
      setSession(null)
      setUser(null)
      toast('Sesión cerrada', 'success')
      router.push('/admin/login')
    } catch {
      toast('Error al cerrar sesión', 'error')
    }
  }

  const value = { user, session, loading, signOut: openLogoutConfirm }

  return (
    <AdminAuthContext.Provider value={value}>
      <div>
        {isLoginPath ? (
          /* Sin header ni footer en login: imagen de fondo a pantalla completa y un solo logo (el del contenido) */
          <div className="fixed inset-0 z-20 flex flex-col overflow-y-auto">
            <div className="flex-1 min-h-0">
              {children}
            </div>
          </div>
        ) : (
          <AdminDeskShell
            user={user}
            loading={loading}
            online={online}
            onLogout={openLogoutConfirm}
          >
            {showLogoutConfirm ? (
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 cursor-default bg-slate-900/45"
                  onClick={() => setShowLogoutConfirm(false)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowLogoutConfirm(false)}
                  role="button"
                  tabIndex={-1}
                  aria-label="Cerrar"
                />
                <div
                  className="relative admin-desk-card w-full max-w-sm p-6 shadow-2xl"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="logout-dialog-title"
                >
                  <h2 id="logout-dialog-title" className="text-lg font-semibold text-slate-50 mb-1">
                    ¿Cerrar sesión?
                  </h2>
                  <p className="text-sm text-slate-300 mb-6">
                    Vas a salir del panel de administración.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="admin-desk-btn-ghost px-4 py-2.5 no-custom-btn"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={doSignOut}
                      className="admin-desk-btn-danger px-4 py-2.5 no-custom-btn"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="mx-auto w-full max-w-5xl space-y-6 animate-pulse md:space-y-8">
                <div className="admin-desk-card px-5 py-8 md:px-10 md:py-10">
                  <div className="h-4 w-28 rounded-lg bg-white/12" />
                  <div className="mt-4 h-7 w-4/5 max-w-md rounded-lg bg-white/12" />
                  <div className="mt-3 h-4 w-full max-w-xl rounded-lg bg-white/8" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="admin-desk-card flex items-center gap-3 p-6">
                      <div className="h-12 w-12 rounded-xl bg-white/12" />
                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-24 rounded-lg bg-white/12" />
                        <div className="mt-2 h-3 w-16 rounded bg-white/8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              children
            )}
          </AdminDeskShell>
        )}
      </div>
    </AdminAuthContext.Provider>
  )
}
