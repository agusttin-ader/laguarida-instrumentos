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
      <div className="rounded-xl overflow-hidden bg-[var(--dark-surface-2)] h-56 md:h-80 flex items-center justify-center">
        <span className="text-4xl opacity-30" aria-hidden>🎸</span>
      </div>
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
      <div className="w-full max-w-[420px] mx-auto flex flex-col items-center" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div
          className="overflow-hidden rounded-xl flex items-center justify-center cursor-pointer w-full bg-[var(--dark-bg-card)]"
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
        >
          <div className="relative w-full flex items-center justify-center" style={{ aspectRatio: '4/5', minHeight: 280 }}>
            {prevSrc && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transition: `opacity ${crossfadeDuration}ms cubic-bezier(.22,1,.36,1)`,
                  opacity: prevVisible ? 1 : 0
                }}
                aria-hidden
              >
                <ImageWithSkeleton
                  src={prevSrc}
                  alt={altBase ? `${altBase}` : `Imagen previa`}
                  width={720}
                  height={980}
                  fit="contain"
                  style={{ objectPosition: 'center' }}
                  className="max-w-full max-h-full object-contain"
                  quality={100}
                />
              </div>
            )}
            {displaySrc && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageWithSkeleton
                  key={displaySrc}
                  src={displaySrc}
                  alt={altBase ? `${altBase}` : `Imagen del producto`}
                  width={720}
                  height={980}
                  fit="contain"
                  style={{ objectPosition: 'center' }}
                  className="max-w-full max-h-full object-contain"
                  quality={100}
                  priority
                  sizes="(min-width:1024px) 50vw, 100vw"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 w-full overflow-x-auto thumb-strip no-scrollbar" aria-label="Miniaturas">
          <div className="flex flex-row gap-2.5 justify-center px-1 py-2 min-w-0">
            {thumbs.map((src,i) => (
              <button
                key={i}
                onClick={() => setMainSrc(src)}
                onKeyDown={(e) => handleThumbKey(e, src)}
                aria-label={`Ver imagen ${i+1}`}
                aria-pressed={src===main}
                className={`no-custom-btn relative w-14 h-[72px] sm:w-16 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)] transition-all duration-200 flex items-center justify-center bg-[var(--dark-bg-elevated)] ${src===main ? 'border-[var(--vintage-gold)] opacity-100 ring-1 ring-[var(--vintage-gold)]/30' : 'border-[var(--dark-border)] hover:border-white/25 opacity-90 hover:opacity-100'}`}
              >
                <ImageWithSkeleton src={src} alt={altBase ? `${altBase} — miniatura ${i+1}` : `Miniatura ${i+1}`} width={86} height={112} className="object-cover w-full h-full thumb-reset" sizes="96px" quality={100} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      {modalOpen && (
        <GalleryLightbox
          src={modalList[modalIndex]}
          alt={altBase ? `${altBase} — imagen ${modalIndex+1}` : `Imagen ${modalIndex+1}`}
          currentIndex={modalIndex}
          total={modalList.length}
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
