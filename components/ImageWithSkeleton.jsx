"use client";
import React, { useState } from "react";
import Image from "next/image";

// ImageWithSkeleton:
// - Wraps Next/Image to provide a lightweight skeleton while the image is loading.
// - Uses `onLoadingComplete` to detect when Next/Image finished decoding.
// - Keeps `alt` for accessibility (screen readers) and avoids layout shift via width/height or `fill` usage.
// - Next/Image is used for responsive, optimized delivery (AVIF/WebP) and automatic lazy-loading.

export default function ImageWithSkeleton({ src, alt, width, height, sizes, quality = 80, priority = false, loading, className = "", style = {}, fill = false }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
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
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" aria-hidden="true" />
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
          loading={loading}
          priority={priority}
          fill={fill}
          className={`object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoadingComplete={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
