"use client"

import React from 'react'
import Link from 'next/link'
import { Package, MagnifyingGlass, ArrowRight } from 'phosphor-react'

const dashboardCards = [
  {
    title: 'Productos',
    description: 'Gestioná productos, imágenes y precios del catálogo.',
    href: '/admin/productos',
    icon: Package,
    accent: 'from-amber-500/20 to-orange-600/10',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
  {
    title: 'Ver catálogo',
    description: 'Abrir el sitio público del catálogo.',
    href: '/',
    icon: MagnifyingGlass,
    accent: 'from-emerald-500/20 to-teal-600/10',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    external: true,
  },
]

export default function AdminDashboard() {
  return (
    <div className="w-full max-w-2xl md:max-w-4xl xl:max-w-5xl mx-auto space-y-6 md:space-y-12 xl:space-y-16">
      <div className="admin-premium-card admin-animate-in admin-stagger-0 px-5 py-4 md:px-10 md:py-8 xl:px-12 xl:py-10 rounded-xl opacity-0">
        <div className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs md:text-[10px] uppercase tracking-widest text-white/70">
          Consola de administración
        </div>
        <h1 className="mt-4 md:mt-5 xl:mt-6 text-xl md:text-2xl xl:text-3xl font-semibold tracking-tight text-white">
          Panel de Administración
        </h1>
        <p className="mt-2 md:mt-2 xl:mt-2.5 text-base md:text-sm text-white/60">
          Elegí una opción para gestionar el catálogo o ver el sitio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-8 lg:gap-10 xl:gap-14">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon
          const content = (
            <>
              <div className={`flex h-12 w-12 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
                <Icon size={24} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base md:text-sm font-semibold text-white">{card.title}</h2>
                <p className="mt-1 text-sm md:text-xs text-white/65 leading-snug">{card.description}</p>
              </div>
              <div className="flex shrink-0 items-center text-white/50 group-hover:translate-x-0.5 transition-transform duration-200">
                <ArrowRight size={22} weight="bold" />
              </div>
            </>
          )
          const className = `admin-premium-card admin-animate-slide-up admin-card-hover admin-stagger-${index + 1} group flex items-center gap-4 md:gap-3 p-5 md:p-6 lg:p-7 xl:p-8 rounded-xl opacity-0 hover:border-white/20 ${card.accent} min-h-[72px] md:min-h-0`
          if (card.external) {
            return (
              <a
                key={card.href}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            )
          }
          return (
            <Link key={card.href} href={card.href} className={className}>
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
