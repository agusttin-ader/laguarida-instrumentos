"use client";
import React, { useState } from "react";
import Image from "next/image";

// ImageWithSkeleton:
// - Wraps Next/Image to provide a lightweight skeleton while the image is loading.
// - Uses `onLoadingComplete` to detect when Next/Image finished decoding.
// - Keeps `alt` for accessibility (screen readers) and avoids layout shift via width/height or `fill` usage.
// - Next/Image is used for responsive, optimized delivery (AVIF/WebP) and automatic lazy-loading.

export default function ImageWithSkeleton({ src, alt, width, height, sizes, quality = 80, priority = false, className = "", style = {}, fill = false }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}>
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" aria-hidden="true" />
      )}

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        quality={quality}
        priority={priority}
        fill={fill}
        className={`object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}
