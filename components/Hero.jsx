"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ScrollReveal from './ScrollReveal'
import { Info } from 'phosphor-react'

export default function Hero(){
  const HERO_PRODUCT = { slug: 'fender-american-vintage-59-2015', name: 'Fender American Vintage 59 (2015)' }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-0 container-tight">
      {/* Left column: light gray background, big title, CTA (matches image height) */}
      <ScrollReveal>
        <div className="relative w-full max-w-[540px] rounded overflow-hidden subtle-border bg-gray-50 dark:bg-[#1e1e22] hero-aspect">
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center">
            <h2 className="display-xl tight-tracking hero-title">{HERO_PRODUCT.name}</h2>
            <p className="mt-3 subtitle-compact muted-text hero-subtitle">Strat Vintage · Alder · Nitro 3T Sunburst</p>
            <div className="mt-6 flex flex-col items-start gap-3">
              <Link href={`/guitars/${HERO_PRODUCT.slug}`} className="btn-minimal btn-focus">Descubrir</Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('about-section')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="btn-info btn-focus flex items-center gap-2"
              >
                <Info size={18} weight="bold" />
                Sobre la guarida
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Center: tall image (hero) */}
      <ScrollReveal>
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[540px] rounded overflow-hidden transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-md hero-aspect">
            <Image src="/images/hero-image-home-2.jpg" alt="Guitarra - La Clásica" fill style={{objectFit: 'cover', objectPosition: 'center'}} quality={100} priority sizes="(min-width:1024px) 540px, 100vw" />
          </div>
        </div>
      </ScrollReveal>

      {/* Right: lighter dark panel, price and concise copy */}
      <ScrollReveal>
        <div className="relative w-full max-w-[540px] rounded overflow-hidden hero-right hero-aspect">
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center text-right text-white">
              <div className="price-large hero-price">U$S 2,990</div>
            <p className="mt-3 subtitle-compact text-white/60 hero-subtitle">Ingreso 2025 · Strat Vintage</p>
            <p className="mt-6 hero-copy text-white leading-7">Strat Vintage 2015 en perfecto estado. Mástil Arce D-shape · trastera Arce · 3 pickups Vintage 59’.</p>
            <div className="mt-8 flex justify-end">
              <a
                href={`https://wa.me/541168696491?text=${encodeURIComponent(`Hola me interesa la ${HERO_PRODUCT.name}, me podrias dar mas info?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost-dark btn-focus"
              >
                Pedir info
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
