"use client"

import React, { useEffect, useRef, useState } from 'react'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'

export default function GuitarGallery({ images = [], image_url }){
  // index is unused; gallery uses `mainSrc` to track the current main image
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const [modalSize, setModalSize] = useState(null)
  const mainRef = useRef(null)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)

  const resolvedGallery = Array.isArray(images) ? images.map(imageService.resolve).filter(Boolean) : []
  const resolvedMainProp = imageService.resolve(image_url)

  // mainSrc is the currently-displayed main image (string URL)
  const [mainSrc, setMainSrc] = useState(resolvedMainProp || resolvedGallery[0] || null)

  // keep mainSrc in sync with prop changes
  useEffect(() => {
    const resolved = imageService.resolve(image_url)
    if (resolved) setMainSrc(resolved)
    else if (!mainSrc && resolvedGallery && resolvedGallery.length) setMainSrc(resolvedGallery[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image_url, JSON.stringify(resolvedGallery)])

  // thumbnails come from the gallery array; modal/list includes main + gallery (no duplicates)
  const thumbs = resolvedGallery
  const modalList = [...(mainSrc ? [mainSrc] : []), ...resolvedGallery.filter(s => s !== mainSrc)]
  if (!modalList || modalList.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0b0d0f] h-48 md:h-72 lg:h-[60vh]"></div>
    )
  }

  const main = mainSrc || modalList[0]

  function handlePrev(){
    const l = modalList
    if (!l || l.length === 0) return
    const i = l.indexOf(main) || 0
    const ni = (i - 1 + l.length) % l.length
    setMainSrc(l[ni])
  }

  // Preconnect + preload to speed up main image download (helps perceived load)
  let preloadLinks = null
  try {
    if (main) {
      const u = new URL(main)
      preloadLinks = (
        <>
          <link rel="preconnect" href={u.origin} crossOrigin="anonymous" />
          <link rel="preload" href={main} as="image" fetchpriority="high" />
        </>
      )
    }
  } catch (e) {
    preloadLinks = null
  }
  function handleNext(){
    const l = modalList
    if (!l || l.length === 0) return
    const i = l.indexOf(main) || 0
    const ni = (i + 1) % l.length
    setMainSrc(l[ni])
  }

  function onTouchStart(e){ touchStartX.current = e.touches[0].clientX; touchDelta.current = 0 }
  function onTouchMove(e){ if (touchStartX.current == null) return; touchDelta.current = e.touches[0].clientX - touchStartX.current }
  function onTouchEnd(){ const threshold = 40; if (touchDelta.current > threshold) handlePrev(); else if (touchDelta.current < -threshold) handleNext(); touchStartX.current = null; touchDelta.current = 0 }

  // keyboard handler for thumbnails (Enter / Space)
  function handleThumbKey(e, src){
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setMainSrc(src)
    }
  }

  function openModal(i){
    // only desktop overlay
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(min-width:1024px)').matches) return
    const el = mainRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setModalSize({ width: rect.width, height: rect.height })
    }
    // ensure modalIndex maps to our list
    setModalIndex(i)
    setModalOpen(true)
  }

  function closeModal(){ setModalOpen(false) }

  useEffect(() => {
    function onKey(e){ if (!modalOpen) return; if (e.key === 'Escape') closeModal(); if (e.key === 'ArrowLeft') setModalIndex(i => (i - 1 + modalList.length) % modalList.length); if (e.key === 'ArrowRight') setModalIndex(i => (i + 1) % modalList.length) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, JSON.stringify(modalList)])

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
        <div ref={mainRef} className="relative w-full h-96 md:h-[70vh] lg:h-[85vh] bg-white dark:bg-[#0b0d0f] flex items-center justify-center cursor-pointer" onClick={() => openModal(modalList.indexOf(main))} aria-live="polite">
          <div className="w-full h-full transition-all duration-300 ease-in-out transform flex items-center justify-center">
            <div className="relative" style={{ width: '100%', maxWidth: 900, maxHeight: '85vh' }}>
              <ImageWithSkeleton
                key={main}
                src={main}
                alt={`Imagen del producto`}
                width={900}
                height={600}
                fit="contain"
                style={{ objectPosition: 'center' }}
                sizes="(min-width: 1280px) 900px, (min-width: 768px) 60vw, 100vw"
                className="transition-opacity duration-300 max-w-full max-h-full"
                quality={85}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {thumbs.length > 0 && (
        <div className="mt-6 flex items-center gap-3 overflow-x-auto">
          {thumbs.map((src,i)=> (
            <button
              key={i}
              onClick={() => setMainSrc(src)}
              onKeyDown={(e) => handleThumbKey(e, src)}
              aria-label={`Ver imagen ${i+1}`}
              aria-pressed={src===main}
              className={`w-28 h-20 rounded overflow-hidden border focus:outline-none flex-shrink-0 transition-transform duration-200 ease-out ${src===main? 'border-gray-900 ring-2 ring-blue-300 scale-105' : 'border-gray-200 hover:scale-105'}`}
            >
              <div className="w-full h-full">
                <ImageWithSkeleton src={src} alt={`Miniatura ${i+1}`} width={112} height={80} style={{objectFit: 'cover'}} sizes="120px" quality={95} loading="lazy" />
              </div>
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <div data-role="overlay" onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          {/* Close X: also sync selected image back to gallery */}
          <button aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); setMainSrc(modalList[modalIndex] || main); closeModal() }} className="absolute top-6 right-6 z-50 text-neutral-900 p-3 rounded-md hover:bg-black/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Large invisible left click area for easy prev */}
          <button aria-label="Anterior" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i - 1 + modalList.length) % modalList.length) }} className="absolute left-0 inset-y-0 w-1/4 bg-transparent z-30" />

          {/* Visible left arrow (like WhatsApp Web) */}
          <button aria-label="Anterior" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i - 1 + modalList.length) % modalList.length) }} className="hidden lg:flex absolute left-6 items-center justify-center h-12 w-12 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 transition-transform duration-200 transform hover:scale-105 z-40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Centered image box sized to original container (capped by viewport) */}
            <div style={{ width: modalSize?.width ?? 'auto', height: modalSize?.height ?? 'auto', maxWidth: '90vw', maxHeight: '85vh' }} className="flex items-center justify-center relative">
            <ImageWithSkeleton fit="contain" src={modalList[modalIndex]} alt={`Imagen modal ${modalIndex+1}`} width={modalSize ? Math.min(modalSize.width, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.9)) : 800} height={modalSize ? Math.min(modalSize.height, Math.floor((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.85)) : 600} quality={90} />
          </div>

          {/* Visible right arrow */}
          <button aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i + 1) % modalList.length) }} className="hidden lg:flex absolute right-6 items-center justify-center h-12 w-12 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 transition-transform duration-200 transform hover:scale-105 z-40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Large invisible right click area for easy next */}
          <button aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); setModalIndex(i => (i + 1) % modalList.length) }} className="absolute right-0 inset-y-0 w-1/4 bg-transparent z-30" />
        </div>
      )}
    </div>
  )
}
