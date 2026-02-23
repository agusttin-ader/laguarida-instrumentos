"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import ImageWithSkeleton from './ImageWithSkeleton'
import "./ImageLightbox.css"

export default function ImageLightbox({ src, alt = "image", className = "", onPrev, onNext }) {
  const thumbRef = useRef(null)
  const modalCloseRef = useRef(null)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRect, setModalRect] = useState(null)

  function handleMouseMove(e) {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  function openModal() {
    if (!thumbRef.current) return
    const rect = thumbRef.current.getBoundingClientRect()
    setModalRect({ width: rect.width, height: rect.height })
    setModalOpen(true)
  }

  // touch handlers for swipe inside modal
  function onTouchStart(e){ if (!e || !e.touches) return; touchStartX.current = e.touches[0].clientX; touchDelta.current = 0 }
  function onTouchMove(e){ if (!touchStartX.current || !e || !e.touches) return; touchDelta.current = e.touches[0].clientX - touchStartX.current }
  function onTouchEnd(){ const threshold = 40; if (touchDelta.current > threshold) onPrev?.(); else if (touchDelta.current < -threshold) onNext?.(); touchStartX.current = null; touchDelta.current = 0 }

  function closeModal() {
    setModalOpen(false)
  }

  useEffect(() => {
    if (modalOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      setTimeout(() => modalCloseRef.current?.focus(), 0)
      return () => { document.body.style.overflow = prev }
    }
  }, [modalOpen])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && modalOpen) closeModal()
      if (!modalOpen) return
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, onPrev, onNext])

  function handleOverlayClick(e) {
    if (e.target && e.target.dataset && e.target.dataset.role === 'overlay') closeModal()
  }

  return (
    <>
      <div
        ref={thumbRef}
        className={`image-lightbox-thumb overflow-hidden relative ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onClick={openModal}
      >
        <Image
          src={src}
          alt={alt}
          fill
          loading="lazy"
          sizes="(min-width:1280px) 900px, (min-width:768px) 60vw, 100vw"
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transform: isZoomed ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 220ms ease'
          }}
          className="image-lightbox-img"
          quality={100}
        />
      </div>

      {modalOpen && (
        <div
          className="image-lightbox-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          data-role="overlay"
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
        >
          {/* Visible left arrow */}
          <button
            aria-label="Anterior"
            onClick={(e) => { e.stopPropagation(); onPrev?.() }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="absolute left-4 items-center justify-center h-12 w-12 rounded-full bg-black/50 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-transform duration-150 transform hover:scale-105 z-40 focus:outline-none focus:ring-2 focus:ring-white/20 no-custom-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="block" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="relative" style={{ width: modalRect?.width ?? 'auto', height: modalRect?.height ?? 'auto', maxWidth: '90vw', maxHeight: '90vh' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <ImageWithSkeleton
              src={src}
              alt={alt}
              fill={false}
              width={modalRect ? Math.min(modalRect.width, Math.floor(window.innerWidth * 0.9)) : 800}
              height={modalRect ? Math.min(modalRect.height, Math.floor(window.innerHeight * 0.9)) : 600}
              style={{ objectFit: 'contain' }}
              className="max-w-[100vw] max-h-[100vh] object-contain"
              quality={90}
            />
          </div>

          {/* Visible right arrow */}
          <button
            aria-label="Siguiente"
            onClick={(e) => { e.stopPropagation(); onNext?.() }}
            className="absolute right-4 items-center justify-center h-12 w-12 rounded-full bg-black/50 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-transform duration-150 transform hover:scale-105 z-40 focus:outline-none focus:ring-2 focus:ring-white/20 no-custom-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="block" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <button
            ref={modalCloseRef}
            aria-label="Cerrar"
            onClick={(e) => { e.stopPropagation(); closeModal() }}
            className="absolute top-6 right-6 z-60 text-white bg-black/40 hover:bg-black/60 rounded-full p-3 no-custom-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
    </>
  )
}
