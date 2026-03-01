"use client";
import React from "react";
import ImageWithSkeleton from "./ImageWithSkeleton";
import imageService from "../lib/utils/imageService";
import Link from 'next/link';

// Accessibility & Performance notes:
// - Uses Next/Image (via ImageWithSkeleton) for responsive, optimized images and automatic lazy-loading.
// - Skeleton placeholder reduces perceived load and prevents layout shift (improves CLS).
// - Button uses clear ARIA label and high-contrast text on accent background to meet contrast requirements.
import RippleButton from "./RippleButton";

export default function MobileProductCard({ product }) {
  const waLink = `https://wa.me/541168696491?text=${encodeURIComponent(
    `Hola! Quisiera info del producto: ${product.name}`
  )}`;

  return (
    <article className="card-interactive w-full bg-white dark:bg-neutral-900 card-compact overflow-hidden">
      <div className="w-full bg-neutral-50 dark:bg-neutral-800 overflow-hidden rounded-[12px]">
        <Link href={`/guitars/${product.slug || product.id}`} aria-label={`Ir a ${product.name}`} className="block w-full">
          {/* Use ImageWithSkeleton to show a skeleton while Next/Image loads for better perceived performance */}
          <ImageWithSkeleton
            src={imageService.resolve(product.image_url || (product.images && product.images[0]) || product.image)}
            alt={product.name}
            width={1200}
            height={900}
            quality={100}
            sizes="(min-width:1024px) 600px, 100vw"
            className="w-full h-auto"
          />
        </Link>
      </div>

      <div className="p-4">
        <h3 className="card-title text-neutral-900 dark:text-neutral-100">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">${product.price}</span>
          {/* Use RippleButton for press / ripple micro-interaction. */}
          {/* Tailwind handles color/scale transitions; Framer Motion is optional for advanced physics. */}
          <RippleButton
            href={waLink}
            className="ml-4 inline-flex items-center gap-2 px-3 py-2 btn-gradient rounded-[12px] text-sm transition-transform duration-150 active:translate-y-0.5"
            aria-label={`Pedir info ${product.name}`}
          >
            Pedir Info
          </RippleButton>
        </div>
      </div>
    </article>
  );
}
