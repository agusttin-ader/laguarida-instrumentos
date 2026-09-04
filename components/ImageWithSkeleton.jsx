"use client";
import React, { useState, useEffect } from "react";
import NextImage from "next/image";
import { usePremiumImageFade } from "../hooks/usePremiumImageFade";

export default function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  sizes,
  quality,
  qualityPreset = 'galleryMain',
  priority = false,
  loading = 'lazy',
  className = "",
  style = {},
  fill = false,
  fit,
  imgClassName = '',
  imgStyle = {},
  onImageLoad,
  disableClientPreview = true,
  unoptimized,
  /** Original canónico si `src` es variante estática (fallback ante 404). */
  fallbackSrc,
  srcSet,
}) {
  const requestedSrc = typeof src === 'string' ? src.trim() : src
  const fallback = typeof fallbackSrc === 'string' ? fallbackSrc.trim() : ''
  const [activeSrc, setActiveSrc] = useState(requestedSrc)
  const srcKey = typeof activeSrc === 'string' ? activeSrc.trim() : activeSrc
  const { loaded, onImageLoad: markImageLoaded, opacityClass, transitionClass } = usePremiumImageFade(srcKey)
  const [errored, setErrored] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState(null)

  useEffect(() => {
    setActiveSrc(requestedSrc)
    setErrored(false)
  }, [requestedSrc])

  useEffect(() => {
    if (disableClientPreview) {
      setBlurDataURL(null)
      return
    }
    let mounted = true
    async function makeClientPreview() {
      if (!activeSrc) return
      try {
        if (typeof window === 'undefined') return
        const imgEl = new window.Image()
        imgEl.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          imgEl.onload = () => resolve(imgEl)
          imgEl.onerror = reject
          imgEl.src = activeSrc
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
  }, [activeSrc, disableClientPreview])

  if (!activeSrc) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}>
        <div className="image-placeholder w-full h-full" aria-hidden="true" />
      </div>
    )
  }

  const aspectRatio = (width && height) ? `${width} / ${height}` : undefined

  const mergedImgStyle = {
    ...imgStyle,
  }
  if (!imgStyle.transform && !imgStyle.WebkitTransform) {
    mergedImgStyle.backfaceVisibility = 'hidden'
    mergedImgStyle.WebkitBackfaceVisibility = 'hidden'
  }
  // Sin /_next/image salvo override explícito unoptimized={false}.
  const useUnoptimized = unoptimized !== false

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
        <div className={`absolute inset-0 bg-neutral-100 dark:bg-neutral-800 image-skeleton-blur ${priority ? '' : 'animate-pulse'}`} aria-hidden="true" style={blurDataURL ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover', filter: 'blur(24px) saturate(0.95)' } : {}} />
      )}

      {errored ? (
        <div className="image-placeholder w-full h-full" aria-hidden="true" />
      ) : (
        <NextImage
          src={activeSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={sizes}
          srcSet={srcSet || undefined}
          unoptimized={useUnoptimized}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL || undefined}
          loading={priority ? 'eager' : loading}
          fetchPriority={priority ? 'high' : 'auto'}
          priority={priority}
          fill={fill}
          decoding="async"
          className={`${(fit === 'contain' || (style && style.objectFit === 'contain')) ? 'object-contain' : 'object-cover'} ${opacityClass} ${transitionClass} ${imgClassName}`}
          onLoad={(e) => {
            markImageLoaded();
            try {
              if (typeof onImageLoad === 'function') {
                const target = e?.currentTarget ?? e?.target;
                onImageLoad(target ? { naturalWidth: target.naturalWidth, naturalHeight: target.naturalHeight } : {});
              }
            } catch { /* ignore */ }
          }}
          style={mergedImgStyle}
          onError={() => {
            if (fallback && activeSrc !== fallback) {
              setActiveSrc(fallback)
              return
            }
            setErrored(true)
          }}
        />
      )}
    </div>
  );
}
