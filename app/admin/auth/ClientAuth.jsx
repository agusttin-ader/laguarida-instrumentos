"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase/client'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useToast } from '../../../components/ToastContext'
import { hapticLight } from '../../../lib/haptics'

const AdminAuthContext = createContext(null)

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

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

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data?.session ?? null)
        setUser(data?.session?.user ?? null)
      } catch (err) {
        console.warn('Error getting session', err)
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

    // if already signed in and on login page, redirect to /admin
    if (user && isLogin) {
      router.push('/admin')
    }
  }, [loading, user, pathname, router])

  function openLogoutConfirm() {
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
    } catch (err) {
      console.warn('Sign out error', err)
      toast('Error al cerrar sesión', 'error')
    }
  }

  const value = { user, session, loading, signOut: openLogoutConfirm }

  return (
    <AdminAuthContext.Provider value={value}>
      <div>
        {isLoginPath ? (
          <div className="fixed inset-0 z-20 flex flex-col overflow-y-auto">
            <div className="flex-shrink-0">
              <Header />
            </div>
            <div className="flex-1">
              {children}
            </div>
            <div className="flex-shrink-0">
              <Footer />
            </div>
          </div>
        ) : (
          <>
            <div className="relative z-30">
              <Header />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-end gap-3 mt-2 md:mt-0 relative z-30 admin-auth-bar px-4 py-4 mb-6 rounded-2xl">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {online === true || online === false ? (
                  <span className="flex items-center gap-1.5 text-xs text-white/60" title={online ? 'Conectado' : 'Sin conexión'}>
                    <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden />
                    {online ? 'En línea' : 'Sin conexión'}
                  </span>
                ) : null}
                <span className="text-sm text-white/75 truncate flex-1 min-w-0">
                  {loading ? (
                    <span className="text-white/55">Comprobando sesión…</span>
                  ) : user ? (
                    <span className="text-white/90 break-all">{user.email}</span>
                  ) : null}
                </span>
              </div>
              {user && (
                <button onClick={openLogoutConfirm} className="admin-premium-btn-danger px-3 py-2 w-full sm:w-auto no-custom-btn">Cerrar sesión</button>
              )}
            </div>

            {showLogoutConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 modal-backdrop-enter backdrop-blur-sm cursor-default"
                  style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
                  onClick={() => setShowLogoutConfirm(false)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowLogoutConfirm(false)}
                  role="button"
                  tabIndex={-1}
                  aria-label="Cerrar"
                />
                <div
                  className="relative admin-premium-card w-full max-w-sm p-6 modal-panel-enter shadow-2xl"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="logout-dialog-title"
                >
                  <h2 id="logout-dialog-title" className="text-lg font-semibold text-white mb-1">
                    ¿Cerrar sesión?
                  </h2>
                  <p className="text-sm text-white/70 mb-6">
                    Vas a salir del panel de administración.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="admin-premium-btn-ghost px-4 py-2.5 no-custom-btn rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={doSignOut}
                      className="admin-premium-btn-danger px-4 py-2.5 no-custom-btn rounded-xl"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {children}
          </>
        )}
      </div>
    </AdminAuthContext.Provider>
  )
}
