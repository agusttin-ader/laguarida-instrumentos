"use client"

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function GuitarGallery({ images = [] }){
  const [index, setIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const [modalSize, setModalSize] = useState(null)
  const mainRef = useRef(null)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)

  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0b0d0f] h-48 md:h-72 lg:h-[60vh]"></div>
    )
  }

  const main = images[index]

  function handlePrev(){ setIndex(i => (i - 1 + images.length) % images.length) }
  function handleNext(){ setIndex(i => (i + 1) % images.length) }

  function onTouchStart(e){ touchStartX.current = e.touches[0].clientX; touchDelta.current = 0 }
  function onTouchMove(e){ if (touchStartX.current == null) return; touchDelta.current = e.touches[0].clientX - touchStartX.current }
  function onTouchEnd(){ const threshold = 40; if (touchDelta.current > threshold) handlePrev(); else if (touchDelta.current < -threshold) handleNext(); touchStartX.current = null; touchDelta.current = 0 }

  function openModal(i){
    // only desktop overlay
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(min-width:1024px)').matches) return
    const el = mainRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setModalSize({ width: rect.width, height: rect.height })
    }
    setModalIndex(i)
    setModalOpen(true)
  }

  function closeModal(){ setModalOpen(false) }

  useEffect(() => {
    function onKey(e){ if (!modalOpen) return; if (e.key === 'Escape') closeModal(); if (e.key === 'ArrowLeft') setModalIndex(i => (i - 1 + images.length) % images.length); if (e.key === 'ArrowRight') setModalIndex(i => (i + 1) % images.length) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, images.length])

  // lock body scroll when modal is open
  useEffect(() => {
    if (!modalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [modalOpen])

  function handleOverlayClick(e){ if (e.target && e.target.dataset && e.target.dataset.role === 'overlay') closeModal() }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-lg overflow-hidden transform transition-shadow duration-200 hover:shadow-md" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div ref={mainRef} className="relative w-full h-96 md:h-[70vh] lg:h-[85vh] bg-white dark:bg-[#0b0d0f] flex items-center justify-center cursor-pointer" onClick={() => openModal(index)}>
          <Image src={main} alt={`Imagen ${index+1}`} fill style={{objectFit: 'contain', objectPosition: 'center'}} sizes="(min-width: 1280px) 900px, (min-width: 768px) 60vw, 100vw" className="transition-opacity duration-400 opacity-100" quality={100} priority />
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-6 flex items-center gap-3 overflow-x-auto">
          {images.map((src,i)=> (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Ver imagen ${i+1}`} className={`w-28 h-20 rounded overflow-hidden border ${i===index? 'border-gray-900' : 'border-gray-200'} focus:outline-none flex-shrink-0`}>
              <div className="relative w-full h-full">
                <Image src={src} alt={`thumb-${i+1}`} fill style={{objectFit: 'cover'}} sizes="120px" quality={80} />
              </div>
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <div data-role="overlay" onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          {/* Close X: also sync selected image back to gallery */}
          <button aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); setIndex(modalIndex); closeModal() }} className="absolute top-6 right-6 z-50 text-neutral-900 p-3 rounded-md hover:bg-black/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Large invisible left click area for easy prev */}
          <button aria-label="Anterior" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i - 1 + images.length) % images.length) }} className="absolute left-0 inset-y-0 w-1/4 bg-transparent z-30" />

          {/* Visible left arrow (like WhatsApp Web) */}
          <button aria-label="Anterior" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i - 1 + images.length) % images.length) }} className="hidden lg:flex absolute left-6 items-center justify-center h-12 w-12 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 transition-transform duration-200 transform hover:scale-105 z-40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Centered image box sized to original container (capped by viewport) */}
          <div style={{ width: modalSize?.width ?? 'auto', height: modalSize?.height ?? 'auto', maxWidth: '90vw', maxHeight: '85vh' }} className="flex items-center justify-center relative">
            <Image src={images[modalIndex]} alt={`Imagen modal ${modalIndex+1}`} width={modalSize ? Math.min(modalSize.width, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.9)) : 800} height={modalSize ? Math.min(modalSize.height, Math.floor((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.85)) : 600} style={{objectFit: 'contain'}} quality={100} priority />
          </div>

          {/* Visible right arrow */}
          <button aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i + 1) % images.length) }} className="hidden lg:flex absolute right-6 items-center justify-center h-12 w-12 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 transition-transform duration-200 transform hover:scale-105 z-40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Large invisible right click area for easy next */}
          <button aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i + 1) % images.length) }} className="absolute right-0 inset-y-0 w-1/4 bg-transparent z-30" />
        </div>
      )}
    </div>
  )
}
