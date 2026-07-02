"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
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
  const closeBtnClass =
    'no-custom-btn z-[220] flex items-center justify-center rounded-full border border-white/25 bg-black/75 text-white shadow-[0_4px_20px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-transform active:scale-95'

  return createPortal(
    <div
      ref={overlayRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="gallery-lightbox fixed inset-0 z-[200] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Vista de imagen ampliada"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="no-custom-btn absolute inset-0 z-0 cursor-default border-0 bg-transparent"
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center p-2 sm:p-4">
        <div key={src} className="relative h-full w-full max-h-full max-w-full lightbox-image-in">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            quality={78}
            loading="eager"
            draggable={false}
            className="object-contain"
          />
        </div>
      </div>

      {/* X arriba: debajo de la barra de Instagram, bien visible */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className={`${closeBtnClass} absolute left-3 size-12 sm:left-4 sm:size-12`}
        style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      >
        <CloseIcon />
      </button>

      {total > 1 && (
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-3 sm:left-6 top-1/2 z-[210] flex -translate-y-1/2 items-center justify-center p-2 text-white opacity-90 no-custom-btn transition-[opacity,transform] duration-200 hover:scale-125 hover:opacity-100 active:scale-95 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.6))]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sm:h-10 sm:w-10">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {total > 1 && (
        <button
          type="button"
          aria-label="Siguiente imagen"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-3 sm:right-6 top-1/2 z-[210] flex -translate-y-1/2 items-center justify-center p-2 text-white opacity-90 no-custom-btn transition-[opacity,transform] duration-200 hover:scale-125 hover:opacity-100 active:scale-95 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.6))]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sm:h-10 sm:w-10">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 z-[210] flex flex-col items-center gap-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-6 pt-14 sm:pb-8"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {safeAlt && (
          <p className="max-w-xl px-2 text-center text-xs text-white/95 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-sm">
            {safeAlt}
          </p>
        )}

        <div className="flex items-center gap-3">
          {total > 1 && (
            <span className="text-xs tabular-nums text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {currentIndex + 1} / {total}
            </span>
          )}

          <button
            type="button"
            aria-label="Cerrar vista ampliada"
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className={`${closeBtnClass} h-11 gap-2 px-4 text-sm font-medium`}
          >
            <CloseIcon />
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
