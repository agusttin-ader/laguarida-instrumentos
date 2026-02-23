"use client"

import React, { useEffect, useRef, useState } from 'react'
import ImageWithSkeleton from './ImageWithSkeleton'
import GalleryLightbox from './GalleryLightbox'
import imageService from '../lib/utils/imageService'

export default function GuitarGallery({ images = [], image_url, altBase }){
  // index is unused; gallery uses `mainSrc` to track the current main image
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const mainRef = useRef(null)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)
  // double-buffered main image for cross-dissolve
  const [displaySrc, setDisplaySrc] = useState(null)
  const [prevSrc, setPrevSrc] = useState(null)
  const [prevVisible, setPrevVisible] = useState(false)
  const crossfadeDuration = 260 // ms (within 200-300ms requirement)

  const resolvedGallery = Array.isArray(images) ? images.map(imageService.resolve).filter(Boolean) : []
  const resolvedMainProp = imageService.resolve(image_url)

  // mainSrc is the currently-selected source (data source)
  const [mainSrc, setMainSrc] = useState(resolvedMainProp || resolvedGallery[0] || null)

  // keep mainSrc in sync with prop changes
  useEffect(() => {
    const resolved = imageService.resolve(image_url)
    if (resolved) setMainSrc(resolved)
    else if (!mainSrc && resolvedGallery && resolvedGallery.length) setMainSrc(resolvedGallery[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image_url, JSON.stringify(resolvedGallery)])

  // synchronize displaySrc / prevSrc for cross-dissolve
  useEffect(() => {
    if (!mainSrc) return
    if (!displaySrc) {
      setDisplaySrc(mainSrc)
      return
    }
    if (mainSrc === displaySrc) return
    // start crossfade: keep previous visible, then fade it out
    setPrevSrc(displaySrc)
    setPrevVisible(true)
    // set new display immediately (will fade in)
    setDisplaySrc(mainSrc)
    // allow a tick for browser to apply initial opacity, then start fade
    const start = setTimeout(() => setPrevVisible(false), 20)
    // remove prevSrc after transition completes
    const remove = setTimeout(() => setPrevSrc(null), crossfadeDuration + 40)
    return () => { clearTimeout(start); clearTimeout(remove) }
  }, [mainSrc])
  
  // thumbnails come from the gallery array; modal/list includes main + gallery (no duplicates)
  const thumbs = resolvedGallery
  // modalItems: snapshot of modal list captured when opening the modal
  const [modalItems, setModalItems] = useState([])
  const modalList = modalItems.length ? modalItems : [...(mainSrc ? [mainSrc] : []), ...resolvedGallery.filter(s => s !== mainSrc)]

  // keyboard handler for modal navigation and escape
  useEffect(() => {
    function onKey(e){ if (!modalOpen) return; if (e.key === 'Escape') closeModal(); if (e.key === 'ArrowLeft') setModalIndex(i => (i - 1 + modalList.length) % modalList.length); if (e.key === 'ArrowRight') setModalIndex(i => (i + 1) % modalList.length) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, JSON.stringify(modalList)])
  // Note: body scroll lock is handled by GalleryLightbox to avoid conflicting restores
  
  
  if (!modalList || modalList.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#0b0d0f] h-56 md:h-80 lg:h-[99vh]"></div>
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
  function handleNext(){
    const l = modalList
    if (!l || l.length === 0) return
    const i = l.indexOf(main) || 0
    const ni = (i + 1) % l.length
    setMainSrc(l[ni])
  }

  // touch handlers for swipe navigation on mobile
  function onTouchStart(e){ if (!e || !e.touches) return; touchStartX.current = e.touches[0].clientX; touchDelta.current = 0 }
  function onTouchMove(e){ if (!touchStartX.current || !e || !e.touches) return; touchDelta.current = e.touches[0].clientX - touchStartX.current }
  function onTouchEnd(){ const threshold = 40; if (touchDelta.current > threshold) handlePrev(); else if (touchDelta.current < -threshold) handleNext(); touchStartX.current = null; touchDelta.current = 0 }

  // keyboard handler for thumbnails (Enter / Space)
  function handleThumbKey(e, src){
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setMainSrc(src)
    }
  }

  function openModal(i){
    // capture a stable snapshot of modal items when opening so navigation order doesn't shift
    const items = [...(mainSrc ? [mainSrc] : []), ...resolvedGallery.filter(s => s !== mainSrc)]
    setModalItems(items)
    setModalIndex(i)
    setModalOpen(true)
  }

  function closeModal(){ setModalOpen(false); setModalItems([]) }


  // overlay click handler removed (not used) to silence lint warning

  return (
      <div className="flex flex-col justify-center items-center px-2 md:px-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Main image area */}
        <div
          className="overflow-hidden flex items-center justify-center cursor-pointer w-full p-0 transition-none"
          ref={mainRef}
          role="button"
          tabIndex={0}
          aria-label="Abrir galería"
          onClick={() => openModal(modalList.indexOf(main))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openModal(modalList.indexOf(main));
            }
          }}
          aria-live="polite"
          style={{ width: '100%', position: 'relative' }}
        >
          {/* layers for cross-dissolve: prev (fades out) + display (fades in) */}
          <div className="flex items-center justify-center">
            {prevSrc && (
              <div
            className="absolute right-4 items-center justify-center h-12 w-12 rounded-full bg-black/50 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-transform duration-150 transform hover:scale-105 z-40 focus:outline-none focus:ring-2 focus:ring-white/20 no-custom-btn"
                style={{
                  transition: `opacity ${crossfadeDuration}ms cubic-bezier(.22,1,.36,1)`,
                  opacity: prevVisible ? 1 : 0
                }}
                  aria-hidden={true}
              >
                <ImageWithSkeleton
                  src={prevSrc}
                  alt={altBase ? `${altBase}` : `Imagen previa`}
                  width={720}
                  height={980}
                  fit="contain"
                  style={{ objectPosition: 'center' }}
                  className="max-w-full h-auto object-contain"
                  quality={85}
                />
              </div>
            )}
            {displaySrc && (
              <div
                className="flex items-center justify-center"
                style={{
                  transition: `opacity ${crossfadeDuration}ms cubic-bezier(.22,1,.36,1)`,
                  opacity: 1
                }}
              >
                <ImageWithSkeleton
                  key={displaySrc}
                  src={displaySrc}
                  alt={altBase ? `${altBase}` : `Imagen del producto`}
                  width={720}
                  height={980}
                  fit="contain"
                  style={{ objectPosition: 'center' }}
                  className="max-w-full h-auto object-contain"
                  quality={85}
                  priority={true}
                  sizes="(min-width:1024px) 50vw, 100vw"
                />
              </div>
            )}
          </div>
        </div>
      {/* Thumbnails below main image, horizontal scroll */}
      <div className="w-full mt-4 overflow-x-auto thumb-strip">
          <div className="flex flex-row gap-2" style={{ minWidth: '100%', width: '100%' }}>
            {thumbs.map((src,i) => (
              <button
                key={i}
                onClick={() => setMainSrc(src)}
                onKeyDown={(e) => handleThumbKey(e, src)}
                aria-label={`Ver imagen ${i+1}`}
                aria-pressed={src===main}
                className={`w-20 h-20 flex-shrink-0 overflow-hidden border rounded-none focus:outline-none transition-transform duration-200 ease-out flex items-center justify-center thumb-reset ${src===main ? 'ring-2 ring-rose-300 scale-105 border-rose-300 shadow-sm' : 'border-gray-200 hover:scale-105 hover:shadow'}`}
              >
                <ImageWithSkeleton src={src} alt={altBase ? `${altBase} — miniatura ${i+1}` : `Miniatura ${i+1}`} width={80} height={80} className="object-cover w-full h-full rounded-none thumb-reset" sizes="80px" quality={60} loading="lazy" />
              </button>
            ))}
          </div>
      </div>
      {modalOpen && (
        <GalleryLightbox
          src={modalList[modalIndex]}
          alt={altBase ? `${altBase} — imagen ${modalIndex+1}` : `Imagen ${modalIndex+1}`}
          onClose={() => { setMainSrc(modalList[modalIndex] || main); closeModal() }}
          onPrev={() => setModalIndex(i => {
            const ni = (i - 1 + modalList.length) % modalList.length
            setMainSrc(modalList[ni])
            return ni
          })}
          onNext={() => setModalIndex(i => {
            const ni = (i + 1) % modalList.length
            setMainSrc(modalList[ni])
            return ni
          })}
        />
      )}
    </div>
  )
}
