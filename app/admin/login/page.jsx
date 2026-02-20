"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPhrase, setSelectedPhrase] = useState('')

  const motivationalPhrases = [
    'Cada día es una nueva oportunidad para mejorar.',
    'Confía en tu proceso y celebra los pequeños logros.',
    'La constancia vence a la intensidad.',
    'Hazlo con pasión o cámbialo por algo que te apasione.',
    'Los errores son lecciones disfrazadas.',
    'Avanzar, aunque sea despacio, es avanzar.',
    'Lo posible comienza con creer que puedes.',
    'Cree en tus ideas y trabaja por ellas cada día.',
    'El esfuerzo de hoy será la recompensa de mañana.',
    'Transforma obstáculos en oportunidades.',
    'Tu actitud define tu dirección.',
    'Si te caes, levántate con más fuerza.',
    'Pequeños pasos producen grandes cambios.',
    'La disciplina es el puente entre metas y logros.',
    'Enfocate en el progreso, no en la perfección.',
    'Tu trabajo de hoy construye tu futuro.',
    'Ponle corazón a lo que haces y se notará.',
    'La creatividad florece con constancia.',
    'Sé la versión valiente de vos mismo.',
    'Hoy es el día para empezar algo grande.'
  ]

  useEffect(() => {
    const i = Math.floor(Math.random() * motivationalPhrases.length)
    setSelectedPhrase(motivationalPhrases[i])
  }, [])

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
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 md:px-6">
      <div className="w-full max-w-6xl h-[80vh] bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left hero */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-black/55"></div>
          <div className="absolute inset-0 bg-[url('/images/hero-image-home-2.jpg')] bg-cover bg-center"></div>
          <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">{selectedPhrase}</h2>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-transparent">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 md:p-10 -mt-8 md:mt-0">
            <div className="flex flex-col items-start">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Bienvenido Leo !</h1>
              <p className="text-sm text-gray-600 mb-6">Ingresá con tus credenciales para acceder al panel de administración</p>
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
      </div>
    </div>
  )
}
