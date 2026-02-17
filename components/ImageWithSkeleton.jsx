"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useEffect } from "react";

// ImageWithSkeleton:
// - Wraps Next/Image to provide a lightweight skeleton while the image is loading.
// - Uses `onLoadingComplete` to detect when Next/Image finished decoding.
// - Keeps `alt` for accessibility (screen readers) and avoids layout shift via width/height or `fill` usage.
// - Next/Image is used for responsive, optimized delivery (AVIF/WebP) and automatic lazy-loading.

export default function ImageWithSkeleton({ src, alt, width, height, sizes, quality = 95, priority = false, loading, className = "", style = {}, fill = false, fit }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState(null)

  useEffect(() => {
    let mounted = true
    async function makeClientPreview() {
      if (!src) return
      try {
        // Create offscreen image and draw to canvas to produce a tiny jpeg data URL.
        await new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
        const imgEl = await new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
        const w = 24
        const h = Math.max(1, Math.round((w * imgEl.naturalHeight) / imgEl.naturalWidth))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(imgEl, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
        if (mounted) setBlurDataURL(dataUrl)
      } catch (e) {
        // Fail silently; leaving blurDataURL null is acceptable
      }
    }
    // Run on next tick so client-only APIs exist
    if (typeof window !== 'undefined') makeClientPreview()
    return () => { mounted = false }
  }, [src])
  // Defensive: normalize src and avoid passing invalid values to Next/Image
  if (src == null) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}>
        <div className="image-placeholder w-full h-full" aria-hidden="true" />
      </div>
    )
  }
  if (typeof src === 'string') src = src.trim()
  if (!src) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}>
        <div className="image-placeholder w-full h-full" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}>
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" aria-hidden="true" style={blurDataURL ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover', filter: 'blur(6px) saturate(1.1)' } : {}} />
      )}

      {errored ? (
        <div className="image-placeholder w-full h-full" aria-hidden="true" />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={sizes}
          quality={quality}
          loading={priority ? 'eager' : loading}
          fetchPriority={priority ? 'high' : undefined}
          priority={priority}
          fill={fill}
          className={`${(fit === 'contain' || (style && style.objectFit === 'contain')) ? 'object-contain' : 'object-cover'} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoadingComplete={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
