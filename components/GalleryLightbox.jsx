"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function GalleryLightbox({
  src,
  alt = 'imagen',
  currentIndex = 0,
  total = 0,
  onClose = () => {},
  onPrev = () => {},
  onNext = () => {}
}) {
  const overlayRef = useRef(null)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    document.body.classList.add('modal-open')
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose, onPrev, onNext])

  function onTouchStart(e) {
    if (!e?.touches) return
    touchStartX.current = e.touches[0].clientX
    touchDelta.current = 0
  }
  function onTouchMove(e) {
    if (touchStartX.current == null || !e?.touches) return
    touchDelta.current = e.touches[0].clientX - touchStartX.current
  }
  function onTouchEnd() {
    const threshold = 50
    if (touchDelta.current > threshold) onPrev()
    else if (touchDelta.current < -threshold) onNext()
    touchStartX.current = null
    touchDelta.current = 0
  }

  if (!mounted || typeof document === 'undefined') return null

  const safeAlt = String(alt || '').replace(/\s+—\s+imagen\s+\d+$/i, '').trim()

  return createPortal(
    <div
      ref={overlayRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-[80] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Vista de imagen"
    >
      {/* Fondo: negro sólido, clic cierra (no-custom-btn evita estilos globales de botón) */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="no-custom-btn absolute inset-0 z-0 cursor-default bg-transparent border-0"
      />

      {/* Imagen: 100% del alto, animación al cambiar */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <img
          key={src}
          src={src}
          alt={alt}
          className="h-full w-auto max-w-full object-contain lightbox-image-in"
          draggable={false}
          loading="eager"
        />
      </div>

      {/* Cerrar: esquina superior derecha */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 size-10 sm:size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-white no-custom-btn transition-colors active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Anterior: flecha con expansión al hover */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-2 flex items-center justify-center text-white no-custom-btn transition-[opacity,transform] duration-200 hover:opacity-100 hover:scale-125 opacity-90 active:scale-95 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.6))]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sm:w-10 sm:h-10">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Siguiente: flecha con expansión al hover */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Siguiente imagen"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-2 flex items-center justify-center text-white no-custom-btn transition-[opacity,transform] duration-200 hover:opacity-100 hover:scale-125 opacity-90 active:scale-95 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.6))]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sm:w-10 sm:h-10">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Pie: texto y contador encima de la imagen con gradiente para contraste */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-2 pt-12 pb-6 sm:pb-8 px-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {safeAlt && (
          <p className="text-center text-xs sm:text-sm text-white/95 line-clamp-2 max-w-xl px-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {safeAlt}
          </p>
        )}
        {total > 1 && (
          <span className="text-xs text-white/90 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {currentIndex + 1} / {total}
          </span>
        )}
      </div>
    </div>,
    document.body
  )
}
