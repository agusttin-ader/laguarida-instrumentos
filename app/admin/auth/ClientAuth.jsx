"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase/client'

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
      try { subscription?.unsubscribe() } catch (e) {}
    }
  }, [])

  // Client-side route guard: redirect to /admin/login when unauthenticated
  const pathname = usePathname()
  const router = useRouter()

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
        } catch (e) {
          // ignore
        }

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
        } catch (e) {
          // ignore
        }

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
      try { await supabase.auth.signOut() } catch (e) {}
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
        <div className="flex items-center justify-end gap-4 mb-6 -mt-10 md:-mt-0 relative z-20">
          <div className="text-sm text-gray-600">
            {loading ? (
              <span className="text-gray-500">Comprobando sesión…</span>
            ) : user ? (
              <span className="text-gray-800">{user.email}</span>
            ) : (
              <Link href="/admin/login" className="text-indigo-600">Iniciar sesión</Link>
            )}
          </div>
          <div>
            {user && (
              <button onClick={signOut} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:shadow-sm">Cerrar sesión</button>
            )}
          </div>
        </div>

        {children}
      </div>
    </AdminAuthContext.Provider>
  )
}
