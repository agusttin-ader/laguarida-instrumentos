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
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="admin-premium-card admin-animate-in admin-stagger-0 px-4 py-3 md:px-5 md:py-4 rounded-xl opacity-0">
        <div className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-widest text-white/70">
          Consola de administración
        </div>
        <h1 className="mt-2 text-lg font-semibold tracking-tight text-white md:text-xl">
          Panel de Administración
        </h1>
        <p className="mt-0.5 text-sm text-white/60">
          Elegí una opción para gestionar el catálogo o ver el sitio.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon
          const content = (
            <>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
                <Icon size={22} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-white">{card.title}</h2>
                <p className="mt-0.5 text-xs text-white/65 leading-snug">{card.description}</p>
              </div>
              <div className="flex shrink-0 items-center text-white/50 group-hover:translate-x-0.5 transition-transform duration-200">
                <ArrowRight size={18} weight="bold" />
              </div>
            </>
          )
          const className = `admin-premium-card admin-animate-slide-up admin-card-hover admin-stagger-${index + 1} group flex items-center gap-3 p-3.5 rounded-xl opacity-0 hover:border-white/20 ${card.accent}`
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
