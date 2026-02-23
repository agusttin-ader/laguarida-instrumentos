"use client"

import React, { useEffect, useRef, useState } from 'react'
import ImageWithSkeleton from './ImageWithSkeleton'

export default function GalleryLightbox({ src, alt = 'imagen', onClose = () => {}, onPrev = () => {}, onNext = () => {} }){
  const overlayRef = useRef(null)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)
  const [dims, setDims] = useState({ w: 800, h: 600 })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e){ if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') onPrev(); if (e.key === 'ArrowRight') onNext() }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose, onPrev, onNext])

  // compute display dimensions so image fills height and width respects aspect ratio
  useEffect(() => {
    if (typeof window === 'undefined') return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const naturalW = img.naturalWidth || img.width || 1600
      const naturalH = img.naturalHeight || img.height || 1200
      const availH = window.innerHeight
      const maxW = Math.floor(window.innerWidth * 0.9)
      const targetW = Math.min(maxW, Math.round((naturalW / naturalH) * availH))
      setDims({ w: targetW, h: availH })
    }
    img.onerror = () => {
      setDims({ w: Math.floor(window.innerWidth * 0.8), h: window.innerHeight })
    }
    img.src = src
  }, [src])

  function handleOverlayClick(e){ if (e.target === overlayRef.current) onClose() }

  function onTouchStart(e){ if (!e || !e.touches) return; touchStartX.current = e.touches[0].clientX; touchDelta.current = 0 }
  function onTouchMove(e){ if (!touchStartX.current || !e || !e.touches) return; touchDelta.current = e.touches[0].clientX - touchStartX.current }
  function onTouchEnd(){ const threshold = 40; if (touchDelta.current > threshold) onPrev(); else if (touchDelta.current < -threshold) onNext(); touchStartX.current = null; touchDelta.current = 0 }

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Close */}
      <button aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); onClose() }} className="absolute top-6 right-6 z-50 p-3 rounded-full bg-black/50 text-white border border-white/10 shadow-sm no-custom-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* Left arrow */}
      <button aria-label="Anterior" onClick={(e) => { e.stopPropagation(); onPrev() }} className="absolute left-4 z-40 h-12 w-12 flex items-center justify-center rounded-full bg-black/50 text-white border border-white/10 shadow-lg no-custom-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* Image container: full height, auto width (object-contain) */}
      <div className="flex items-center justify-center h-screen">
        <div className="relative flex items-center justify-center" style={{ height: '100vh' }}>
          <div style={{ width: `${dims.w}px`, height: `${dims.h}px`, maxWidth: '90vw' }} className="relative">
            <ImageWithSkeleton
              key={src}
              src={src}
              alt={alt}
              width={dims.w}
              height={dims.h}
              quality={90}
              priority={true}
              className="object-contain"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      {/* Right arrow */}
      <button aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); onNext() }} className="absolute right-4 z-40 h-12 w-12 flex items-center justify-center rounded-full bg-black/50 text-white border border-white/10 shadow-lg no-custom-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  )
}
