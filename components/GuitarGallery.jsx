"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function GuitarGallery({ images = [] }){
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(true)
  const touchStartX = useRef(null)
  const touchDelta = useRef(0)

  useEffect(() => {
    // when index changes, mark not loaded until new image finishes
    setLoaded(false)
  }, [index])

  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0b0d0f] h-48 md:h-72 lg:h-[60vh]"></div>
    )
  }

  const main = images[index]

  function handlePrev(){
    setIndex(i => (i - 1 + images.length) % images.length)
  }

  function handleNext(){
    setIndex(i => (i + 1) % images.length)
  }

  function onTouchStart(e){
    touchStartX.current = e.touches[0].clientX
    touchDelta.current = 0
  }

  function onTouchMove(e){
    if (touchStartX.current == null) return
    touchDelta.current = e.touches[0].clientX - touchStartX.current
  }

  function onTouchEnd(){
    const threshold = 40
    if (touchDelta.current > threshold) {
      handlePrev()
    } else if (touchDelta.current < -threshold) {
      handleNext()
    }
    touchStartX.current = null
    touchDelta.current = 0
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-lg overflow-hidden transform transition-shadow duration-200 hover:shadow-md" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="relative w-full h-96 md:h-[70vh] lg:h-[85vh] bg-white dark:bg-[#0b0d0f] flex items-center justify-center">
          <Image
            src={main}
            alt={`Imagen ${index+1}`}
            fill
            style={{objectFit: 'contain', objectPosition: 'center'}}
            sizes="(min-width: 1280px) 900px, (min-width: 768px) 60vw, 100vw"
            className={`transition-opacity duration-400 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            quality={100}
            priority
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-6 flex items-center gap-3 overflow-x-auto">
          {images.map((src,i)=> (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ver imagen ${i+1}`}
              className={`w-28 h-20 rounded overflow-hidden border ${i===index? 'border-gray-900' : 'border-gray-200'} focus:outline-none flex-shrink-0`}
            >
              <div className="relative w-full h-full">
                <Image src={src} alt={`thumb-${i+1}`} fill style={{objectFit: 'cover'}} sizes="120px" quality={100} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
