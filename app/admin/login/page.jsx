"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
    const start = Math.floor(Math.random() * quotes.length)
    setSelectedPhrase(quotes[start].q)
    setSelectedAuthor(quotes[start].a)

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
    <div className="relative min-h-full flex flex-col">
      {/* Imagen de fondo a pantalla completa (fixed = ocupa todo el viewport, detrás de header/footer) */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('${bgUrl(bgImage)}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        aria-hidden
      />
      {/* Degradado: negro arriba y abajo, más luz en el centro */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 28%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0.82) 100%)'
        }}
        aria-hidden
      />

      {/* Contenido centrado en viewport: card de login */}
      <div className="fixed inset-0 z-10 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl" style={{
          background: 'rgba(15,18,28,0.52)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          backdropFilter: 'blur(12px) saturate(120%)',
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
