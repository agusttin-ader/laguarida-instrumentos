'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'

const PREVIEW_IMAGE_SIZES =
  '(max-width: 768px) 46vw, (max-width: 1535px) 33vw, (max-width: 2559px) min(28vw, 520px), min(26vw, 600px)'

export default function ProductPreviewCard({ item, priority = false }) {
  const p = normalizeProduct(item)
  const main = imageService.resolve(p.image_url)
  const src =
    (main && (imageService.forDisplay(main, 'card') || main)) ||
    (typeof p.image_url === 'string' ? p.image_url.trim() : '')
  const href = p.slug ? `/guitars/${encodeURIComponent(p.slug)}` : '#'
  const title = p.name || 'Instrumento'
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <article className="home-preview-card flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border-0 bg-[var(--dark-bg-card)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:rounded-3xl">
      <Link href={href} className="relative block aspect-square w-full min-h-0 overflow-hidden bg-[var(--dark-surface-2)]">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes={PREVIEW_IMAGE_SIZES}
            quality={72}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`img-reveal object-cover object-center transform-gpu [backface-visibility:hidden] ${imgLoaded ? 'img-loaded' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--dark-surface-2)]">
            <span className="text-2xl opacity-40" aria-hidden>
              {'\u{1F3B8}'}
            </span>
          </div>
        )}
      </Link>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 p-2.5">
        <Link
          href={href}
          className="min-h-0 break-words text-left text-[13px] font-semibold leading-snug text-[var(--dark-text-primary)] line-clamp-2 hover:text-[var(--vintage-gold)]"
        >
          {title}
        </Link>
        {p.price ? (
          <p className="text-xs font-semibold text-[var(--vintage-gold)]">{p.price}</p>
        ) : null}
        <Link
          href={href}
          className="mt-auto text-left text-xs font-semibold text-[var(--dark-muted)] hover:text-[var(--vintage-gold)]"
        >
          Ver
        </Link>
      </div>
    </article>
  )
}
