"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LOGIN_BG_QUOTES = [
  { q: 'La música es mi religión.', a: 'Jimi Hendrix' },
  { q: 'El blues es la raíz de todo.', a: 'Muddy Waters' },
  { q: 'Menos notas, más historia.', a: 'B.B. King' },
  { q: 'El fraseo importa más que la velocidad.', a: 'David Gilmour' },
  { q: 'Tocá lo que la canción necesita.', a: 'Keith Richards' },
  { q: 'El groove manda.', a: 'Derek Trucks' },
  { q: 'Primero emoción, después técnica.', a: 'Stevie Ray Vaughan' },
  { q: 'Escuchá más de lo que tocás.', a: 'Neil Young' }
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPhrase, setSelectedPhrase] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [bgImage, setBgImage] = useState('admin-1.jpeg')

  function bgUrl(fileName) {
    return `/images/admin-fondo/${encodeURIComponent(String(fileName || '').trim())}`
  }

  async function pickFirstRenderableBackground(images = []) {
    if (!Array.isArray(images) || images.length === 0) return null
    const shuffled = [...images].sort(() => Math.random() - 0.5)
    for (const name of shuffled) {
      const url = bgUrl(name)
      const ok = await new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve(false)
        const img = new window.Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
      })
      if (ok) return name
    }
    return shuffled[0] || null
  }

  useEffect(() => {
    const start = Math.floor(Math.random() * LOGIN_BG_QUOTES.length)
    setSelectedPhrase(LOGIN_BG_QUOTES[start].q)
    setSelectedAuthor(LOGIN_BG_QUOTES[start].a)

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin-backgrounds', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const images = Array.isArray(json?.images) ? json.images : []
        if (!images.length || cancelled) return
        const picked = await pickFirstRenderableBackground(images)
        if (picked) setBgImage(picked)
      } catch {
        /* fondo por defecto */
      }
    })()

    return () => { cancelled = true }
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
        setError(json?.error || 'No se pudo iniciar sesión')
        setLoading(false)
        return
      }

      router.push('/admin/productos/catalogo')
    } catch (err) {
      setError(err?.message || 'Error inesperado. Probá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-full flex flex-col">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('${bgUrl(bgImage)}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 28%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0.82) 100%)'
        }}
        aria-hidden
      />

      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-4 py-6">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg" aria-label="Ir al inicio - La Guarida">
            <img
              src="/images/optimized/logo-fondo-oscuro.webp"
              alt="La Guarida"
              width={240}
              height={160}
              decoding="async"
              fetchPriority="high"
              className="w-40 sm:w-48 h-auto object-contain"
            />
          </Link>
        </div>
        <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl" style={{
          background: 'rgba(15,18,28,0.94)',
          border: '1px solid rgba(255,255,255,0.14)'
        }}>
          <div className="flex flex-col items-start mb-5">
            <h1 className="text-[1.8rem] md:text-3xl leading-[1.05] font-extrabold text-white mb-1">Bienvenido Leo !</h1>
            <p className="text-sm text-white/95">Gracias por la confianza</p>
            <p className="text-sm text-white/90">Ingresá con tus credenciales para acceder al panel de administración</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium mb-1 text-white/88">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full border border-white/18 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/35 bg-black/35"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white/88">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full border border-white/18 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/35 bg-black/35"
              />
            </div>

            {error && <div className="text-sm text-rose-200 bg-rose-500/15 border border-rose-300/20 p-3 rounded-xl">{error}</div>}

            <div>
              <button
                type="submit"
                className="w-full bg-white text-black px-4 py-3 rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                disabled={loading}
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </div>
          </form>

          {selectedPhrase && (
            <p className="mt-6 text-center text-sm text-white/70 italic">
              &quot;{selectedPhrase}&quot; — {selectedAuthor}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
