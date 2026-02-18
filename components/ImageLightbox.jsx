"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import "./ImageLightbox.css"

export default function ImageLightbox({ src, alt = "image", className = "", onPrev, onNext }) {
  const thumbRef = useRef(null)
  const modalCloseRef = useRef(null)
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
    if (typeof window !== "undefined" && window.matchMedia) {
      if (!window.matchMedia("(min-width: 1024px)").matches) return
    }
    if (!thumbRef.current) return
    const rect = thumbRef.current.getBoundingClientRect()
    setModalRect({ width: rect.width, height: rect.height })
    setModalOpen(true)
  }

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
          className="image-lightbox-overlay fixed inset-0 z-50 flex items-center justify-center"
          data-role="overlay"
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
        >
          <button
            aria-label="Anterior"
            onClick={() => onPrev?.()}
            className="image-lightbox-nav left"
          />

          <div className="relative" style={{ width: modalRect?.width ?? 'auto', height: modalRect?.height ?? 'auto', maxWidth: '90vw', maxHeight: '85vh' }}>
            <Image
              src={src}
              alt={alt}
              width={modalRect ? Math.min(modalRect.width, window.innerWidth * 0.9) : 800}
              height={modalRect ? Math.min(modalRect.height, window.innerHeight * 0.85) : 600}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          <button
            aria-label="Siguiente"
            onClick={() => onNext?.()}
            className="image-lightbox-nav right"
          />

          <button
            ref={modalCloseRef}
            aria-label="Cerrar"
            onClick={closeModal}
            className="absolute top-6 right-6 z-60 text-white bg-black/40 hover:bg-black/60 rounded-md p-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
    </>
  )
}
