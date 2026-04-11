"use client";
import React, { useState } from "react";
import Image from "next/image";
import MenuDrawer from "./MenuDrawer";
import useScrollColor from "../hooks/useScrollColor";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrollColor(12);

  // We toggle a `scrolled` class for a smooth color/contrast change on scroll.
  // Implementation uses Tailwind's `transition-colors duration-300` to interpolate
  // between background opacities. For more advanced scroll-driven motion, use
  // Framer Motion's `useViewportScroll` and `useTransform`.

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b h-14 flex items-center px-4 transition-colors duration-300 ${
        scrolled
          ? "bg-white dark:bg-black shadow-sm border-gray-200 dark:border-neutral-800 bg-accent-gradient"
          : "bg-white/90 dark:bg-black/90 border-transparent"
      }`}>
        <button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className="no-custom-btn w-10 h-10 flex items-center justify-center rounded-md border-0 bg-transparent shadow-none text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
            <a href="/" aria-label="Inicio" className="inline-block">
            <Image src="/images/logo/logo-fondo-oscuro.PNG" alt="La Guarida" width={1800} height={450} priority quality={82} className="object-contain block h-auto max-h-9 w-auto" style={{ height: 'auto' }} sizes="180px" />
          </a>
        </div>

        <div className="ml-auto w-10 h-10" />
      </header>

      <MenuDrawer open={open} setOpen={setOpen} />
    </>
  );
}
