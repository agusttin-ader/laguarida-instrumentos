"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase/client'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

const AdminAuthContext = createContext(null)

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

export default function ClientAuth({ children }){
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  // Client-side route guard: redirect to /admin/login when unauthenticated
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPath = typeof pathname === 'string' && (pathname === '/admin/login' || pathname === '/admin/login/')

  // En login: quitar fondo gris para que solo se vea la imagen de fondo del body
  useEffect(() => {
    if (!isLoginPath) return
    document.body.classList.add('admin-login-page')
    return () => document.body.classList.remove('admin-login-page')
  }, [isLoginPath])

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

  async function signOut() {
    try {
      // call server endpoint to clear HttpOnly cookies and sign out server-side
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' })
      // also call client SDK signOut to clear any client state
      try { await supabase.auth.signOut() } catch { /* empty */ }
      setSession(null)
      setUser(null)
      router.push('/admin/login')
    } catch (err) {
      console.warn('Sign out error', err)
    }
  }

  const value = { user, session, loading, signOut }

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
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-end gap-3 mt-2 md:mt-0 relative z-30 admin-auth-bar px-4 py-4 mb-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_16px_36px_rgba(0,0,0,0.22)]"
              style={{ backgroundColor: 'transparent' }}
            >
              <div className="text-sm text-white/75 w-full sm:w-auto">
                  {loading ? (
                    <span className="text-white/55">Comprobando sesión…</span>
                  ) : user ? (
                    <span className="text-white/90 break-all">{user.email}</span>
                  ) : null}
              </div>
              {user && (
                <button onClick={signOut} className="admin-premium-btn-danger px-3 py-2 w-full sm:w-auto no-custom-btn">Cerrar sesión</button>
              )}
            </div>
            {children}
          </>
        )}
      </div>
    </AdminAuthContext.Provider>
  )
}
