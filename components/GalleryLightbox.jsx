"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ImageWithSkeleton from './ImageWithSkeleton'

export default function GalleryLightbox({
  src,
  alt = 'imagen',
  currentIndex = 0,
  total = 0,
  onClose = () => {},
  onPrev = () => {},
  onNext = () => {}
}){
  const overlayRef = useRef(null)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)
  const [dims, setDims] = useState({ w: 800, h: 600 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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

  if (!mounted || typeof document === 'undefined') return null

  const safeAlt = String(alt || '').replace(/\s+—\s+imagen\s+\d+$/i, '')

  return createPortal((
    <div ref={overlayRef} onClick={handleOverlayClick} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06070b]/92 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/45" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#18213a]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/65 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-1/3 h-56 w-56 rounded-full bg-[#d4a43b]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-52 w-52 rounded-full bg-[#7387c7]/12 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[42vw] max-w-[420px] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-white/75 backdrop-blur-sm">
        Galeria
      </div>

      {/* Close */}
      <button aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); onClose() }} className="absolute top-4 right-4 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.35)] no-custom-btn transition-all duration-200 hover:scale-105">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* Left arrow */}
      <button aria-label="Anterior" onClick={(e) => { e.stopPropagation(); onPrev() }} className="absolute left-[max(10px,2.5vw)] md:left-[max(16px,4vw)] z-40 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/14 hover:bg-white/24 text-white border border-white/25 shadow-[0_10px_28px_rgba(0,0,0,0.35)] no-custom-btn transition-all duration-200 hover:scale-105">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* Image container: full height, auto width (object-contain) */}
      <div className="relative z-10 flex items-center justify-center h-screen w-full px-10 sm:px-14 md:px-20">
        <div className="relative flex items-center justify-center" style={{ height: '100vh' }}>
          <div style={{ width: `${dims.w}px`, height: `${dims.h}px`, maxWidth: '90vw', maxHeight: '86vh' }} className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#0f1424]/55 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-white/10" />
            <div className="absolute left-3 top-3 h-[2px] w-12 bg-gradient-to-r from-[#d4a43b]/80 to-transparent pointer-events-none" />
            <div className="absolute right-3 bottom-3 h-[2px] w-12 bg-gradient-to-l from-[#d4a43b]/80 to-transparent pointer-events-none" />
            <ImageWithSkeleton
              key={src}
              src={src}
              alt={alt}
              width={dims.w}
              height={dims.h}
              quality={90}
              priority={true}
              className="object-contain rounded-xl"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[88vw] max-w-[640px] flex flex-col items-center gap-2">
        {safeAlt ? (
          <div className="w-full text-center text-[12px] sm:text-[13px] text-white/75 line-clamp-1">
            {safeAlt}
          </div>
        ) : null}

        {total > 1 && (
          <>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`${i === currentIndex % 8 ? 'w-5 bg-white/90' : 'w-2 bg-white/35'} h-1 rounded-full transition-all duration-200`}
                />
              ))}
            </div>
            <div className="rounded-full border border-white/20 bg-black/55 px-3.5 py-1 text-[12px] text-white/95 tracking-[0.04em] backdrop-blur-sm">
              {currentIndex + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Right arrow */}
      <button aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); onNext() }} className="absolute right-[max(10px,2.5vw)] md:right-[max(16px,4vw)] z-40 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/14 hover:bg-white/24 text-white border border-white/25 shadow-[0_10px_28px_rgba(0,0,0,0.35)] no-custom-btn transition-all duration-200 hover:scale-105">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  ), document.body)
}
