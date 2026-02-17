"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || 'Sign in failed')
        setLoading(false)
        return
      }

      // Server sets HttpOnly session cookie; navigate to admin and let the
      // client auth provider verify the server-side session via /api/auth/me.
      router.push('/admin')
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6efe6] px-4 md:px-6">
      <div className="w-full max-w-md p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center">
          <img src="/images/logo/logo-fondo-claro.PNG" alt="La Guarida" loading="eager" style={{height: 'auto', width: 'auto'}} className="w-24 md:w-32 h-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Panel de Administración</h1>
          <p className="text-sm text-gray-600 mb-4">Accedé con tus credenciales para administrar el catálogo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2"
            />
          </div>

          {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded">{error}</div>}

          <div>
            <button
              type="submit"
              className="w-full bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
              disabled={loading}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
