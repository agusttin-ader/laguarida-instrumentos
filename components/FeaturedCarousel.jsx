"use client";
import React from "react";
import ImageWithSkeleton from "./ImageWithSkeleton";
import imageService from "../lib/utils/imageService";

// Performance & UX notes:
// - Carousel uses CSS `scroll-snap` for native, GPU-friendly swipe snapping.
// - Images use ImageWithSkeleton (Next/Image) to lazy-load and avoid layout shifts.
// - Visible text sits below images (no overlay) to ensure good contrast.
export default function FeaturedCarousel({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="relative">
        <div className="overflow-x-auto no-scrollbar px-4 -mx-4 snap-x snap-mandatory flex gap-4 py-3">
          {items.map((it) => {
            const srcRaw = it.image_url || (it.images && it.images[0]) || ''
            const src = imageService.resolve(srcRaw)
            return (
              <article key={it.slug || it.id || src} className="snap-center min-w-[80%] sm:min-w-[60%] bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-transparent overflow-hidden">
                <div className="relative w-full h-44 sm:h-56">
                  <ImageWithSkeleton
                    src={src}
                    alt={it.name || ''}
                    fill
                    sizes="(min-width:1024px) 540px, 100vw"
                    quality={90}
                    className="object-cover"
                  />
                </div>

                <div className="p-3">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{it.name}</h4>
                  {it.price ? (
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{it.price}</p>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  );
}
