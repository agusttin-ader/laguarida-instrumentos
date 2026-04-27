"use client";
import React from "react";
import ImageWithSkeleton from "./ImageWithSkeleton";
import imageService from "../lib/utils/imageService";
import Link from 'next/link';
import normalizeProduct from "../lib/utils/normalizeProduct";

// Accessibility & Performance notes:
// - Uses Next/Image (via ImageWithSkeleton) for responsive, optimized images and automatic lazy-loading.
// - Skeleton placeholder reduces perceived load and prevents layout shift (improves CLS).
// - Button uses clear ARIA label and high-contrast text on accent background to meet contrast requirements.
import RippleButton from "./RippleButton";

export default function MobileProductCard({ product }) {
  const p = normalizeProduct(product)
  const waLink = `https://wa.me/5491154661749?text=${encodeURIComponent(
    `Hola, me interesa ${p.name}, me podrias dar mas informacion ?`
  )}`;

  return (
    <article className="card-interactive card-mobile-no-motion w-full rounded-none sm:rounded-[20px] overflow-hidden border border-white/12 bg-[var(--dark-bg-card)] shadow-none">
      <div className="relative w-full overflow-hidden bg-[#2a2a2a]" style={{ aspectRatio: '5/4' }}>
        <Link href={`/guitars/${p.slug || p.id}`} aria-label={`Ir a ${p.name}`} className="block w-full h-full">
          {/* Use ImageWithSkeleton to show a skeleton while Next/Image loads for better perceived performance */}
          <ImageWithSkeleton
            src={
              imageService.forDisplay(p.image_url || (p.images && p.images[0]) || p.image, 'card') ||
              imageService.resolve(p.image_url || (p.images && p.images[0]) || p.image)
            }
            alt={p.name}
            width={1200}
            height={900}
            quality={70}
            sizes="(max-width:1023px) min(92vw, 560px), 600px"
            className="w-full h-full"
            disableClientPreview
          />
        </Link>
      </div>

      <div className="px-4 py-4 bg-[#1a1b20] border-t border-white/10">
        <h3 className="text-base font-semibold text-white leading-snug line-clamp-2">{p.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-white/85">{p.price || 'Consultar'}</span>
          {/* Use RippleButton for press / ripple micro-interaction. */}
          {/* Tailwind handles color/scale transitions; Framer Motion is optional for advanced physics. */}
          <RippleButton
            href={waLink}
            className="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-xl !bg-[#f5f1e6] !text-[#111319] border border-black/10 transition-transform duration-150 active:translate-y-0.5 no-custom-btn"
            aria-label={`Contactar por WhatsApp sobre ${p.name}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
            </svg>
          </RippleButton>
        </div>
      </div>
    </article>
  );
}
