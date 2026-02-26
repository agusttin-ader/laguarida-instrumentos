"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPhrase, setSelectedPhrase] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [bgImage, setBgImage] = useState('admin-1.jpeg')

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
    // pick a random starting quote and background image
    const start = Math.floor(Math.random() * quotes.length)
    setQuoteIndex(start)
    setSelectedPhrase(quotes[start].q)
    setSelectedAuthor(quotes[start].a)
    const imgs = ['admin-1.jpeg','admin-2.jpeg','admin-3.jpeg','admin-4.jpeg']
    setBgImage(imgs[Math.floor(Math.random() * imgs.length)])

    let fadeTimeout = null
    // rotate quotes every 30s with a fade-out / fade-in
    const iv = setInterval(() => {
      setQuoteVisible(false)
      // after fade-out, update text then fade-in
      fadeTimeout = setTimeout(() => {
        setQuoteIndex((idx) => {
          const next = (idx + 1) % quotes.length
          setSelectedPhrase(quotes[next].q)
          setSelectedAuthor(quotes[next].a)
          return next
        })
        setQuoteVisible(true)
      }, 600)
    }, 30000)

    return () => {
      clearInterval(iv)
      if (fadeTimeout) clearTimeout(fadeTimeout)
    }
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
      <div
        className="w-full max-w-6xl h-[80vh] overflow-hidden grid grid-cols-1 md:grid-cols-2 relative"
        style={{
          backgroundImage: `url('/images/admin-fondo/${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: 'none',
          boxShadow: 'none',
          borderRadius: '1rem'
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none" />
        {/* Left hero */}
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

        {/* Right form */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-transparent relative overflow-hidden z-10">
          {/* translucent blurred panel */}
          <div className="w-full max-w-md rounded-2xl p-8 md:p-10 -mt-8 md:mt-0" style={{
            background: 'rgba(255,255,255,0.06)',
            WebkitBackdropFilter: 'blur(14px) saturate(120%)',
            backdropFilter: 'blur(14px) saturate(120%)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div className="flex flex-col items-start">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Bienvenido Leo !</h1>
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
      </div>
    </div>
  )
}
