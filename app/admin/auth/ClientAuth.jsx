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
      // session restoration. If a session exists, trust it and wait for the
      // onAuthStateChange listener to populate `user`.
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
      await supabase.auth.signOut()
      // clear local state and redirect to login
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
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div>
            {loading ? (
              <span style={{color:'#666'}}>Checking auth…</span>
            ) : user ? (
              <span style={{color:'#333'}}>Signed in as {user.email}</span>
            ) : (
              <Link href="/admin/login">Sign in</Link>
            )}
          </div>
          <div>
            {user && (
              <button onClick={signOut} style={{padding:'6px 10px'}}>Sign out</button>
            )}
          </div>
        </div>

        {children}
      </div>
    </AdminAuthContext.Provider>
  )
}
