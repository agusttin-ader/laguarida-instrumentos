"use client";
import React, { useState } from "react";
import NextImage from "next/image";
import { useEffect } from "react";

// ImageWithSkeleton:
// - Wraps Next/Image to provide a lightweight skeleton while the image is loading.
// - Uses `onLoad` to detect when the image has finished loading (onLoadingComplete is deprecated).
// - Keeps `alt` for accessibility (screen readers) and avoids layout shift via width/height or `fill` usage.
export default function ImageWithSkeleton({ src, alt, width, height, sizes, quality = 72, priority = false, loading = 'lazy', className = "", style = {}, fill = false, fit, imgClassName = '', imgStyle = {}, onImageLoad, disableClientPreview = true, unoptimized }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState(null)
  useEffect(() => {
    if (disableClientPreview) {
      setBlurDataURL(null)
      return
    }
    let mounted = true
    async function makeClientPreview() {
      if (!src) return
      try {
        if (typeof window === 'undefined') return
        const imgEl = new window.Image()
        imgEl.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          imgEl.onload = () => resolve(imgEl)
          imgEl.onerror = reject
          imgEl.src = src
        })
        const w = 16
        const h = Math.max(1, Math.round((w * imgEl.naturalHeight) / imgEl.naturalWidth))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(imgEl, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5)
        if (mounted) setBlurDataURL(dataUrl)
      } catch { /* ignore preview generation errors (CORS etc.) */ }
    }
    if (typeof window !== 'undefined') makeClientPreview()
    return () => { mounted = false }
  }, [src, disableClientPreview])
  if (typeof src === 'string') src = src.trim()
  if (!src) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}>
        <div className="image-placeholder w-full h-full" aria-hidden="true" />
      </div>
    )
  }

  // compute an aspect-ratio placeholder when width/height are provided
  const aspectRatio = (width && height) ? `${width} / ${height}` : undefined

  const mergedImgStyle = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    ...imgStyle
  }
  const srcStr = typeof src === 'string' ? src.trim() : ''
  const isSupabaseObject =
    srcStr.includes('supabase.co') && srcStr.includes('/storage/v1/object/')
  const useUnoptimized = Boolean(unoptimized) || isSupabaseObject

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: '100%',
        ...(fill ? { height: '100%' } : {}),
        ...(aspectRatio ? { aspectRatio } : {}),
        ...style
      }}
    >
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse image-skeleton-blur" aria-hidden="true" style={blurDataURL ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover', filter: 'blur(24px) saturate(0.95)' } : {}} />
      )}

      {errored ? (
        <div className="image-placeholder w-full h-full" aria-hidden="true" />
      ) : (
        <NextImage
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={sizes}
          quality={quality}
          unoptimized={useUnoptimized}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL || undefined}
          loading={priority ? 'eager' : loading}
          fetchPriority={priority ? 'high' : undefined}
          priority={priority}
          fill={fill}
          decoding="async"
          className={`${(fit === 'contain' || (style && style.objectFit === 'contain')) ? 'object-contain' : 'object-cover'} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-[300ms] ease-[cubic-bezier(0.33,1,0.32,1)] motion-reduce:transition-none ${imgClassName}`}
          onLoad={(e) => {
            setLoaded(true);
            try {
              if (typeof onImageLoad === 'function') {
                const target = e?.currentTarget ?? e?.target;
                onImageLoad(target ? { naturalWidth: target.naturalWidth, naturalHeight: target.naturalHeight } : {});
              }
            } catch { /* ignore */ }
          }}
          style={mergedImgStyle}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
