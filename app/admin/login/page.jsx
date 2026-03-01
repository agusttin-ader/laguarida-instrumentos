"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPhrase, setSelectedPhrase] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const quoteIndexRef = useRef(0)
  const [quoteVisible, setQuoteVisible] = useState(true)
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

  const quotes = [
    { q: 'Music is my religion.', a: 'Jimi Hendrix' },
    { q: 'Play with feeling, not with speed.', a: 'Eric Clapton' },
    { q: 'The beautiful thing about learning is nobody can take it away from you.', a: 'B.B. King' },
    { q: "It's all blues, man.", a: 'Stevie Ray Vaughan' },
    { q: 'There is always something new to learn.', a: 'Jimmy Page' },
    { q: "It's not what you play, it's the way you play it.", a: 'Keith Richards' },
    { q: 'The heart speaks through the guitar.', a: 'Carlos Santana' },
    { q: 'Tone is not just about gear.', a: 'Jeff Beck' },
    { q: 'Play from the gut.', a: 'Buddy Guy' },
    { q: 'Keep it honest.', a: 'Rory Gallagher' },
    { q: 'Let the note breathe.', a: 'Duane Allman' },
    { q: 'Dynamics make music sing.', a: 'John Mayer' },
    { q: 'Emotion first, technique second.', a: 'Slash' },
    { q: 'Less is often more.', a: 'Mark Knopfler' },
    { q: 'Make the melody speak.', a: 'David Gilmour' },
    { q: 'Tell a story with your playing.', a: 'Joe Bonamassa' },
    { q: "Feel the song, don't show off.", a: 'Gary Moore' },
    { q: 'Simplicity is a weapon.', a: 'Tony Iommi' },
    { q: 'Listen more than you play.', a: 'Peter Green' },
    { q: 'The blues is the root of everything.', a: 'Muddy Waters' },
    { q: 'Let the silence speak.', a: 'Eric Johnson' },
    { q: 'Bend with intention.', a: 'Joe Satriani' },
    { q: 'Find the pocket.', a: 'Steve Vai' },
    { q: 'Make every note count.', a: 'John Frusciante' },
    { q: 'Tone follows touch.', a: 'Tom Morello' },
    { q: 'Play what the song needs.', a: 'Prince' },
    { q: 'Phrasing is more important than speed.', a: 'George Harrison' },
    { q: 'Listen, then react.', a: 'Neil Young' },
    { q: 'A good riff tells a story.', a: 'Angus Young' },
    { q: 'Groove is king.', a: 'Derek Trucks' },
    { q: 'Keep the melody honest.', a: 'Warren Haynes' },
    { q: 'Find the space between notes.', a: 'Peter Frampton' },
    { q: 'Play less, say more.', a: 'Kenny Burrell' },
    { q: 'Dynamics are your friend.', a: 'Stephen Stills' },
    { q: 'Chords can sing too.', a: 'Ry Cooder' },
    { q: 'Use your ears first.', a: 'Nuno Bettencourt' },
    { q: 'Practice with purpose.', a: 'Vernon Reid' },
    { q: 'Stay true to the song.', a: 'St. Vincent' },
    { q: 'Make it feel human.', a: 'Albert King' },
    { q: 'Let the music tell the truth.', a: 'John Fogerty' }
  ]

  useEffect(() => {
    // Pick a random quote and background when entering the page.
    // No time-based rotation.
    const start = Math.floor(Math.random() * quotes.length)
    quoteIndexRef.current = start
    setSelectedPhrase(quotes[start].q)
    setSelectedAuthor(quotes[start].a)
    setQuoteVisible(true)

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
        // keep default fallback
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
    <div className="relative h-full min-h-0 flex items-center justify-center bg-transparent px-4 md:px-6">
      {/* Mobile: imagen a pantalla completa con header/footer difuminados */}
      <div
        className="absolute inset-0 z-0 md:rounded-2xl md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl md:h-[72vh] md:inset-auto"
        style={{
          backgroundImage: `url('${bgUrl(bgImage)}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-0 bg-black/50 pointer-events-none md:rounded-2xl md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl md:h-[72vh] md:inset-auto" aria-hidden />
      {/* Sombreado difuminado header (mobile) */}
      <div
        className="absolute top-0 left-0 right-0 h-28 z-[1] pointer-events-none md:hidden bg-gradient-to-b from-black/75 via-black/40 to-transparent"
        aria-hidden
      />
      {/* Sombreado difuminado footer (mobile) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-[1] pointer-events-none md:hidden bg-gradient-to-t from-black/75 via-black/40 to-transparent"
        aria-hidden
      />

      {/* Desktop: contenedor tipo card; mobile: contenido centrado sobre el fondo */}
      <div className="relative z-10 w-full max-w-5xl md:grid md:grid-cols-2 md:h-[72vh] md:overflow-hidden md:rounded-2xl">
        {/* Left hero (solo desktop) */}
        <div className="relative hidden md:block">
          <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
            <h2 className={`text-3xl lg:text-4xl font-bold leading-tight mb-2 transition-all duration-700 ${quoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              {selectedPhrase}
            </h2>
            {selectedAuthor && (
              <div className={`text-sm text-white/80 mt-2 italic transition-opacity duration-700 ${quoteVisible ? 'opacity-100' : 'opacity-0'}`}>— {selectedAuthor}</div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center pt-0 pb-4 sm:pt-0 sm:p-8 md:p-12 relative z-10 min-h-0 md:min-h-0">
          <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 md:p-10" style={{
            background: 'rgba(255,255,255,0.06)',
            WebkitBackdropFilter: 'blur(14px) saturate(120%)',
            backdropFilter: 'blur(14px) saturate(120%)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div className="flex flex-col items-start">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Bienvenido Leo !</h1>
              <p className="text-sm text-white/95">Gracias por la confianza</p>
              <p className="text-sm text-white/90 mb-6">Ingresá con tus credenciales para acceder al panel de administración</p>
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 bg-white"
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 bg-white"
                />
              </div>

              {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded">{error}</div>}

              <div>
                <button
                  type="submit"
                  className="w-full bg-white text-black px-4 py-3 rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  disabled={loading}
                >
                  {loading ? 'Ingresando…' : 'Ingresar'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile: solo texto de la frase, sin panel, transición suave */}
        <div className="md:hidden relative z-10 w-full px-4 pt-4 pb-4">
          <div className="text-center">
            <p className={`text-lg font-semibold leading-snug text-white mb-1 transition-opacity duration-500 ease-out ${quoteVisible ? 'opacity-100' : 'opacity-0'}`}>
              &quot;{selectedPhrase}&quot;
            </p>
            {selectedAuthor && (
              <p className={`text-sm text-white/70 italic transition-opacity duration-500 ease-out ${quoteVisible ? 'opacity-100' : 'opacity-0'}`}>
                — {selectedAuthor}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
